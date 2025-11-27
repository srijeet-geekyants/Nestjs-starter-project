import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '@logger/logger.service';
import { getTraceContext } from '@common/helpers/trace-context.util';
import { isPreviewMode } from '@common/helpers/preview-mode.helper';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context_: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context_.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, url, httpVersion, headers, body, query } = request;
    const remoteAddr = request.ip || request.socket.remoteAddress;
    const userAgent = headers['user-agent'] || 'unknown';
    const referrer = headers['referer'] || headers['referrer'] || 'No Referer';
    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();
    const { traceId, spanId } = getTraceContext();
    const contextInfo = `[TraceId=${traceId || 'unknown-trace'} | SpanId=${spanId || 'unknown-span'}]`;

    // Check if request is in preview mode
    const previewMode = isPreviewMode(request);

    return next.handle().pipe(
      tap(() => {
        // Skip logging for preview mode requests
        if (previewMode) {
          return;
        }

        // Log only non-preview mode requests
        const endTimestamp = Date.now();
        const endTime = new Date().toISOString();
        const responseTime = endTimestamp - startTimestamp;
        const { statusCode } = response;
        const contentLength = response.get('content-length') || 'unknown';

        const logMessage =
          `HTTP Log [REAL MODE] ${contextInfo}\n` +
          `Start: ${startTime}, End: ${endTime}, Duration: ${responseTime}ms\n` +
          `Remote: ${remoteAddr}, Method: ${method}, URL: ${url}, HTTP/${httpVersion}\n` +
          `User-Agent: ${userAgent}, Referrer: ${referrer}\n` +
          `Body: ${JSON.stringify(body)}, Query: ${JSON.stringify(query)}\n` +
          `Status: ${statusCode}, Content-Length: ${contentLength}\n`;

        // Real mode requests logged at http/info level
        this.logger.http(logMessage, 'HTTP');
      })
    );
  }
}
