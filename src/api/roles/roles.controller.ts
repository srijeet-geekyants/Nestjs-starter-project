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
  Request,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesDto } from './dto/roles.dto';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { PreviewMode } from '@common/decorators/preview-mode.decorator';
import { isPreviewMode } from '@common/helpers/preview-mode.helper';

@Controller('roles')
@ApiTags('Roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @PreviewMode()
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-Preview-Mode',
    description: 'Set to "true" to preview without creating (optional)',
    required: false,
  })
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Add X-Preview-Mode: true header to validate without creating'
  })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Role code already exists for this tenant' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @Headers('x-tenant-id') tenantId: string,
    @Request() req: any
  ): Promise<RolesDto> {
    return this.rolesService.createRole(createRoleDto, tenantId, isPreviewMode(req));
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
  @PreviewMode()
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-Preview-Mode',
    description: 'Set to "true" to preview without updating (optional)',
    required: false,
  })
  @ApiOperation({
    summary: 'Update Role Id',
    description: 'Add X-Preview-Mode: true header to validate without updating'
  })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateRole(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req: any
  ): Promise<RolesDto> {
    return this.rolesService.updateRole(tenantId, id, updateRoleDto, isPreviewMode(req));
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @PreviewMode()
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-Preview-Mode',
    description: 'Set to "true" to preview without assigning (optional)',
    required: false,
  })
  @ApiOperation({
    summary: 'Update Role Permission',
    description: 'Add X-Preview-Mode: true header to validate without assigning'
  })
  @ApiResponse({ status: 200, description: 'Permission assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async assignPermission(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() assignPermissionDto: AssignPermissionDto,
    @Request() req: any
  ): Promise<RolesDto> {
    return this.rolesService.assignPermissionToRole(tenantId, id, assignPermissionDto, isPreviewMode(req));
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
