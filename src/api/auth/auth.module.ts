import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './repositories/user.repository';
import { TenantRepository } from './repositories/tenant.repository';
import { BcryptService } from '@common/hashing/bcrypt.service';

@Module({
  providers: [
    AuthService,
    UserRepository,
    TenantRepository,
    {
      provide: 'HashingService',
      useClass: BcryptService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
