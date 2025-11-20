import { Injectable } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { Prisma, tenants } from '@prisma/client';

@Injectable()
export class TenantRepository {
  constructor(private readonly dbService: DBService) {}

  async findById(id: string): Promise<tenants | null> {
    return this.dbService.tenants.findUnique({
      where: { id },
      include: {
        plans: true,
      },
    });
  }

  async findByName(name: string): Promise<tenants | null> {
    return this.dbService.tenants.findFirst({
      where: { name },
      include: {
        plans: true,
      },
    });
  }
  async create(data: Prisma.tenantsCreateInput): Promise<tenants> {
    return this.dbService.tenants.create({
      data,
      include: {
        plans: true,
      },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const tenant = await this.dbService.tenants.findUnique({
      where: { id },
      select: { id: true }, // Only select id for performance
    });
    return !!tenant;
  }

  async existsByName(name: string): Promise<boolean> {
    const tenant = await this.dbService.tenants.findFirst({
      where: { name },
      select: { id: true },
    });
    return !!tenant;
  }

  async update(id: string, data: Prisma.tenantsUpdateInput): Promise<tenants> {
    return this.dbService.tenants.update({
      where: { id },
      data,
      include: {
        plans: true,
      },
    });
  }

  async findByPlanCode(planCode: string): Promise<tenants[]> {
    return this.dbService.tenants.findMany({
      where: { plan_code: planCode },
      include: {
        plans: true,
      },
    });
  }

  async updatePlan(id: string, planCode: string): Promise<tenants> {
    return this.dbService.tenants.update({
      where: { id },
      data: { plan_code: planCode },
      include: {
        plans: true,
      },
    });
  }

  async findAll(skip?: number, take?: number): Promise<tenants[]> {
    return this.dbService.tenants.findMany({
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      include: {
        plans: true,
      },
      orderBy: {
        created_at: 'desc', // Most recent first
      },
    });
  }
}
