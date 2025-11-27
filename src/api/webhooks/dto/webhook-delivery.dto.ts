import { ApiProperty } from '@nestjs/swagger';

export class WebhookDeliveryDto {
  @ApiProperty({
    title: 'Webhook Delivery ID',
    description: 'Webhook delivery unique identifier (UUID)',
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
    title: 'Endpoint ID',
    description: 'Webhook endpoint unique identifier (UUID)',
    example: '73e48375-083b-40a1-9172-811840ea5ca2',
    format: 'uuid',
  })
  endpointId!: string;

  @ApiProperty({
    description: 'Event type',
    example: 'user.created',
  })
  eventType!: string;

  @ApiProperty({
    description: 'Webhook payload (JSON)',
    example: { userId: '123', email: 'user@example.com' },
    type: Object,
  })
  payload!: any;

  @ApiProperty({
    description: 'Delivery status',
    example: 'SUCCESS',
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
  })
  status!: string;

  @ApiProperty({
    description: 'Number of delivery attempts',
    example: 1,
  })
  attemptCount!: number;

  @ApiProperty({
    description: 'Last attempt timestamp',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
    required: false,
  })
  lastAttemptAt?: Date;

  @ApiProperty({
    description: 'Delivery creation timestamp',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: Date;
}
