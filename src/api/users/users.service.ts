import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository';
import { UsersDto } from './dto/users.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { RolesRepository } from '../roles/repository/roles.repository';
import { UserRolesDto } from './dto/user-roles.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { JobName, QueueName } from '@bg/constants/job.constant';
import { DBService } from '@db/db.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    @InjectQueue(QueueName.WEBHOOK_DISPATCH) private userQueue: Queue,
    private readonly dbService: DBService
  ) {}

  async getUsers(tenantId: string): Promise<UsersDto[]> {
    const users = await this.usersRepository.findAll(tenantId);
    return users.map(user => ({
      id: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at || new Date(),
    }));
  }

  async getUserById(tenantId: string, id: string): Promise<UsersDto> {
    const user = await this.usersRepository.findByIdAndTenantId(id, tenantId);
    return {
      id: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at || new Date(),
    };
  }

  async assignRole(
    userId: string,
    tenantId: string,
    assignUserRoleDto: AssignUserRoleDto,
    isPreviewMode: boolean = false
  ): Promise<UserRolesDto> {
    const user = await this.usersRepository.findByIdAndTenantId(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const role = await this.rolesRepository.findByIdAndTenantId(assignUserRoleDto.roleId, tenantId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // In preview mode, validate but don't assign
    if (isPreviewMode) {
      const userWithRoles = await this.usersRepository.getRoles(userId, tenantId);
      return {
        id: userWithRoles.id,
        tenantId: userWithRoles.tenant_id,
        email: userWithRoles.email,
        role: userWithRoles.role,
        roles: [
          ...userWithRoles.user_roles.map(ur => ({
            id: ur.roles.id,
            tenantId: userWithRoles.tenant_id,
            code: ur.roles.code,
            name: ur.roles.name,
            builtIn: ur.roles.built_in,
          })),
          {
            id: role.id,
            tenantId: tenantId,
            code: role.code,
            name: role.name,
            builtIn: role.built_in,
          },
        ],
      };
    }

    // Real mode: assign role
    await this.usersRepository.assignRole(userId, assignUserRoleDto.roleId);

    await this.dispatchWebhook(tenantId, 'user.role_assigned', {
      user,
      role,
    });

    const userWithRoles = await this.usersRepository.getRoles(userId, tenantId);

    const result: UserRolesDto = {
      id: userWithRoles.id,
      tenantId: userWithRoles.tenant_id,
      email: userWithRoles.email,
      role: userWithRoles.role,
      roles: userWithRoles.user_roles.map(ur => ({
        id: ur.roles.id,
        tenantId: userWithRoles.tenant_id,
        code: ur.roles.code,
        name: ur.roles.name,
        builtIn: ur.roles.built_in,
      })),
    };
    if (userWithRoles.created_at) {
      result.createdAt = userWithRoles.created_at.toISOString();
    }
    return result;
  }

  async getUserRoles(userId: string, tenantId: string): Promise<UserRolesDto> {
    const user = await this.usersRepository.findByIdAndTenantId(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userWithRoles = await this.usersRepository.getRoles(userId, tenantId);

    const result: UserRolesDto = {
      id: userWithRoles.id,
      tenantId: userWithRoles.tenant_id,
      email: userWithRoles.email,
      role: userWithRoles.role,
      roles: userWithRoles.user_roles.map(ur => ({
        id: ur.roles.id,
        tenantId: userWithRoles.tenant_id,
        code: ur.roles.code,
        name: ur.roles.name,
        builtIn: ur.roles.built_in,
      })),
    };

    if (userWithRoles.created_at) {
      result.createdAt = userWithRoles.created_at.toISOString();
    }

    return result;
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
        await this.userQueue.add(JobName.WEBHOOK_DISPATCH, {
          tenantId,
          endpointId: endpoint.id,
          eventType,
          payload,
        });
      }
    } catch (error) {
      console.log('Failed to dispatch webhook in user service: ', error);
    }
  }
}
