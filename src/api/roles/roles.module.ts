import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './repository/roles.repository';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@bg/constants/job.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.WEBHOOK_DISPATCH,
    }),
  ],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesRepository],
})
export class RolesModule {}
