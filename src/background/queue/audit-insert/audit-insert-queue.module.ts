import { Module } from '@nestjs/common';
import { DeadLetterQueueModule } from '../dead-letter/dead-letter-queue.module';
import { AuditInsertProcessor } from './audit-insert.processor';
import { AuditInsertQueueService } from './audit-insert-queue.service';
import { DBModule } from '../../../db/db.module';
import { MetricsModule } from '../../../api/metrics/metrics.module';

@Module({
  imports: [DBModule, DeadLetterQueueModule, MetricsModule],
  providers: [AuditInsertProcessor, AuditInsertQueueService],
})
export class AuditInsertQueueModule {}
