import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({
    title: 'Permission Codes',
    description: 'Permission codes array',
    example: ['documents.read', 'documents.write'],
    type: [String],
  })
  @IsArray({ message: 'Permission codes must be a valid array' })
  @ArrayMinSize(1, { message: 'Atleast one permission code is required' })
  @IsNotEmpty({ message: 'Permission codes must not be empty' })
  @IsString({ each: true, message: 'Each permission code must be a string' })
  @Matches(/^[a-z]+\.[a-z]+$/, {
    each: true,
    message: 'Each permission code must be in the format "resource.action"',
  })
  permissionCodes!: string[];
}
