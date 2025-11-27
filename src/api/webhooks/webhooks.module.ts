import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { DBModule } from '@db/db.module';
import { WebhookDispatchQueueUIModule } from '@bg/queue/webhook-dispatch/webhook-dispatch-queue-ui.module';

@Module({
  imports: [DBModule, WebhookDispatchQueueUIModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
