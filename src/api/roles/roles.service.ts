import { Injectable } from '@nestjs/common';
import { RolesRepository } from './repository/roles.repository';
import { RolesDto } from './dto/roles.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async createRole(createRoleDto: CreateRoleDto, tenantId: string): Promise<RolesDto> {
    const codeExists = await this.rolesRepository.existsByCodeAndTenantId(
      createRoleDto.code,
      tenantId
    );
    if (codeExists) {
      throw new ConflictException('Role code already exists');
    }

    const roleName = createRoleDto.name;
    const role = await this.rolesRepository.create({
      id: uuidv4(),
      code: createRoleDto.code,
      name: roleName,
      built_in: false,
      created_at: new Date(),
      tenants: {
        connect: {
          id: tenantId,
        }
      }
    });

    return {
      id: role.id,
      tenantId: role.tenant_id,
      code: role.code,
      name: role.name,
      builtIn: role.built_in,
    };
  }

  async getRoles(tenantId: string): Promise<RolesDto[]> {
    const roles = await this.rolesRepository.findAll(tenantId);
    return roles.map(role => ({
      id: role.id,
      tenantId: role.tenant_id,
      code: role.code,
      name: role.name,
      builtIn: role.built_in,
    }));
  }

  async updateRole(tenantId: string, id: string, updateRoleDto: UpdateRoleDto): Promise<RolesDto> {
    const existingRole = await this.rolesRepository.findByIdAndTenantId(id, tenantId);
    if (!existingRole) {
      throw new ConflictException("Role code already exists ! Can't update");
    }

    if (updateRoleDto.code && updateRoleDto.code !== existingRole.code) {
      const codeExists = await this.rolesRepository.existsByCodeAndTenantId(
        updateRoleDto.code,
        tenantId
      );
      if (codeExists) {
        throw new ConflictException("Role code already exists ! Can't update");
      }
    }

    const updateData: Prisma.rolesUpdateInput = {};

    if (updateRoleDto.code !== undefined) {
      updateData.code = updateRoleDto.code;
    }
    if (updateRoleDto.name !== undefined) {
      updateData.name = updateRoleDto.name;
    }

    const role = await this.rolesRepository.update(id, updateRoleDto);

    return {
      id: role.id,
      tenantId: role.tenant_id,
      code: role.code,
      name: role.name,
      builtIn: role.built_in,
    };
  }
}
