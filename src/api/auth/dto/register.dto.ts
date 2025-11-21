import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Length,
  MinLength,
} from 'class-validator';

import { CountryCode } from '@common/enums/country-code.enum';

import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty({
    title: 'Name',
    description: 'Name of user (Must be a valid name with atleast 3 characters)',
    example: 'John Doe',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters',
  })
  name!: string;

  @ApiProperty({
    title: 'Country Code',
    description: 'Country code of the user',
    default: 'IN',
    example: 'IN',
  })
  @IsEnum(CountryCode, { message: 'Must be a valid country code' })
  @IsNotEmpty({ message: 'Country code is required' })
  countryCode!: CountryCode;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '7979797979',
    minLength: 10,
    maxLength: 10,
    format: 'phone-number',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(10, 10, { message: 'Phone number must be 10 digits' })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone number must be a valid 10 digit mobile number (e.g., 7979797979)',
  })
  phoneNumber!: string;

  @ApiPropertyOptional({
    description:
      'Invitation ID for user registration (optional for direct user registrations, mandatory for tenant registrations)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Invitation ID must be a valid UUID' })
  invitationId?: string;
}
