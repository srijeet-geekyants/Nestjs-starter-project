import { Module } from '@nestjs/common';
import { RedisModule } from '../../../redis/redis.module';
import { UsersModule } from '../../../api/users/users.module';
import { DeadLetterQueueModule } from '../dead-letter/dead-letter-queue.module';
import { PolicyEvaluateProcessor } from '../policy-evaluate/policy-evaluate.processor';
import { PolicyEvaluateQueueService } from '../policy-evaluate/policy-evaluate-queue.service';

@Module({
  imports: [RedisModule, UsersModule, DeadLetterQueueModule],
  providers: [PolicyEvaluateProcessor, PolicyEvaluateQueueService],
})
export class PolicyEvaluateQueueModule {}
