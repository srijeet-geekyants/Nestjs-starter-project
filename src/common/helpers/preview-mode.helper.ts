import { Request } from 'express';

/**
 * Extended Request interface with preview mode flag
 */
interface RequestWithPreviewMode extends Request {
  isPreviewMode?: boolean;
}

/**
 * Helper function to check if request is in preview mode
 * @param request - Express request object
 * @returns boolean - true if preview mode is enabled
 */
export function isPreviewMode(request: Request): boolean {
  // Type assertion to access the isPreviewMode property added by PreviewModeInterceptor
  // The property is set at runtime by the interceptor, but TypeScript needs the assertion
  return (request as RequestWithPreviewMode).isPreviewMode === true;
}
