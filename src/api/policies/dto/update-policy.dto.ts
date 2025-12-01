import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsObject, IsEnum } from 'class-validator';

export class UpdatePolicyDto {
  @ApiProperty({
    description: 'Policy name',
    example: 'Finance-only document write',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiProperty({
    description: 'Condition object (JSON)',
    example: {
      field: 'department',
      op: '==',
      value: 'finance',
    },
    type: Object,
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Condition must be an object' })
  condition?: any;

  @ApiProperty({
    description: 'Effect (ALLOW or DENY)',
    example: 'ALLOW',
    enum: ['ALLOW', 'DENY'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ALLOW', 'DENY'], { message: 'Effect must be either ALLOW or DENY' })
  effect?: 'ALLOW' | 'DENY';

  @ApiProperty({
    description: 'Whether the policy is active',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;
}
