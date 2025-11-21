import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role code (must be one of: OWNER, ADMIN, USER)',
    example: 'OWNER',
    pattern: '^[A-Z]+$',
  })
  @IsString({ message: 'Code must be a valid string' })
  @IsNotEmpty({ message: 'Code is required' })
  code!: string;

  @ApiProperty({
    description: 'Role name (must be a valid name with at least 3 characters)',
    example: 'Owner',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a valid string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters' })
  name!: string;

  @ApiProperty({
    description: 'Whether this is a built-in role (system roles cannot be deleted)',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Built-in must be boolean value' })
  builtIn?: boolean;
}
