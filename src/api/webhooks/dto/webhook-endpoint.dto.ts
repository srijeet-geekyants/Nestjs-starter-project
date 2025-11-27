import { ApiProperty } from '@nestjs/swagger';

export class WebhookEndpointDto {
  @ApiProperty({
    title: 'Webhook Endpoint ID',
    description: 'Webhook endpoint unique identifier (UUID)',
    example: '73e48375-083b-40a1-9172-811840ea5ca2',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    title: 'Tenant ID',
    description: 'Tenant unique identifier (UUID)',
    example: '73e48375-083b-40a1-9172-811840ea5ca2',
    format: 'uuid',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'Webhook endpoint URL',
    example: 'https://example.com/webhooks',
  })
  url!: string;

  @ApiProperty({
    description: 'Whether the webhook endpoint is active',
    example: true,
  })
  active!: boolean;

  @ApiProperty({
    description: 'Webhook endpoint creation timestamp',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: Date;
}
