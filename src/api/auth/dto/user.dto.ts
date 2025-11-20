import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    title: 'User ID',
    description: 'User unique identifier (U-UUID format)',
    example: 'U-550e8400-e29b-41d4-a716-446655440000',
    format: 'string',
  })
  id!: string;

  @ApiProperty({
    title: 'Tenant ID',
    description: 'Tenant identifier that the user belongs to (T-UUID format)',
    example: 'T-b874d553-6e91-4e62-b4c3-3c0dd758f598',
    format: 'string',
  })
  tenantId!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User role',
    example: 'user',
  })
  role!: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: Date;
}
