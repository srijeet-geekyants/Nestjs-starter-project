import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repository/users.repository';
import { UsersDto } from './dto/users.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { RolesRepository } from '../roles/repository/roles.repository';
import { UserRolesDto } from './dto/user-roles.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository
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
    assignUserRoleDto: AssignUserRoleDto
  ): Promise<UserRolesDto> {
    console.log('userId ', userId, 'tenantId ', tenantId);
    const user = await this.usersRepository.findByIdAndTenantId(userId, tenantId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const role = await this.rolesRepository.findByIdAndTenantId(assignUserRoleDto.roleId, tenantId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.usersRepository.assignRole(userId, assignUserRoleDto.roleId);

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
}
