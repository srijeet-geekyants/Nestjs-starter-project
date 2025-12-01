import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the first non-empty `X-Tenant-ID` header value.
 * Swagger can send duplicate headers (one empty, one populated),
 * so we normalize by taking the first truthy entry after splitting.
 */
export const TenantId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const rawHeader =
      request.headers['x-tenant-id'] ??
      request.headers['X-Tenant-ID'] ??
      request.headers['x-Tenant-Id'];

    if (Array.isArray(rawHeader)) {
      return rawHeader.map(value => value?.trim()).find(value => !!value) || undefined;
    }

    if (typeof rawHeader === 'string') {
      return (
        rawHeader
          .split(',')
          .map(value => value.trim())
          .find(value => !!value) || undefined
      );
    }

    return undefined;
  }
);
