import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { PoliciesModule } from '../policies/policies.module';
import { AuditInsertQueueUIModule } from '@bg/queue/audit-insert/audit-insert-queue-ui.module';
import { MetricsModule } from '@metrics/metrics.module';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [
    PoliciesModule,
    AuditInsertQueueUIModule,
    MetricsModule,
    LoggerModule,
  ],
  controllers: [AccessController],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
