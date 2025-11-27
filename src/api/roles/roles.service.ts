import { Injectable } from '@nestjs/common';
import { RolesRepository } from './repository/roles.repository';
import { RolesDto } from './dto/roles.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
// import { Prisma } from '@prisma/client';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { JobName, QueueName } from '@bg/constants/job.constant';
import { DBService } from '@db/db.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    @InjectQueue(QueueName.WEBHOOK_DISPATCH) private roleQueue: Queue,
    private readonly dbService: DBService
  ) {}

  async createRole(
    createRoleDto: CreateRoleDto,
    tenantId: string,
    isPreviewMode: boolean = false
  ): Promise<RolesDto> {
    const codeExists = await this.rolesRepository.existsByCodeAndTenantId(
      createRoleDto.code,
      tenantId
    );
    if (codeExists) {
      throw new ConflictException('Role code already exists');
    }

    // In preview mode, validate but don't create
    if (isPreviewMode) {
      return {
        id: 'preview-' + uuidv4(),
        tenantId,
        code: createRoleDto.code,
        name: createRoleDto.name,
        builtIn: false,
      };
    }

    // Real mode: create the role
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

    await this.dispatchWebhook(tenantId, 'role.created', {
      role,
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

  async updateRole(
    tenantId: string,
    id: string,
    updateRoleDto: UpdateRoleDto,
    isPreviewMode: boolean = false
  ): Promise<RolesDto> {
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

    // In preview mode, validate but don't update
    if (isPreviewMode) {
      return {
        id: existingRole.id,
        tenantId: existingRole.tenant_id,
        code: updateRoleDto.code !== undefined ? updateRoleDto.code : existingRole.code,
        name: updateRoleDto.name !== undefined ? updateRoleDto.name : existingRole.name,
        builtIn: existingRole.built_in,
      };
    }

    // Real mode: update the role
    const role = await this.rolesRepository.update(id, updateRoleDto);

    await this.dispatchWebhook(tenantId, 'role.updated', {
      role,
    });

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
    assignPermissionDto: AssignPermissionDto,
    isPreviewMode: boolean = false
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

    // In preview mode, validate but don't assign
    if (isPreviewMode) {
      return {
        id: role.id,
        tenantId: tenantId,
        code: role.code,
        name: role.name,
        builtIn: role.built_in,
        permissions: permissions.map(e => ({
          id: e.id,
          code: e.code,
          description: e.description ?? '',
        })),
      };
    }

    // Real mode: assign permissions
    const permissionIds = permissions.map(e => e.id);
    await this.rolesRepository.upsertPermissionsForRole(roleId, permissionIds);

    const updatedRole = await this.rolesRepository.findRoleWithPermissions(roleId, tenantId);

    await this.dispatchWebhook(tenantId, 'role.permissions_assigned', {
      role: updatedRole,
      permissions: permissions,
    });

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

  private async dispatchWebhook(tenantId: string, eventType: string, payload: any): Promise<void> {
    try {
      // Find all active webhook endpoints for this tenant
      const endpoints = await this.dbService.webhook_endpoints.findMany({
        where: {
          tenant_id: tenantId,
          active: true,
        },
      });

      // Dispatch webhook to each active endpoint
      for (const endpoint of endpoints) {
        await this.roleQueue.add(JobName.WEBHOOK_DISPATCH, {
          tenantId,
          endpointId: endpoint.id,
          eventType,
          payload,
        });
      }
    } catch (error) {
      console.log('Failed to dispatch webhook in role service: ', error);
    }
  }
}
