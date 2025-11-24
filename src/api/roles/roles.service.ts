import { Injectable } from '@nestjs/common';
import { RolesRepository } from './repository/roles.repository';
import { RolesDto } from './dto/roles.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Prisma } from '@prisma/client';
import { AssignPermissionDto } from './dto/assign-permission.dto';

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
        },
      },
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
      throw new ConflictException("Role doesn't exist");
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

  async assignPermissionToRole(
    tenantId: string,
    roleId: string,
    assignPermissionDto: AssignPermissionDto
  ): Promise<RolesDto> {
    const role = await this.rolesRepository.findByIdAndTenantId(roleId, tenantId);
    if (!role) {
      throw new ConflictException("Role doesn't exist");
    }

    const permissions = await this.rolesRepository.findPermissionByCodes(
      assignPermissionDto.permissionCodes
    );

    const foundCodes = permissions.map(e => e.code);
    const incomingCodes = assignPermissionDto.permissionCodes;
    const nonMatchingCodes = incomingCodes.filter(e => {
      return !foundCodes.includes(e);
    });

    if (nonMatchingCodes.length > 0) {
      throw new ConflictException('One or invalid codes in input');
    }

    const permissionIds = permissions.map(e => e.id);

    await this.rolesRepository.upsertPermissionsForRole(roleId, permissionIds);

    const updatedRole = await this.rolesRepository.findRoleWithPermissions(roleId, tenantId);

    return {
      id: updatedRole.id,
      tenantId: tenantId,
      code: updatedRole.code,
      name: updatedRole.name,
      builtIn: updatedRole.built_in,
      permissions: updatedRole.role_permissions.map(e => ({
        id: e.permission_id,
        code: e.permissions.code,
        description: e.permissions.description ?? '',
      })),
    };
  }

  async getRoleByIdAndTenantId(tenantId: string, roleId: string): Promise<RolesDto> {
    const role = await this.rolesRepository.findByIdAndTenantId(roleId, tenantId);
    if (!role) {
      throw new ConflictException("Role doesn't exist");
    }

    return {
      id: role.id,
      tenantId: role.tenant_id,
      code: role.code,
      name: role.name,
      builtIn: role.built_in,
      permissions: role.role_permissions.map((e: any) => ({
        id: e.permission_id,
        code: e.permissions?.code ?? '',
        description: e.permissions?.description ?? '',
      })),
    };
  }
}
