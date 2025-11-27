import { Injectable, Inject, Logger } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { UsersRepository } from '../../../api/users/repository/users.repository';
import { REDIS_CLIENT } from '../../../redis/redis.provider';
import { Redis } from 'ioredis';
import { IPolicyEvaluateJob } from '@bg/interfaces/job.interface';

@Injectable()
export class PolicyEvaluateQueueService {
  private readonly logger = new Logger(PolicyEvaluateQueueService.name);
  private readonly CACHE_TTL = 120; // 120 seconds (2 minutes) - configurable

  constructor(
    private readonly dbService: DBService,
    private readonly usersRepository: UsersRepository,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis
  ) {}

  async evaluatePolicy(data: IPolicyEvaluateJob): Promise<{ allowed: boolean }> {
    try {
      // 1. Check Redis cache first
      const cacheKey = this.getCacheKey(data.tenantId, data.userId, data.resource, data.action);
      const cachedResult = await this.redisClient.get(cacheKey);

      if (cachedResult) {
        this.logger.debug(
          `Cache hit for policy evaluation: ${cacheKey} (requestId: ${data.requestId})`
        );
        return JSON.parse(cachedResult);
      }

      this.logger.debug(
        `Evaluating policy for tenant ${data.tenantId}, user ${data.userId}, resource ${data.resource}, action ${data.action} (requestId: ${data.requestId})`
      );

      // 2. Load user's roles
      const userWithRoles = await this.usersRepository.getRoles(data.userId, data.tenantId);

      // Ensure all roles belong to same tenantId (safety check)
      const roleIds = userWithRoles.user_roles
        .filter(ur => ur.roles) // Filter out any null roles
        .map(ur => ur.role_id);

      if (roleIds.length === 0) {
        // No roles assigned - deny access
        const result = { allowed: false };
        await this.cacheResult(cacheKey, result);
        return result;
      }

      // 3. Collect base permissions
      const rolePermissions = await this.dbService.role_permissions.findMany({
        where: {
          role_id: { in: roleIds },
        },
        include: {
          permissions: {
            select: {
              code: true,
            },
          },
        },
      });

      // 4. Extract unique permission codes
      const permissionCodes = new Set<string>(rolePermissions.map(rp => rp.permissions.code));

      // 5. Check base permission
      const requiredPermission = `${data.resource}.${data.action}`;
      const hasRolePermission = permissionCodes.has(requiredPermission);

      // If NO base permission → DENY without policy evaluation
      if (!hasRolePermission) {
        this.logger.debug(
          `User ${data.userId} does not have base permission ${requiredPermission} (requestId: ${data.requestId})`
        );
        const result = { allowed: false };
        await this.cacheResult(cacheKey, result);
        return result;
      }

      // 6. Load active policies for (tenantId, resource, action)
      const policies = await this.dbService.policies.findMany({
        where: {
          tenant_id: data.tenantId,
          resource: data.resource,
          action: data.action,
          active: true,
        },
      });

      // 7. Evaluate policies
      const context = { ...data.context, userId: data.userId };
      const matchedAllowPolicies: string[] = [];
      const matchedDenyPolicies: string[] = [];

      for (const policy of policies) {
        // Validate policy effect (defensive check)
        if (policy.effect !== 'ALLOW' && policy.effect !== 'DENY') {
          this.logger.warn(
            `Invalid policy effect '${policy.effect}' for policy ${policy.id}, skipping (requestId: ${data.requestId})`
          );
          continue;
        }

        if (this.evaluateCondition(policy.condition as any, context)) {
          if (policy.effect === 'DENY') {
            matchedDenyPolicies.push(policy.id);
          } else if (policy.effect === 'ALLOW') {
            matchedAllowPolicies.push(policy.id);
          }
        }
      }

      // 8. Decision logic
      let allowed: boolean;

      // DENY overrides everything
      if (matchedDenyPolicies.length > 0) {
        allowed = false;
        this.logger.debug(
          `DENY policy matched for user ${data.userId} (policies: ${matchedDenyPolicies.join(', ')}) (requestId: ${data.requestId})`
        );
      } else if (matchedAllowPolicies.length > 0) {
        // ALLOW policy matched
        allowed = true;
        this.logger.debug(
          `ALLOW policy matched for user ${data.userId} (policies: ${matchedAllowPolicies.join(', ')}) (requestId: ${data.requestId})`
        );
      } else {
        // No policies matched, but base permission exists → ALLOW
        allowed = true;
        this.logger.debug(
          `No policies matched, but base permission exists for user ${data.userId} (requestId: ${data.requestId})`
        );
      }

      const result = { allowed };

      // 9. Cache result
      await this.cacheResult(cacheKey, result);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to evaluate policy for tenant ${data.tenantId}, user ${data.userId}: ${(error as Error)?.message}`,
        (error as Error)?.stack
      );
      // On error, default to DENY for security
      return { allowed: false };
    }
  }

  /**
   * Evaluate a policy condition against context
   * Supports: field + op, AND, OR conditions
   */
  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    // Handle simple condition
    if (condition.field && condition.op) {
      const fieldValue = context[condition.field];
      const compareValue = condition.valueFrom ? context[condition.valueFrom] : condition.value;

      switch (condition.op) {
        case '==':
          return fieldValue === compareValue;
        case '!=':
          return fieldValue !== compareValue;
        case '>':
          return fieldValue > compareValue;
        case '<':
          return fieldValue < compareValue;
        case '>=':
          return fieldValue >= compareValue;
        case '<=':
          return fieldValue <= compareValue;
        default:
          return false;
      }
    }

    // Handle AND condition
    if (condition.and && Array.isArray(condition.and)) {
      return condition.and.every((c: any) => this.evaluateCondition(c, context));
    }

    // Handle OR condition
    if (condition.or && Array.isArray(condition.or)) {
      return condition.or.some((c: any) => this.evaluateCondition(c, context));
    }

    return false;
  }

  /**
   * Generate Redis cache key for policy decision
   */
  private getCacheKey(tenantId: string, userId: string, resource: string, action: string): string {
    return `ac:decision:${tenantId}:${userId}:${resource}:${action}`;
  }

  /**
   * Cache the policy evaluation result in Redis
   */
  private async cacheResult(cacheKey: string, result: { allowed: boolean }): Promise<void> {
    try {
      await this.redisClient.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));
      this.logger.debug(`Cached policy decision: ${cacheKey} (TTL: ${this.CACHE_TTL}s)`);
    } catch (error) {
      // Log error but don't fail the evaluation
      this.logger.warn(
        `Failed to cache policy decision for ${cacheKey}: ${(error as Error)?.message}`
      );
    }
  }
}
