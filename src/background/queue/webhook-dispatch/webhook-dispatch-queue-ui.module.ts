import { QueueName } from '@bg/constants/job.constant';
import { WebhookDispatchQueueEvents } from './webhook-dispatch-queue.events';
import { WebhookDispatchQueue } from './webhook-dispatch-queue';
import { BullModule } from '@nestjs/bullmq';
import { Injectable, Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Injectable()
export class WebhookDispatchQueueConfig {
  static getQueueConfig() {
    return BullModule.registerQueue({
      name: QueueName.WEBHOOK_DISPATCH,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: {
          age: 1 * 24 * 3600, // Keep for 1 day
        },
      },
    });
  }

  static getQueueUIConfig() {
    return BullBoardModule.forFeature({
      name: QueueName.WEBHOOK_DISPATCH,
      adapter: BullMQAdapter,
      options: {
        readOnlyMode: process.env['NODE_ENV'] === 'production' || false,
        displayName: 'Webhook Dispatch Queue',
        description: 'Queue for dispatching webhooks to external endpoints asynchronously',
      },
    });
  }
}

@Module({
  imports: [WebhookDispatchQueueConfig.getQueueConfig(), WebhookDispatchQueueConfig.getQueueUIConfig()],
  providers: [WebhookDispatchQueueEvents, WebhookDispatchQueue],
  exports: [WebhookDispatchQueue],
})
export class WebhookDispatchQueueUIModule {}
