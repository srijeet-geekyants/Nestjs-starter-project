import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository],
})
export class PermissionsModule {}
