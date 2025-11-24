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
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyDto } from './dto/policy.dto';
import { PoliciesService } from './policies.service';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Controller('policies')
@ApiTags('Policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Create a new policy (OWNER/ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createPolicy(
    @Body() createPolicyDto: CreatePolicyDto,
    @Headers('x-tenant-id') tenantId: string
  ): Promise<PolicyDto> {
    return this.policiesService.createPolicy(createPolicyDto, tenantId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter by active status (true/false)',
  })
  @ApiOperation({ summary: 'Get all policies for a tenant' })
  @ApiResponse({ status: 200, description: 'Policies retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPolicies(
    @Headers('x-tenant-id') tenantId: string,
    @Query('active') active?: string
  ): Promise<PolicyDto[]> {
    const activeFilter = active !== undefined ? active === 'true' : undefined;
    return this.policiesService.getPolicies(tenantId, activeFilter);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Update policy (OWNER/ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Policy updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updatePolicy(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updatePolicyDto: UpdatePolicyDto
  ): Promise<PolicyDto> {
    return this.policiesService.updatePolicy(tenantId, id, updatePolicyDto);
  }
}
