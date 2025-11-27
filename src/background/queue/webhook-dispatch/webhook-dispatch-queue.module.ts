import { Module } from '@nestjs/common';
import { DeadLetterQueueModule } from '../dead-letter/dead-letter-queue.module';
import { WebhookDispatchProcessor } from './webhook-dispatch.processor';
import { WebhookDispatchQueueService } from './webhook-dispatch-queue.service';
import { DBModule } from '../../../db/db.module';
import { MetricsModule } from '../../../api/metrics/metrics.module';
import { WebhookDispatchQueue } from './webhook-dispatch-queue';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@bg/constants/job.constant';

@Module({
  imports: [
    DBModule,
    DeadLetterQueueModule,
    MetricsModule,
    BullModule.registerQueue({
      name: QueueName.WEBHOOK_DISPATCH,
    }),
  ],
  providers: [WebhookDispatchProcessor, WebhookDispatchQueueService, WebhookDispatchQueue],
  exports: [WebhookDispatchQueue],
})
export class WebhookDispatchQueueModule {}
