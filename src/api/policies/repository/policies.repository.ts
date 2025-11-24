import { Injectable, NotFoundException } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { Prisma, policies } from '@prisma/client';

@Injectable()
export class PoliciesRepository {
  constructor(private readonly dbService: DBService) {}

  async create(data: Prisma.policiesCreateInput): Promise<policies> {
    return this.dbService.policies.create({
      data,
    });
  }

  async findAll(tenantId: string, active?: boolean): Promise<policies[]> {
    return this.dbService.policies.findMany({
      where: {
        tenant_id: tenantId,
        ...(active !== undefined && { active }),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByIdAndTenantId(id: string, tenantId: string): Promise<policies> {
    const policy = await this.dbService.policies.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!policy) {
      throw new NotFoundException('Policy not found');
    }
    return policy;
  }

  async update(id: string, data: Prisma.policiesUpdateInput): Promise<policies> {
    return this.dbService.policies.update({
      where: { id },
      data,
    });
  }

  async findByResourceAndAction(
    tenantId: string,
    resource: string,
    action: string
  ): Promise<policies[]> {
    return this.dbService.policies.findMany({
      where: {
        tenant_id: tenantId,
        resource,
        action,
        active: true,
      },
    });
  }
}
