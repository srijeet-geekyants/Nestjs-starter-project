import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { PoliciesModule } from '../policies/policies.module';
import { AuditInsertQueueUIModule } from '@bg/queue/audit-insert/audit-insert-queue-ui.module';
import { MetricsModule } from '@metrics/metrics.module';
import { LoggerModule } from '@logger/logger.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.config';

@Module({
  imports: [
    PoliciesModule,
    AuditInsertQueueUIModule,
    MetricsModule,
    LoggerModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvConfig>) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return {
          secret,
          signOptions: {
            issuer: 'auth-service',
            audience: 'api',
            expiresIn: configService.get('JWT_EXPIRATION') || '30m',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AccessController],
  providers: [AccessService],
  exports: [AccessService],
})
export class AccessModule {}
