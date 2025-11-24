import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsObject } from 'class-validator';

export class EvaluatePolicyDto {
  @ApiProperty({
    description: 'User ID to evaluate access for',
    example: '73e48375-083b-40a1-9172-811840ea5ca2',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

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
      ownerId: 'some-user-id',
      status: 'DRAFT',
    },
    type: Object,
  })
  @IsObject({ message: 'Context must be an object' })
  @IsNotEmpty({ message: 'Context is required' })
  context!: Record<string, any>;
}
