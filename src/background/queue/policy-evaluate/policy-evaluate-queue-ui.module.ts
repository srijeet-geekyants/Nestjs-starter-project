import { QueueName } from '@bg/constants/job.constant';
import { PolicyEvaluateQueueEvents } from './policy-evaluate-queue.events';
import { PolicyEvaluateQueue } from './policy-evaluate.queue';
import { BullModule } from '@nestjs/bullmq';
import { Injectable, Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Injectable()
export class PolicyEvaluateQueueConfig {
  static getQueueConfig() {
    return BullModule.registerQueue({
      name: QueueName.POLICY_EVALUATE,
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
      name: QueueName.POLICY_EVALUATE,
      adapter: BullMQAdapter,
      options: {
        readOnlyMode: process.env['NODE_ENV'] === 'production' || false,
        displayName: 'Policy Evaluate Queue',
        description: 'Queue for evaluating access control policies and caching decisions',
      },
    });
  }
}

@Module({
  imports: [
    PolicyEvaluateQueueConfig.getQueueConfig(),
    PolicyEvaluateQueueConfig.getQueueUIConfig(),
  ],
  providers: [PolicyEvaluateQueueEvents, PolicyEvaluateQueue],
  exports: [PolicyEvaluateQueue],
})
export class PolicyEvaluateQueueUIModule {}
