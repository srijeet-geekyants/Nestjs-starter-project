import { Body, Controller, HttpCode, HttpStatus, Post, Get, Query, Request } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { PermissionDto } from './dto/permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';
import { PreviewMode } from '@common/decorators/preview-mode.decorator';
import { isPreviewMode } from '@common/helpers/preview-mode.helper';

@Controller('permissions')
@ApiTags('Permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @PreviewMode()
  @ApiHeader({
    name: 'X-Preview-Mode',
    description: 'Set to "true" to preview without creating (optional)',
    required: false,
  })
  @ApiOperation({
    summary: 'Create a new permission',
    description: 'Add X-Preview-Mode: true header to validate without creating'
  })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionDto})
  @ApiResponse({ status: 409, description: 'Permission code already exists'})
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Request() req: any
  ): Promise<PermissionDto> {
    return this.permissionsService.create(createPermissionDto, isPreviewMode(req));
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
