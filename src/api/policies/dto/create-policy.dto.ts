import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsObject } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty({
    description: 'Policy name',
    example: 'Finance-only document write',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

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
    description: 'Effect (ALLOW or DENY)',
    example: 'ALLOW',
    enum: ['ALLOW', 'DENY'],
  })
  @IsEnum(['ALLOW', 'DENY'], { message: 'Effect must be either ALLOW or DENY' })
  @IsNotEmpty({ message: 'Effect is required' })
  effect!: 'ALLOW' | 'DENY';

  @ApiProperty({
    description: 'Condition object (JSON) - can be simple or complex nested structure',
    example: {
      field: 'department',
      op: '==',
      value: 'finance',
    },
    type: Object,
  })
  @IsObject({ message: 'Condition must be an object' })
  @IsNotEmpty({ message: 'Condition is required' })
  condition!: any;
}
