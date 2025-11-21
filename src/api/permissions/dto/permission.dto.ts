import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({
    description: 'Permission ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Permission code (unique identifier)',
    example: 'documents.read',
  })
  code!: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Read documents',
    required: false,
  })
  description?: string;
}
