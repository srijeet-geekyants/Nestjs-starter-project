import { ApiProperty } from '@nestjs/swagger';

export class PolicyDto {
  @ApiProperty({
    title: 'Policy ID',
    description: 'Policy unique identifier (UUID)',
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
    description: 'Policy name',
    example: 'Finance-only document write',
  })
  name!: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'documents',
  })
  resource!: string;

  @ApiProperty({
    description: 'Action name',
    example: 'write',
  })
  action!: string;

  @ApiProperty({
    description: 'Effect (ALLOW or DENY)',
    example: 'ALLOW',
    enum: ['ALLOW', 'DENY'],
  })
  effect!: string;

  @ApiProperty({
    description: 'Condition object (JSON)',
    example: {
      field: 'department',
      op: '==',
      value: 'finance',
    },
    type: Object,
  })
  condition!: any;

  @ApiProperty({
    description: 'Whether the policy is active',
    example: true,
  })
  active!: boolean;

  @ApiProperty({
    description: 'Policy creation timestamp',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: Date;
}
