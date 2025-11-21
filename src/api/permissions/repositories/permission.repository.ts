import { Injectable } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { Prisma, permissions } from '@prisma/client';

@Injectable()
export class PermissionRepository {
  constructor(private readonly dbService: DBService) {}

  async findByCode(code: string): Promise<permissions | null> {
    return this.dbService.permissions.findUnique({
      where: { code },
    });
  }

  async findById(id: string): Promise<permissions | null> {
    return this.dbService.permissions.findUnique({
      where: { id },
    });
  }

  async existsByCode(code: string): Promise<boolean> {
    const permission = await this.findByCode(code);
    return permission !== null;
  }

  async findAll(skip?: number, take?: number): Promise<permissions[]> {
    return this.dbService.permissions.findMany({
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      orderBy: { code: 'asc' },
    });
  }

  async create(data: Prisma.permissionsCreateInput): Promise<permissions> {
    return this.dbService.permissions.create({
      data,
    });
  }

  async update(id: string, data: Prisma.permissionsUpdateInput): Promise<permissions> {
    return this.dbService.permissions.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.dbService.permissions.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.dbService.permissions.count();
  }
}
