import { JobName, QueueName } from '@bg/constants/job.constant';
import { IPolicyEvaluateJob } from '@bg/interfaces/job.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class PolicyEvaluateQueue {
  private readonly logger = new Logger(PolicyEvaluateQueue.name);

  constructor(@InjectQueue(QueueName.POLICY_EVALUATE) private policyEvaluateQueue: Queue) {}

  async addPolicyEvaluateJob(data: IPolicyEvaluateJob): Promise<void> {
    this.logger.debug(
      `Adding policy evaluation job for tenant ${data.tenantId}, user ${data.userId}, resource ${data.resource}, action ${data.action} (requestId: ${data.requestId})`
    );
    await this.policyEvaluateQueue.add(JobName.POLICY_EVALUATE, data);
  }
}
