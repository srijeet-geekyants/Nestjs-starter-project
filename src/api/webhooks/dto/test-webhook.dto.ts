import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class TestWebhookDto {
  @ApiProperty({
    description: 'Event type',
    example: 'user.created',
  })
  @IsString({ message: 'Event type must be a string' })
  @IsNotEmpty({ message: 'Event type is required' })
  eventType!: string;

  @ApiProperty({
    description: 'Webhook payload',
    example: {
      userId: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
    },
    type: Object,
  })
  @IsObject({ message: 'Payload must be an object' })
  @IsNotEmpty({ message: 'Payload is required' })
  payload!: Record<string, any>;
}
