import { JobName, QueueName } from '@bg/constants/job.constant';
import { IWebhookDispatchJob } from '@bg/interfaces/job.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class WebhookDispatchQueue {
  private readonly logger = new Logger(WebhookDispatchQueue.name);

  constructor(@InjectQueue(QueueName.WEBHOOK_DISPATCH) private webhookDispatchQueue: Queue) {}

  async addWebhookDispatchJob(data: IWebhookDispatchJob): Promise<void> {
    this.logger.debug(
      `Adding webhook dispatch job for tenant ${data.tenantId}, endpoint ${data.endpointId}, event ${data.eventType}`
    );
    await this.webhookDispatchQueue.add(JobName.WEBHOOK_DISPATCH, data);
  }
}
