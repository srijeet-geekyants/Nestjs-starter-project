import { ApiProperty } from '@nestjs/swagger';

export class UsersDto {
  @ApiProperty({
    title: 'User ID',
    description: 'User unique identifier (UUID)',
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
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
  })
  role!: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: Date;
}
