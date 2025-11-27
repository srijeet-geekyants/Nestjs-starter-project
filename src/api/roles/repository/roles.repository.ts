import { Injectable } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { Prisma, roles } from '@prisma/client';

@Injectable()
export class RolesRepository {
  constructor(private readonly dbService: DBService) {}

  async create(data: Prisma.rolesCreateInput): Promise<roles> {
    return this.dbService.roles.create({
      data,
    });
  }

  async findAll(tenantId: string, skip?: number, take?: number): Promise<roles[]> {
    return this.dbService.roles.findMany({
      where: { tenant_id: tenantId },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      orderBy: { created_at: 'desc' },
    });
  }

  async existsByCodeAndTenantId(code: string, tenantId: string): Promise<boolean> {
    const role = await this.dbService.roles.findFirst({
      where: {
        code,
        tenant_id: tenantId,
      },
      select: { id: true },
    });
    return !!role;
  }

  async update(id: string, data: Prisma.rolesUpdateInput): Promise<roles> {
    return this.dbService.roles.update({
      where: { id },
      data,
    });
  }

  async findByIdAndTenantId(
    id: string,
    tenantId: string
  ): Promise<
    roles & {
      role_permissions: Array<{
        role_id: string;
        permission_id: string;
        permissions: {
          id: string;
          code: string;
          description: string | null;
        };
      }>;
    }
  > {
    return this.dbService.roles.findFirstOrThrow({
      where: { id, tenant_id: tenantId },
      include: {
        role_permissions: {
          select: {
            role_id: true,
            permission_id: true,
            permissions: {
              select: {
                id: true,
                code: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }

  async findPermissionByCodes(codes: string[]): Promise<
    Array<{
      description: string | null;
      id: string;
      code: string;
    }>
  > {
    return this.dbService.permissions.findMany({
      where: {
        code: { in: codes },
      },
      select: {
        id: true,
        code: true,
        description: true,
      },
    });
  }

  async findRoleWithPermissions(
    roleId: string,
    tenantId: string
  ): Promise<
    roles & {
      role_permissions: Array<{
        permission_id: string;
        permissions: { id: string; code: string; description: string | null };
      }>;
    }
  > {
    return this.dbService.roles.findFirstOrThrow({
      where: { id: roleId, tenant_id: tenantId },
      include: {
        role_permissions: {
          include: {
            permissions: {
              select: {
                id: true,
                code: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }

  async upsertPermissionsForRole(roleId: string, permissionIds: string[]): Promise<void> {
    await this.dbService.role_permissions.deleteMany({
      where: { role_id: roleId },
    });

    if (permissionIds.length > 0) {
      await this.dbService.role_permissions.createMany({
        data: permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
        })),
      });
    }
  }
}
