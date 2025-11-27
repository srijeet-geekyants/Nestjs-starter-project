import { SetMetadata } from '@nestjs/common';

export const PREVIEW_MODE_KEY = 'previewMode';
export const PreviewMode = () => SetMetadata(PREVIEW_MODE_KEY, true);
