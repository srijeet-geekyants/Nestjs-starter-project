import { Controller, HttpStatus, Post, HttpCode, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('auth')
@ApiTags('Auth')
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'Tenant ID for which the user is attempting to authenticate',
  required: true,
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Register a new user. If invitationId is provided, user joins existing tenant. If not provided, creates new tenant.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const userWithToken = await this.authService.register(registerDto);
    return userWithToken;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login a user',
    description: 'Authenticate user with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto, @TenantId() tenantId: string): Promise<AuthResponseDto> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.authService.login(loginDto, tenantId);
  }
}
