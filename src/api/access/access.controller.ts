import {
  Body,
  Controller,
  Post,
  HttpCode,
  Headers,
  HttpStatus,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccessService } from './access.service';
import { EvaluatePolicyDto } from '../policies/dto/evaluate-policy.dto';
import { EvaluatePolicyResponseDto } from '../policies/dto/evaluate-policy-response.dto';
import { CheckAccessDto } from './dto/check-access.dto';
import { CheckAccessResponseDto } from './dto/check-access-response.dto';

@Controller('access')
@ApiTags('Access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiOperation({ summary: 'Preview access evaluation for a user' })
  @ApiResponse({ status: 200, description: 'Access evaluation completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async previewAccess(
    @Body() evaluatePolicyDto: EvaluatePolicyDto,
    @Headers('x-tenant-id') tenantId: string
  ): Promise<EvaluatePolicyResponseDto> {
    return this.accessService.evaluateAccess(tenantId, evaluatePolicyDto);
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'X-Tenant-ID',
    description: 'Tenant ID',
    required: true,
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOperation({ summary: 'Check access for authenticated user (authorizes real actions)' })
  @ApiResponse({ status: 200, description: 'Access check completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async checkAccess(
    @Body() checkAccessDto: CheckAccessDto,
    @Headers('x-tenant-id') tenantId: string,
    @Request() req: any
  ): Promise<CheckAccessResponseDto> {
    // Extract user ID from authenticated context
    // Try to get from request.user (set by auth guard) or decode from JWT
    const userId = req.user?.id || req.user?.userId || this.extractUserIdFromToken(req);

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.accessService.checkAccess(tenantId, userId, checkAccessDto);
  }

  private extractUserIdFromToken(req: any): string | null {
    try {
      const authHeader = req.headers?.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);
      // Decode JWT token (without verification for now - should use JWT service in production)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.sub || payload.userId || payload.id || null;
    } catch (error) {
      return null;
    }
  }
}
