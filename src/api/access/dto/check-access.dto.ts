import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsBoolean, IsOptional } from 'class-validator';

export class CheckAccessDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'documents',
  })
  @IsString({ message: 'Resource must be a string' })
  @IsNotEmpty({ message: 'Resource is required' })
  resource!: string;

  @ApiProperty({
    description: 'Action name',
    example: 'write',
  })
  @IsString({ message: 'Action must be a string' })
  @IsNotEmpty({ message: 'Action is required' })
  action!: string;

  @ApiProperty({
    description: 'Context object for condition evaluation',
    example: {
      department: 'finance',
      ownerId: 'user-123',
      status: 'DRAFT',
    },
    type: Object,
  })
  @IsObject({ message: 'Context must be an object' })
  @IsNotEmpty({ message: 'Context is required' })
  context!: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether to log the access check to audit logs',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Log must be a boolean' })
  log?: boolean;
}
