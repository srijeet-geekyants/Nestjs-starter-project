import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreateWebhookEndpointDto {
  @ApiProperty({
    description: 'Webhook endpoint URL',
    example: 'https://example.com/webhooks',
  })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  @IsNotEmpty({ message: 'URL is required' })
  url!: string;

  @ApiProperty({
    description: 'Webhook secret for signature verification',
    example: 'whsec_1234567890abcdef',
  })
  @IsString({ message: 'Secret must be a string' })
  @IsNotEmpty({ message: 'Secret is required' })
  secret!: string;

  @ApiProperty({
    description: 'Whether the webhook endpoint is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;
}
