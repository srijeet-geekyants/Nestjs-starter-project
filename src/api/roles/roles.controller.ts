import {
  Body,
  Controller,
  Post,
  HttpCode,
  Headers,
  HttpStatus,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesDto } from './dto/roles.dto';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Controller('roles')
@ApiTags('Roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Role code already exists for this tenant' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @Headers('x-tenant-id') tenantId: string
  ): Promise<RolesDto> {
    console.log('X-Tenant-ID', tenantId);
    return this.rolesService.createRole(createRoleDto, tenantId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get all roles for a tenant' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRoles(@Headers('x-tenant-id') tenantId: string): Promise<RolesDto[]> {
    return this.rolesService.getRoles(tenantId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Update Role Id' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateRole(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateRoleDto: UpdateRoleDto
  ): Promise<RolesDto> {
    return this.rolesService.updateRole(tenantId, id, updateRoleDto);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Update Role Permission' })
  @ApiResponse({ status: 200, description: 'Permission assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async assignPermission(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() assignPermissionDto: AssignPermissionDto
  ): Promise<RolesDto> {
    return this.rolesService.assignPermissionToRole(tenantId, id, assignPermissionDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get Role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRole(
    @Param('id') roleId: string,
    @Headers('x-tenant-id') tenantId: string
  ): Promise<RolesDto> {
    return this.rolesService.getRoleByIdAndTenantId(tenantId, roleId);
  }
}
