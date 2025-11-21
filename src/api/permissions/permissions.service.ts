import { ConflictException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionDto } from './dto/permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionDto> {
    const codeExists = await this.permissionRepository.existsByCode(createPermissionDto.code);
    if (codeExists) {
      throw new ConflictException('Permission code already exists');
    }

    const permission = await this.permissionRepository.create({
      id: uuidv4(),
      code: createPermissionDto.code,
      description: createPermissionDto.description || '',
    });

    return {
      id: permission.id,
      code: permission.code,
      description: permission.description || '',
    };
  }

  async findAll(skip?: number, take?: number): Promise<PermissionDto[]> {
    const permissions = await this.permissionRepository.findAll(skip, take);

    return permissions.map(permission => ({
      id: permission.id,
      code: permission.code,
      description: permission.description || '',
    }));
  }
}
