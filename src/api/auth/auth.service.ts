import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { UserRepository } from './repositories/user.repository';
import { HashingService } from '@common/hashing/hashing.service';
import { TenantRepository } from './repositories/tenant.repository';
import { UserDto } from './dto/user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tenantRepository: TenantRepository
  ) {}
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const emailExists = await this.userRepository.existsByEmail(registerDto.email);
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    let tenantId: string;

    if (registerDto.invitationId) {
      const tenant = await this.getTenantIdFromInvitation(registerDto.invitationId);
      if (!tenant) {
        throw new NotFoundException('Invalid or expired invitation');
      }
      tenantId = tenant.id;
    } else {
      const tenant = await this.createNewTenant(registerDto);
      tenantId = tenant.id;
    }

    const user = await this.userRepository.create({
      id: `U-${uuidv4()}`,
      email: registerDto.email,
      password_hash: await this.hashingService.hash(registerDto.password),
      role: registerDto.invitationId ? 'OWNER' : 'USER',
      tenants: {
        connect: { id: tenantId },
      },
    });

    const userDto: UserDto = {
      id: user.id,
      tenantId: tenantId,
      email: user.email,
      role: user.role,
      createdAt: user.created_at || new Date(),
    };
    const accessToken = 'temp-jwt-token-placeholder';
    const response: AuthResponseDto = {
      accessToken,
      user: userDto,
    };

    return response;
  }

  private async getTenantIdFromInvitation(invitationId: string) {
    const tenant = await this.tenantRepository.findById(invitationId);
    if (!tenant) {
      throw new NotFoundException('Invitation not found');
    }
    return tenant;
  }

  private async createNewTenant(registerDto: RegisterDto) {
    const tenantId = `T-${uuidv4()}`;
    const tenant = await this.tenantRepository.create({
      id: tenantId,
      name: registerDto.name,
      plans: {
        connect: { code: 'STARTUP' }, // Connect to existing plan by code
      },
    });
    return tenant;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong Password');
    }

    const userDto: UserDto = {
      id: user.id,
      tenantId: user.tenant_id, // X-Tenant-id
      email: user.email,
      role: user.role,
      createdAt: user.created_at || new Date(),
    };
    const accessToken = 'temp-jwt-token-placeholder';
    const response: AuthResponseDto = {
      accessToken,
      user: userDto,
    };
    return response;
  }
}
