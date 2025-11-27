import { Injectable, Logger } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { IWebhookDispatchJob } from '@bg/interfaces/job.interface';
import { randomUUID } from 'crypto';
import { createHmac } from 'crypto';
import { MetricsService } from '@metrics/metrics.service';

@Injectable()
export class WebhookDispatchQueueService {
  private readonly logger = new Logger(WebhookDispatchQueueService.name);
  private readonly WEBHOOK_TIMEOUT = 10000; // 10 seconds timeout

  constructor(
    private readonly dbService: DBService,
    private readonly metricsService: MetricsService
  ) {}

  async dispatchWebhook(
    data: IWebhookDispatchJob
  ): Promise<{ deliveryId: string; status: string }> {
    try {
      // 1. Fetch webhook endpoint details
      const endpoint = await this.dbService.webhook_endpoints.findUnique({
        where: {
          id: data.endpointId,
          tenant_id: data.tenantId,
          active: true,
        },
      });

      if (!endpoint) {
        throw new Error(
          `Webhook endpoint ${data.endpointId} not found or inactive for tenant ${data.tenantId}`
        );
      }

      // 2. Create delivery record with PENDING status
      const deliveryId = randomUUID();
      await this.dbService.webhook_deliveries.create({
        data: {
          id: deliveryId,
          tenant_id: data.tenantId,
          endpoint_id: data.endpointId,
          event_type: data.eventType,
          payload: data.payload as any,
          status: 'PENDING',
          attempt_count: 0,
        },
      });

      // 3. Sign the payload
      const signature = this.generateSignature(JSON.stringify(data.payload), endpoint.secret);

      // 4. Dispatch webhook
      const response = await this.sendWebhook(endpoint.url, data.payload, signature);

      // 5. Update delivery record based on response
      const status = response.success ? 'SUCCESS' : 'FAILED';
      await this.dbService.webhook_deliveries.update({
        where: { id: deliveryId },
        data: {
          status,
          attempt_count: { increment: 1 },
          last_attempt_at: new Date(),
        },
      });

      // Increment webhook failure metric if failed
      if (!response.success) {
        this.metricsService.incrementWebhookFailure(data.tenantId, data.eventType);
      }

      this.logger.debug(
        `Successfully dispatched webhook ${deliveryId} to ${endpoint.url} for event ${data.eventType} (status: ${status})`
      );

      return { deliveryId, status };
    } catch (error) {
      // Increment webhook failure metric on error
      this.metricsService.incrementWebhookFailure(data.tenantId, data.eventType);

      this.logger.error(
        `Failed to dispatch webhook for tenant ${data.tenantId}, endpoint ${data.endpointId}: ${(error as Error)?.message}`,
        (error as Error)?.stack
      );
      throw error;
    }
  }

  /**
   * Generate HMAC SHA256 signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Send webhook HTTP POST request to endpoint
   */
  private async sendWebhook(
    url: string,
    payload: Record<string, any>,
    signature: string
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.WEBHOOK_TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': Date.now().toString(),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const success = response.ok; // 200-299 status codes
      const result: { success: boolean; statusCode?: number; error?: string } = {
        success,
        statusCode: response.status,
      };

      if (!success) {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timeout after ${this.WEBHOOK_TIMEOUT}ms`,
        };
      }
      return {
        success: false,
        error: (error as Error)?.message || 'Unknown error',
      };
    }
  }
}
