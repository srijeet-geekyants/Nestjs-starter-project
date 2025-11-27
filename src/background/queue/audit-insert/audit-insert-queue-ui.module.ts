import { QueueName } from '@bg/constants/job.constant';
import { AuditInsertQueueEvents } from './audit-insert-queue.events';
import { AuditInsertQueue } from './audit-insert-queue';
import { BullModule } from '@nestjs/bullmq';
import { Injectable, Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Injectable()
export class AuditInsertQueueConfig {
  static getQueueConfig() {
    return BullModule.registerQueue({
      name: QueueName.AUDIT_INSERT,
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
      name: QueueName.AUDIT_INSERT,
      adapter: BullMQAdapter,
      options: {
        readOnlyMode: process.env['NODE_ENV'] === 'production' || false,
        displayName: 'Audit Insert Queue',
        description: 'Queue for inserting audit logs asynchronously',
      },
    });
  }
}

@Module({
  imports: [AuditInsertQueueConfig.getQueueConfig(), AuditInsertQueueConfig.getQueueUIConfig()],
  providers: [AuditInsertQueueEvents, AuditInsertQueue],
  exports: [AuditInsertQueue],
})
export class AuditInsertQueueUIModule {}
