import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'User information',
    type: UserDto,
  })
  user!: UserDto;

  @ApiPropertyOptional({
    title: 'Tenant ID',
    description:
      'Tenant identifier (T-UUID format). Present in tenant registration/login responses. Also available in user.tenantId',
    example: 'T-b874d553-6e91-4e62-b4c3-3c0dd758f598',
    format: 'string',
  })
  tenantId?: string;
}
