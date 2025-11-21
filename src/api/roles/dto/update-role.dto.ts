import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    title: 'Role Code',
    description: 'Role code',
    example: 'OWNER',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Matches(/^[A-Z]+$/, {
    message: 'Name can only contain letters',
  })
  override code?: string;

  @ApiProperty({
    title: 'Role Name',
    description: 'Role display name',
    example: 'Owner',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters',
  })
  override name?: string;
}
