import { Injectable } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly dbService: DBService) {}

  async findByEmail(email: string) {
    return this.dbService.users.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.dbService.users.findUnique({
      where: { id },
    });
  }

  async findByIdAndTenantId(id: string, tenantId: string) {
    return this.dbService.users.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });
  }

  async existsByEmail(email: string) {
    const user = await this.dbService.users.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async create(data: Prisma.usersCreateInput) {
    return this.dbService.users.create({
      data,
    });
  }

  async update(id: string, data: Prisma.usersUpdateInput) {
    return this.dbService.users.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.dbService.users.delete({
      where: { id },
    });
  }

  async findByTenantId(tenantId: string) {
    return this.dbService.users.findMany({
      where: { tenant_id: tenantId },
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.dbService.users.update({
      where: { id },
      data: { password_hash: passwordHash },
    });
  }
}
