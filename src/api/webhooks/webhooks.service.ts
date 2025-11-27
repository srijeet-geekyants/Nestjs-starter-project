import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { WebhookEndpointDto } from './dto/webhook-endpoint.dto';
import { WebhookDeliveryDto } from './dto/webhook-delivery.dto';
import { randomUUID } from 'crypto';
import { WebhookDispatchQueue } from '@bg/queue/webhook-dispatch/webhook-dispatch-queue';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly dbService: DBService,
    private readonly webhookDispatchQueue: WebhookDispatchQueue
  ) {}

  async createWebhookEndpoint(
    tenantId: string,
    createWebhookEndpointDto: CreateWebhookEndpointDto,
    isPreviewMode: boolean = false
  ): Promise<WebhookEndpointDto> {
    try {
      // In preview mode, validate but don't create
      if (isPreviewMode) {
        // Validate URL format
        try {
          new URL(createWebhookEndpointDto.url);
        } catch {
          throw new BadRequestException('Invalid URL format');
        }

        // Return a mock response
        return {
          id: 'preview-' + randomUUID(),
          tenantId,
          url: createWebhookEndpointDto.url,
          active: createWebhookEndpointDto.active ?? true,
          createdAt: new Date(),
        };
      }

      // Real mode: create the endpoint
      const webhookEndpoint = await this.dbService.webhook_endpoints.create({
        data: {
          id: randomUUID(),
          tenant_id: tenantId,
          url: createWebhookEndpointDto.url,
          secret: createWebhookEndpointDto.secret,
          active: createWebhookEndpointDto.active ?? true,
        },
      });

      return {
        id: webhookEndpoint.id,
        tenantId: webhookEndpoint.tenant_id,
        url: webhookEndpoint.url,
        active: webhookEndpoint.active,
        createdAt: webhookEndpoint.created_at || new Date(),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create webhook endpoint: ${(error as Error)?.message}`
      );
    }
  }

  async testWebhookDelivery(
    tenantId: string,
    endpointId: string,
    eventType: string,
    payload: Record<string, any>,
    isPreviewMode: boolean = false
  ): Promise<{ success: boolean; message: string; preview?: any }> {
    // Fetch webhook endpoint
    const endpoint = await this.dbService.webhook_endpoints.findFirst({
      where: {
        id: endpointId,
        tenant_id: tenantId,
        active: true,
      },
    });

    if (!endpoint) {
      throw new NotFoundException(
        `Webhook endpoint ${endpointId} not found or inactive for tenant ${tenantId}`
      );
    }

    if (isPreviewMode) {
      // Preview mode: validate and return what would be sent
      return {
        success: true,
        message: 'Preview mode: Webhook would be dispatched',
        preview: {
          url: endpoint.url,
          eventType,
          payload,
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': '[signature-would-be-generated]',
            'X-Webhook-Timestamp': Date.now().toString(),
          },
        },
      };
    }

    // Real mode: dispatch webhook
    await this.webhookDispatchQueue.addWebhookDispatchJob({
      tenantId,
      endpointId,
      eventType,
      payload,
    });

    return {
      success: true,
      message: 'Webhook dispatch job queued successfully',
    };
  }

  async getWebhookEndpoints(tenantId: string): Promise<WebhookEndpointDto[]> {
    const webhookEndpoints = await this.dbService.webhook_endpoints.findMany({
      where: {
        tenant_id: tenantId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return webhookEndpoints.map(endpoint => ({
      id: endpoint.id,
      tenantId: endpoint.tenant_id,
      url: endpoint.url,
      active: endpoint.active,
      createdAt: endpoint.created_at || new Date(),
    }));
  }

  async deleteWebhookEndpoint(tenantId: string, id: string): Promise<void> {
    const webhookEndpoint = await this.dbService.webhook_endpoints.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });

    if (!webhookEndpoint) {
      throw new NotFoundException(`Webhook endpoint with ID ${id} not found`);
    }

    // Check if there are any pending deliveries
    const pendingDeliveries = await this.dbService.webhook_deliveries.findFirst({
      where: {
        endpoint_id: id,
        status: 'PENDING',
      },
    });

    if (pendingDeliveries) {
      throw new BadRequestException(
        'Cannot delete webhook endpoint with pending deliveries. Please wait for all deliveries to complete or fail.'
      );
    }

    await this.dbService.webhook_endpoints.delete({
      where: {
        id,
      },
    });
  }

  async getWebhookDeliveries(
    tenantId: string,
    status?: string,
    eventType?: string
  ): Promise<WebhookDeliveryDto[]> {
    const where: any = {
      tenant_id: tenantId,
    };

    if (status) {
      const validStatuses = ['PENDING', 'SUCCESS', 'FAILED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        throw new BadRequestException(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }
      where.status = status.toUpperCase();
    }

    if (eventType) {
      where.event_type = eventType;
    }

    const deliveries = await this.dbService.webhook_deliveries.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      take: 100, // Limit to last 100 deliveries
    });

    return deliveries.map(delivery => {
      const dto: WebhookDeliveryDto = {
        id: delivery.id,
        tenantId: delivery.tenant_id,
        endpointId: delivery.endpoint_id,
        eventType: delivery.event_type,
        payload: delivery.payload as any,
        status: delivery.status,
        attemptCount: delivery.attempt_count,
        createdAt: delivery.created_at || new Date(),
      };

      if (delivery.last_attempt_at) {
        dto.lastAttemptAt = delivery.last_attempt_at;
      }

      return dto;
    });
  }
}
