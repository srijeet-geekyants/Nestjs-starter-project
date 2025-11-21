import { ApiProperty } from '@nestjs/swagger';

export class RolesDto {
  @ApiProperty({
    title: 'Role ID',
    description: 'Role unique identifier (UUID)',
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
    title: 'Role Code',
    description: 'Role code (unique identifier for the role)',
    example: 'OWNER',
  })
  code!: string;

  @ApiProperty({
    title: 'Role Name',
    description: 'Role name (Role name identifier for the role)',
    example: 'Owner',
  })
  name!: string;

  @ApiProperty({
    title: 'Built-in',
    description: 'Whether this is a built-in role (system roles cannot be deleted)',
    example: false,
    default: false,
  })
  builtIn!: boolean;
}
