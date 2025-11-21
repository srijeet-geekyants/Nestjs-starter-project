import { Body, Controller, HttpCode, HttpStatus, Post, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionDto } from './dto/permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@ApiTags('Permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission'})
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionDto})
  @ApiResponse({ status: 409, description: 'Permission code already exists'})
  async create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionDto> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all permissions'})
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of Permissions'})
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<PermissionDto[]> {
    return this.permissionsService.findAll(
      skip,
      take
    );
  }

}
