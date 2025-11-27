import { QueueName } from '@bg/constants/job.constant';
import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

@QueueEventsListener(QueueName.POLICY_EVALUATE)
export class PolicyEvaluateQueueEvents extends QueueEventsHost {
  private readonly logger = new Logger(PolicyEvaluateQueueEvents.name);

  @OnQueueEvent('added')
  onAdded(job: { jobId: string; name: string }) {
    this.logger.debug(
      `Policy evaluation job ${job.jobId} of type ${job.name} has been added to the queue`
    );
  }

  @OnQueueEvent('waiting')
  onWaiting(job: { jobId: string; prev?: string }) {
    this.logger.debug(`Policy evaluation job ${job.jobId} is waiting`);
  }

  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    this.logger.debug(
      `Policy evaluation job ${job.jobId} is now active; previous status was ${job.prev}`
    );
  }

  @OnQueueEvent('completed')
  onCompleted(job: { jobId: string; returnvalue: string }) {
    this.logger.debug(
      `Policy evaluation job ${job.jobId} has been completed with result: ${job.returnvalue}`
    );
  }

  @OnQueueEvent('failed')
  onFailed(job: { jobId: string; failedReason: string; prev?: string }) {
    this.logger.error(
      `Policy evaluation job ${job.jobId} has failed with reason: ${job.failedReason}; previous status was ${job.prev}`
    );
  }

  @OnQueueEvent('retries-exhausted')
  onRetriesExhausted(job: { jobId: string; attemptsMade: number }) {
    this.logger.error(
      `Policy evaluation job ${job.jobId} has exhausted its maximum retries with attempts ${job.attemptsMade}`
    );
  }
}
