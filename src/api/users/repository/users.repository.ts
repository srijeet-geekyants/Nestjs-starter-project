import { Injectable, NotFoundException } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { users } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly dbService: DBService) {}

  async findAll(tenantId: string, skip?: number, take?: number): Promise<users[]> {
    return this.dbService.users.findMany({
      where: { tenant_id: tenantId },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      orderBy: { created_at: 'desc' },
    });
  }

  async findByIdAndTenantId(id: string, tenantId: string): Promise<users> {
    const user = await this.dbService.users.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.dbService.user_roles.create({
      data: {
        user_id: userId,
        role_id: roleId,
      },
    });
  }

  async getRoles(
    userId: string,
    tenantId: string
  ): Promise<
    users & {
      user_roles: Array<{
        role_id: string;
        roles: { id: string; code: string; name: string; built_in: boolean };
      }>;
    }
  > {
    return this.dbService.users.findFirstOrThrow({
      where: { id: userId, tenant_id: tenantId },
      include: {
        user_roles: {
          include: {
            roles: {
              select: {
                id: true,
                code: true,
                name: true,
                built_in: true,
              },
            },
          },
        },
      },
    });
  }
}
