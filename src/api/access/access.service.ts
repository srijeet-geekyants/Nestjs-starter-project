import { Injectable } from '@nestjs/common';
import { PoliciesService } from '../policies/policies.service';
import { EvaluatePolicyDto } from '../policies/dto/evaluate-policy.dto';
import { EvaluatePolicyResponseDto } from '../policies/dto/evaluate-policy-response.dto';
import { CheckAccessDto } from './dto/check-access.dto';
import { CheckAccessResponseDto } from './dto/check-access-response.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueName } from '@bg/constants/job.constant';

@Injectable()
export class AccessService {
  constructor(
    private readonly policiesService: PoliciesService,
    @InjectQueue(QueueName.AUDIT_INSERT) private auditQueue: Queue
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
    checkAccessDto: CheckAccessDto
  ): Promise<CheckAccessResponseDto> {
    // Evaluate access synchronously
    const evaluateDto: EvaluatePolicyDto = {
      userId,
      resource: checkAccessDto.resource,
      action: checkAccessDto.action,
      context: checkAccessDto.context,
    };

    const evaluationResult = await this.policiesService.evaluateAccess(
      tenantId,
      evaluateDto
    );

    // Enqueue audit log if log is not explicitly false
    if (checkAccessDto.log !== false) {
      await this.enqueueAuditLog(tenantId, userId, checkAccessDto, evaluationResult.allowed);
    }

    return {
      allowed: evaluationResult.allowed,
    };
  }

  private async enqueueAuditLog(
    tenantId: string,
    userId: string,
    checkAccessDto: CheckAccessDto,
    allowed: boolean
  ): Promise<void> {
    try {
      await this.auditQueue.add('audit-insert', {
        tenantId,
        userId,
        resource: checkAccessDto.resource,
        action: checkAccessDto.action,
        allowed,
        context: checkAccessDto.context,
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to enqueue audit log:', error);
    }
  }
}
