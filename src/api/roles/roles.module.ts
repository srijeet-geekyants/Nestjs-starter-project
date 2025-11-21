import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './repository/roles.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
})
export class RolesModule {}
