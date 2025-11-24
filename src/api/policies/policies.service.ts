import { Injectable } from '@nestjs/common';
import { PoliciesRepository } from './repository/policies.repository';
import { PolicyDto } from './dto/policy.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { EvaluatePolicyDto } from './dto/evaluate-policy.dto';
import { EvaluatePolicyResponseDto } from './dto/evaluate-policy-response.dto';
import { MatchedPolicyDto } from './dto/matched-policy.dto';
import { AccessSource } from '../../common/enums/access-source.enum';
import { v4 as uuidv4 } from 'uuid';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueName } from '@bg/constants/job.constant';
import { UsersRepository } from '../users/repository/users.repository';
import { DBService } from '@db/db.service';

@Injectable()
export class PoliciesService {
  constructor(
    private readonly policiesRepository: PoliciesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly dbService: DBService,
    @InjectQueue(QueueName.WEBHOOK_DISPATCH) private webhookQueue: Queue
  ) {}

  async createPolicy(createPolicyDto: CreatePolicyDto, tenantId: string): Promise<PolicyDto> {
    const policy = await this.policiesRepository.create({
      id: uuidv4(),
      name: createPolicyDto.name,
      resource: createPolicyDto.resource,
      action: createPolicyDto.action,
      effect: createPolicyDto.effect,
      condition: createPolicyDto.condition as any,
      active: true,
      created_at: new Date(),
      tenants: {
        connect: {
          id: tenantId,
        },
      },
    });

    // Dispatch webhook for policy.updated event
    await this.dispatchWebhook(tenantId, 'policy.updated', policy);

    return {
      id: policy.id,
      tenantId: policy.tenant_id,
      name: policy.name,
      resource: policy.resource,
      action: policy.action,
      effect: policy.effect,
      condition: policy.condition as any,
      active: policy.active,
      createdAt: policy.created_at || new Date(),
    };
  }

  async getPolicies(tenantId: string, active?: boolean): Promise<PolicyDto[]> {
    const policies = await this.policiesRepository.findAll(tenantId, active);
    return policies.map(policy => ({
      id: policy.id,
      tenantId: policy.tenant_id,
      name: policy.name,
      resource: policy.resource,
      action: policy.action,
      effect: policy.effect,
      condition: policy.condition as any,
      active: policy.active,
      createdAt: policy.created_at || new Date(),
    }));
  }

  async updatePolicy(
    tenantId: string,
    id: string,
    updatePolicyDto: UpdatePolicyDto
  ): Promise<PolicyDto> {
    // Verify policy exists and belongs to tenant
    await this.policiesRepository.findByIdAndTenantId(id, tenantId);

    // Prepare update data
    const updateData: any = {};
    if (updatePolicyDto.name !== undefined) {
      updateData.name = updatePolicyDto.name;
    }
    if (updatePolicyDto.condition !== undefined) {
      updateData.condition = updatePolicyDto.condition;
    }
    if (updatePolicyDto.active !== undefined) {
      updateData.active = updatePolicyDto.active;
    }

    // Update policy
    const updatedPolicy = await this.policiesRepository.update(id, updateData);

    // Dispatch webhook for policy.updated event
    await this.dispatchWebhook(tenantId, 'policy.updated', updatedPolicy);

    return {
      id: updatedPolicy.id,
      tenantId: updatedPolicy.tenant_id,
      name: updatedPolicy.name,
      resource: updatedPolicy.resource,
      action: updatedPolicy.action,
      effect: updatedPolicy.effect,
      condition: updatedPolicy.condition as any,
      active: updatedPolicy.active,
      createdAt: updatedPolicy.created_at || new Date(),
    };
  }

  async evaluateAccess(
    tenantId: string,
    evaluatePolicyDto: EvaluatePolicyDto
  ): Promise<EvaluatePolicyResponseDto> {
    // 1. Get user with roles
    const userWithRoles = await this.usersRepository.getRoles(evaluatePolicyDto.userId, tenantId);

    // 2. Get all role IDs from user
    const roleIds = userWithRoles.user_roles.map(ur => ur.role_id);

    // 3. Get all permissions for these roles
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
    const permissionCodes = rolePermissions
      .map(rp => rp.permissions.code)
      .filter((code, index, self) => self.indexOf(code) === index);

    // 5. Check if user has permission via role permissions
    const permissionCode = `${evaluatePolicyDto.resource}.${evaluatePolicyDto.action}`;
    const hasRolePermission = permissionCodes.includes(permissionCode);

    // 6. Get all active policies matching resource and action
    const policies = await this.policiesRepository.findByResourceAndAction(
      tenantId,
      evaluatePolicyDto.resource,
      evaluatePolicyDto.action
    );

    // 7. Evaluate conditions and collect matched policies
    const matchedPolicies: MatchedPolicyDto[] = [];
    const context = { ...evaluatePolicyDto.context, userId: evaluatePolicyDto.userId };

    for (const policy of policies) {
      // Validate policy effect (database constraint ensures only 'ALLOW' or 'DENY', but defensive check)
      if (policy.effect !== 'ALLOW' && policy.effect !== 'DENY') {
        // Skip invalid policies (should never happen due to DB constraint, but defensive)
        continue;
      }

      if (this.evaluateCondition(policy.condition as any, context)) {
        matchedPolicies.push({
          id: policy.id,
          effect: policy.effect,
        });
      }
    }

    // 8. Determine access and source
    const allowPolicies = matchedPolicies.filter(p => p.effect === 'ALLOW');
    const denyPolicies = matchedPolicies.filter(p => p.effect === 'DENY');

    let allowed = false;
    let source: AccessSource = AccessSource.DENY_NO_PERMISSION;

    if (hasRolePermission) {
      if (matchedPolicies.length > 0) {
        // Has role permission and policies matched
        // DENY policies take precedence
        if (denyPolicies.length > 0) {
          allowed = false;
          source = AccessSource.ROLE_AND_POLICY;
        } else if (allowPolicies.length > 0) {
          allowed = true;
          source = AccessSource.ROLE_AND_POLICY;
        } else {
          // Edge case: matchedPolicies exist but none are ALLOW/DENY (shouldn't happen due to validation above)
          // Fallback: user has role permission, so allow access
          allowed = true;
          source = AccessSource.ROLE_ONLY;
        }
      } else {
        // Has role permission but no policies matched
        allowed = true;
        source = AccessSource.ROLE_ONLY;
      }
    } else {
      // No role permission
      if (denyPolicies.length > 0) {
        allowed = false;
        source = AccessSource.ROLE_AND_POLICY;
      } else if (allowPolicies.length > 0) {
        allowed = true;
        source = AccessSource.ROLE_AND_POLICY;
      } else {
        allowed = false;
        source = AccessSource.DENY_NO_PERMISSION;
      }
    }

    return {
      allowed,
      source,
      matchedPolicies,
    };
  }

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

  private async dispatchWebhook(tenantId: string, eventType: string, payload: any): Promise<void> {
    try {
      await this.webhookQueue.add('webhook-dispatch', {
        tenantId,
        eventType,
        payload,
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to dispatch webhook:', error);
    }
  }
}
