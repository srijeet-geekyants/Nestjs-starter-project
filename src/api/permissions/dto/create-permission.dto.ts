import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission code (unique identifier, format: resource.action)',
    example: 'documents.read',
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @Matches(/^[a-z]+\.[a-z]+$/, {
    message: 'Code must be in format "resource.action" (e.g., documents.read)',
  })
  @MaxLength(100, { message: 'Code must not exceed 100 characters' })
  code!: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Read documents',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
