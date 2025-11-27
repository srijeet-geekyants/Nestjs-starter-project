import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PREVIEW_MODE_KEY } from '../decorators/preview-mode.decorator';

/**
 * Interceptor that reads X-Preview-Mode header and attaches it to request
 * for use in services. Only applies to endpoints decorated with @PreviewMode()
 */
@Injectable()
export class PreviewModeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Check if endpoint supports preview mode
    const supportsPreview = this.reflector.getAllAndOverride<boolean>(PREVIEW_MODE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (supportsPreview) {
      // Read X-Preview-Mode header (case-insensitive)
      const previewHeader =
        request.headers['x-preview-mode'] ||
        request.headers['X-Preview-Mode'] ||
        request.headers['x-preview'] ||
        request.headers['X-Preview'];

      // Set preview mode flag in request (true if header is 'true', '1', or 'yes')
      request.isPreviewMode = previewHeader === 'true' || previewHeader === '1' || previewHeader === 'yes';
    } else {
      request.isPreviewMode = false;
    }

    return next.handle();
  }
}
