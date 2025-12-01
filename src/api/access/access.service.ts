import { Injectable } from '@nestjs/common';
import { PoliciesService } from '../policies/policies.service';
import { EvaluatePolicyDto } from '../policies/dto/evaluate-policy.dto';
import { EvaluatePolicyResponseDto } from '../policies/dto/evaluate-policy-response.dto';
import { CheckAccessDto } from './dto/check-access.dto';
import { CheckAccessResponseDto } from './dto/check-access-response.dto';
import { AuditInsertQueue } from '@bg/queue/audit-insert/audit-insert-queue';
import { MetricsService } from '@metrics/metrics.service';
import { LoggerService } from '@logger/logger.service';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AccessService {
  constructor(
    private readonly policiesService: PoliciesService,
    private readonly auditInsertQueue: AuditInsertQueue,
    private readonly metricsService: MetricsService,
    private readonly logger: LoggerService
  ) {}

  async evaluateAccess(
    tenantId: string,
    evaluatePolicyDto: EvaluatePolicyDto
  ): Promise<EvaluatePolicyResponseDto> {
    return this.policiesService.evaluateAccess(tenantId, evaluatePolicyDto);
  }

  async checkAccess(
    tenantId: string,
    userId: string,
    checkAccessDto: CheckAccessDto,
    isPreviewMode: boolean = false,
    requestId?: string
  ): Promise<CheckAccessResponseDto> {
    // Generate requestId if not provided
    const reqId = requestId || uuidv4();

    // Start OpenTelemetry span for access check
    const tracer = trace.getTracer('access-service');
    const span = tracer.startSpan('access.check', {
      attributes: {
        'tenant.id': tenantId,
        'user.id': userId,
        resource: checkAccessDto.resource,
        action: checkAccessDto.action,
        'request.id': reqId,
        'preview.mode': isPreviewMode.toString(),
      },
    });

    try {
      // Evaluate access synchronously
      const evaluateDto: EvaluatePolicyDto = {
        userId,
        resource: checkAccessDto.resource,
        action: checkAccessDto.action,
        context: checkAccessDto.context,
      };

      const evaluationResult = await this.policiesService.evaluateAccess(tenantId, evaluateDto);

      // Increment access decision metric (for both preview and real mode)
      this.metricsService.incrementAccessDecision(
        tenantId,
        checkAccessDto.resource,
        checkAccessDto.action,
        evaluationResult.allowed
      );

      // Structured logging for access check
      const logMessage = JSON.stringify({
        tenantId,
        userId,
        resource: checkAccessDto.resource,
        action: checkAccessDto.action,
        allowed: evaluationResult.allowed,
        requestId: reqId,
      });
      this.logger.log(logMessage, 'AccessService');

      // Enqueue audit log if:
      // 1. log is not explicitly false
      // 2. NOT in preview mode (preview mode never creates audit logs)
      if (checkAccessDto.log !== false && !isPreviewMode) {
        await this.enqueueAuditLog(tenantId, userId, checkAccessDto, evaluationResult.allowed);
      }

      span.setAttributes({
        'access.allowed': evaluationResult.allowed.toString(),
      });
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      return {
        allowed: evaluationResult.allowed,
      };
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.end();
      throw error;
    }
  }

  private async enqueueAuditLog(
    tenantId: string,
    userId: string,
    checkAccessDto: CheckAccessDto,
    allowed: boolean
  ): Promise<void> {
    try {
      await this.auditInsertQueue.addAuditInsertJob({
        tenantId,
        userId,
        resource: checkAccessDto.resource,
        action: checkAccessDto.action,
        allowed,
        context: checkAccessDto.context,
      });
    } catch (error) {
      console.error('Failed to enqueue audit log:', error);
    }
  }
}
