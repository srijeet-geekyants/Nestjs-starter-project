import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByIdAndTenantId(id: string, tenantId: string): Promise<roles> {
    const role = await this.dbService.roles.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
}
