import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Headers,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { WebhookEndpointDto } from './dto/webhook-endpoint.dto';
import { WebhookDeliveryDto } from './dto/webhook-delivery.dto';
import { TestWebhookDto } from './dto/test-webhook.dto';
import { PreviewMode } from '@common/decorators/preview-mode.decorator';
import { isPreviewMode } from '@common/helpers/preview-mode.helper';

@Controller('webhooks')
@ApiTags('Webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('endpoints')
  @HttpCode(HttpStatus.CREATED)
  @PreviewMode()
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-Preview-Mode',
    description: 'Set to "true" to preview without creating (optional)',
    required: false,
  })
  @ApiOperation({
    summary: 'Create a new webhook endpoint',
    description: 'Add X-Preview-Mode: true header to validate without creating'
  })
  @ApiResponse({ status: 201, description: 'Webhook endpoint created successfully', type: WebhookEndpointDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createWebhookEndpoint(
    @Body() createWebhookEndpointDto: CreateWebhookEndpointDto,
    @Headers('x-tenant-id') tenantId: string,
    @Request() req: any
  ): Promise<WebhookEndpointDto> {
    return this.webhooksService.createWebhookEndpoint(
      tenantId,
      createWebhookEndpointDto,
      isPreviewMode(req)
    );
  }

  @Get('endpoints')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get all webhook endpoints for a tenant' })
  @ApiResponse({ status: 200, description: 'Webhook endpoints retrieved successfully', type: [WebhookEndpointDto] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWebhookEndpoints(
    @Headers('x-tenant-id') tenantId: string
  ): Promise<WebhookEndpointDto[]> {
    return this.webhooksService.getWebhookEndpoints(tenantId);
  }

  @Delete('endpoints/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiParam({
    name: 'id',
    description: 'Webhook endpoint ID',
    type: String,
    format: 'uuid',
  })
  @ApiOperation({ summary: 'Delete a webhook endpoint' })
  @ApiResponse({ status: 204, description: 'Webhook endpoint deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot delete endpoint with pending deliveries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Webhook endpoint not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteWebhookEndpoint(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string
  ): Promise<void> {
    await this.webhooksService.deleteWebhookEndpoint(tenantId, id);
  }

  @Get('deliveries')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    description: 'Filter by delivery status',
  })
  @ApiQuery({
    name: 'eventType',
    required: false,
    type: String,
    description: 'Filter by event type (e.g., user.created, policy.updated)',
  })
  @ApiOperation({ summary: 'Get webhook deliveries with optional filters' })
  @ApiResponse({ status: 200, description: 'Webhook deliveries retrieved successfully', type: [WebhookDeliveryDto] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWebhookDeliveries(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('eventType') eventType?: string
  ): Promise<WebhookDeliveryDto[]> {
    return this.webhooksService.getWebhookDeliveries(tenantId, status, eventType);
  }

  @Post('endpoints/:id/test')
  @HttpCode(HttpStatus.OK)
  @PreviewMode()
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-Preview-Mode',
    description: 'Set to "true" to preview without sending (optional)',
    required: false,
  })
  @ApiParam({
    name: 'id',
    description: 'Webhook endpoint ID',
    type: String,
    format: 'uuid',
  })
  @ApiOperation({
    summary: 'Test webhook delivery',
    description: 'Add X-Preview-Mode: true header to preview what would be sent without actually dispatching'
  })
  @ApiResponse({ status: 200, description: 'Webhook test completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Webhook endpoint not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async testWebhook(
    @Param('id') endpointId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() testWebhookDto: TestWebhookDto,
    @Request() req: any
  ): Promise<{ success: boolean; message: string; preview?: any }> {
    return this.webhooksService.testWebhookDelivery(
      tenantId,
      endpointId,
      testWebhookDto.eventType,
      testWebhookDto.payload,
      isPreviewMode(req)
    );
  }
}
