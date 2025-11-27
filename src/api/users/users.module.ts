import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repository/users.repository';
import { RolesModule } from '../roles/roles.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueName } from '@bg/constants/job.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.WEBHOOK_DISPATCH,
    }),
    RolesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
