import { CronModule } from '@cron/cron.module';
import { EmailQueueModule } from '@email-queue/email-queue.module';
import { NotificationQueueModule } from '@notification-queue/notification-queue.module';
import { DeadLetterQueueModule } from '@dead-letter-queue/dead-letter-queue.module';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_LIST } from '@bg/constants/job.constant';
import { PolicyEvaluateQueueModule } from './queue/policy-evaluate/policy-evaluate-queue.module';
import { AuditInsertQueueModule } from './queue/audit-insert/audit-insert-queue.module';
import { WebhookDispatchQueueModule } from './queue/webhook-dispatch/webhook-dispatch-queue.module';

@Module({
  imports: [
    BullModule.registerQueue(...QUEUE_LIST.map(name => ({ name }))),
    EmailQueueModule,
    NotificationQueueModule,
    DeadLetterQueueModule,
    CronModule,
    PolicyEvaluateQueueModule,
    AuditInsertQueueModule,
    WebhookDispatchQueueModule,
  ],
})
export class BackgroundModule {}
