import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user1@lac.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description:
      'User password (Min 8 chars, must contain: uppercase, lowercase, number, and special character)',
    example: 'SuperstrongPassword123@',
    minLength: 8,
    title: 'Password',
    format: 'password',
  })
  @IsString({ message: 'Password must be string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
  })
  password!: string;
}
