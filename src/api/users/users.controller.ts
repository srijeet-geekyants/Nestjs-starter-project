import { Controller, HttpCode, Headers, HttpStatus, Get, Param, Post, Body, Request } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersDto } from './dto/users.dto';
import { UsersService } from './users.service';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { UserRolesDto } from './dto/user-roles.dto';
import { PreviewMode } from '@common/decorators/preview-mode.decorator';
import { isPreviewMode } from '@common/helpers/preview-mode.helper';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get all users for a tenant' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUsers(@Headers('x-tenant-id') tenantId: string): Promise<UsersDto[]> {
    return this.usersService.getUsers(tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUser(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string
  ): Promise<UsersDto> {
    return this.usersService.getUserById(tenantId, id);
  }

  @Post(':id/assign-role')
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
    summary: 'Assign User Roles By User ID',
    description: 'Add X-Preview-Mode: true header to validate without assigning'
  })
  @ApiResponse({ status: 200, description: 'Assign User Roles Assigned to User Successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async assignRole(
    @Param('id') userId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() assignUserRoleDto: AssignUserRoleDto,
    @Request() req: any
  ): Promise<UserRolesDto> {
    return this.usersService.assignRole(userId, tenantId, assignUserRoleDto, isPreviewMode(req));
  }

  @Get(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get user roles by User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserRoles(
    @Param('id') userId: string,
    @Headers('x-tenant-id') tenantId: string
  ): Promise<UserRolesDto> {
    return this.usersService.getUserRoles(userId, tenantId);
  }
}
