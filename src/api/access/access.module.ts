import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { PoliciesModule } from '../policies/policies.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@bg/constants/job.constant';

@Module({
  imports: [
    PoliciesModule,
    BullModule.registerQueue({
      name: QueueName.AUDIT_INSERT,
    }),
  ],
  controllers: [AccessController],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
