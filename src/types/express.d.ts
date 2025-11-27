import 'express';

/**
 * Extend Express Request interface to include custom properties
 * This file extends the Express Request type to include isPreviewMode property
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Flag indicating if the request is in preview mode
       * Set by PreviewModeInterceptor based on X-Preview-Mode header
       */
      isPreviewMode?: boolean;
    }
  }
}

export {};
