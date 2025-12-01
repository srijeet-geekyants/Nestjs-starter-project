import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccessService } from './access.service';
import { EvaluatePolicyDto } from '../policies/dto/evaluate-policy.dto';
import { EvaluatePolicyResponseDto } from '../policies/dto/evaluate-policy-response.dto';
import { CheckAccessDto } from './dto/check-access.dto';
import { CheckAccessResponseDto } from './dto/check-access-response.dto';
import { PreviewMode } from '@common/decorators/preview-mode.decorator';
import { isPreviewMode } from '@common/helpers/preview-mode.helper';
import { v4 as uuidv4 } from 'uuid';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('access')
@ApiTags('Access')
@ApiBearerAuth('bearer')
@PreviewMode()
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'Tenant ID',
  required: true,
})
@ApiHeader({
  name: 'X-Preview-Mode',
  description: 'Set to "true" to check access without creating audit logs (optional)',
  required: false,
})
export class AccessController {
  constructor(
    private readonly accessService: AccessService,
    private readonly jwtService: JwtService
  ) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview access evaluation for a user' })
  @ApiResponse({ status: 200, description: 'Access evaluation completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async previewAccess(
    @Body() evaluatePolicyDto: EvaluatePolicyDto,
    @TenantId() tenantId: string
  ): Promise<EvaluatePolicyResponseDto> {
    return this.accessService.evaluateAccess(tenantId, evaluatePolicyDto);
  }

  @Post('check')
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check access for authenticated user (authorizes real actions)',
    description: 'Add X-Preview-Mode: true header to check access without creating audit logs',
  })
  @ApiResponse({ status: 200, description: 'Access check completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async checkAccess(
    @Body() checkAccessDto: CheckAccessDto,
    @TenantId() tenantId: string,
    @Request() req: any
  ): Promise<CheckAccessResponseDto> {
    const userId = req.user?.id || req.user?.userId || this.extractUserIdFromToken(req);
    console.log('userId', userId);

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Extract or generate requestId
    const requestId = req.headers['x-request-id'] || req.id || uuidv4();

    return this.accessService.checkAccess(
      tenantId,
      userId,
      checkAccessDto,
      isPreviewMode(req),
      requestId
    );
  }

  private extractUserIdFromToken(req: any): string | null {
    console.log('extractUserIdFromToken', req.headers?.authorization, req.headers);
    try {
      const authHeader = req.headers?.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      console.log('reached here');

      const token = authHeader.substring(7);
      // Verify and decode JWT token using JwtService
      const payload = this.jwtService.verify(token, {
        audience: 'api',
        issuer: 'auth-service',
      });
      return payload.sub || payload.userId || payload.id || null;
    } catch (error) {
      // Token verification failed (expired, invalid signature, etc.)
      return null;
    }
  }
}
