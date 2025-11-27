import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { JobName, QueueName } from '../../constants/job.constant';
import { Logger } from '@nestjs/common';
import { WebhookDispatchQueueService } from './webhook-dispatch-queue.service';
import { DeadLetterQueueService } from '../dead-letter/dead-letter-queue.service';
import { IWebhookDispatchJob } from '../../interfaces/job.interface';
import { Job } from 'bullmq';

@Processor(QueueName.WEBHOOK_DISPATCH, {
  concurrency: 5,
  drainDelay: 300,
  stalledInterval: 300000,
  maxStalledCount: 3,
  limiter: {
    max: 20,
    duration: 1000,
  },
})
export class WebhookDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDispatchProcessor.name);
  constructor(
    private readonly webhookDispatchQueueService: WebhookDispatchQueueService,
    private readonly dlqService: DeadLetterQueueService
  ) {
    super();
  }

  async process(job: Job<IWebhookDispatchJob, any, string>, _token?: string): Promise<any> {
    const logString = `Processing webhook dispatch job ${job.id} of type ${job.name} for tenant ${job.data.tenantId}, endpoint ${job.data.endpointId}, event ${job.data.eventType}...`;
    this.logger.debug(logString, 'WebhookDispatchProcessor');
    if (typeof job.log === 'function') job.log(logString);

    try {
      let result;
      switch (job.name) {
        case JobName.WEBHOOK_DISPATCH:
          result = await this.webhookDispatchQueueService.dispatchWebhook(job.data);
          break;
        default:
          throw new Error(`Unknown job name: ${job.name}`);
      }

      const successLog = `Completed webhook dispatch job ${job.id} of type ${job.name} with result: ${JSON.stringify(result)}`;
      this.logger.debug(successLog, 'WebhookDispatchProcessor');
      if (typeof job.log === 'function') job.log(successLog);

      return result;
    } catch (error) {
      const errorLog = `Failed to process webhook dispatch job ${job.id} of type ${job.name} with error: ${(error as Error)?.message}`;
      this.logger.error(errorLog, (error as Error)?.stack, 'WebhookDispatchProcessor');
      if (typeof job.log === 'function') job.log(errorLog);
      throw error;
    }
  }

  @OnWorkerEvent('active')
  async onActive(job: Job) {
    this.logger.debug(`Webhook dispatch job ${job.id} is now active`);
    if (typeof job.log === 'function') job.log(`Webhook dispatch job ${job.id} is now active`);
  }

  @OnWorkerEvent('progress')
  async onProgress(job: Job) {
    this.logger.debug(`Webhook dispatch job ${job.id} is ${job.progress}% complete`);
    if (typeof job.log === 'function')
      job.log(`Webhook dispatch job ${job.id} is ${job.progress}% complete`);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    this.logger.debug(`Webhook dispatch job ${job.id} has been completed`);
    if (typeof job.log === 'function')
      job.log(`Webhook dispatch job ${job.id} has been completed`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job) {
    const logString = `Webhook dispatch job ${job.id} has failed with reason: ${job?.failedReason}`;
    this.logger.error(logString);
    this.logger.error(job?.stacktrace);
    if (typeof job.log === 'function') job.log(logString);

    // Push the failed job to the Dead Letter Queue
    await this.dlqService.addFailedJobToDLQ({
      originalQueueName: QueueName.WEBHOOK_DISPATCH,
      originalJobId: job.id || '',
      originalJobName: job.name,
      originalJobData: job.data,
      failedReason: job?.failedReason,
      stacktrace: job?.stacktrace,
      timestamp: Date.now(),
    });
  }

  @OnWorkerEvent('stalled')
  async onStalled(job: Job) {
    this.logger.error(`Webhook dispatch job ${job.id} has been stalled`);
    if (typeof job.log === 'function') job.log(`Webhook dispatch job ${job.id} has been stalled`);

    // Considering stalled jobs to DLQ if they are consistently stalling
    await this.dlqService.addFailedJobToDLQ({
      originalQueueName: QueueName.WEBHOOK_DISPATCH,
      originalJobId: job.id || '',
      originalJobName: job.name,
      originalJobData: job.data,
      failedReason: `Job stalled for too long. Current attempts: ${job?.attemptsMade}`,
      timestamp: Date.now(),
    });
  }

  @OnWorkerEvent('error')
  async onError(job: Job, error: Error) {
    const logString = `Webhook dispatch job ${job.id} has failed with worker error: ${error.message}`;
    this.logger.error(logString);
    if (typeof job.log === 'function') job.log(logString);

    // Errors to DLQ as well
    await this.dlqService.addFailedJobToDLQ({
      originalQueueName: QueueName.WEBHOOK_DISPATCH,
      originalJobId: job.id || '',
      originalJobName: job.name,
      originalJobData: job.data,
      failedReason: `Processor error: ${error.message}`,
      stacktrace: error.stack ? error.stack.split('\n') : [],
      timestamp: Date.now(),
    });
  }
}
