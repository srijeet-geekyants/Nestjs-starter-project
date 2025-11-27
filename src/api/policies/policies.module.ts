import { Module } from '@nestjs/common';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { PoliciesRepository } from './repository/policies.repository';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@bg/constants/job.constant';
import { UsersModule } from '../users/users.module';
import { MetricsModule } from '@metrics/metrics.module';
import { LoggerModule } from '@logger/logger.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.WEBHOOK_DISPATCH,
    }),
    UsersModule,
    MetricsModule,
    LoggerModule,
  ],
  controllers: [PoliciesController],
  providers: [PoliciesService, PoliciesRepository],
  exports: [PoliciesService],
})
export class PoliciesModule {}
