import { ResponseUtil } from '@common/helpers/response.utils';
import { RouteNames } from '@common/route-names';
import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { register } from 'prom-client';

@Controller({path: RouteNames.METRICS, version: '1'})
@ApiTags('Metrics')
// @ApiExcludeController()
export class MetricsController {
  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Get all Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve metrics' })
  async getDefaultMetrics(@Res() res: Response): Promise<void> {
    try {
      const metrics = await register.metrics();
      res.status(200).send(metrics);
    } catch (error) {
      console.error('Error fetching Prometheus metrics:', error);
      res.status(500).send(ResponseUtil.error('Failed to retrieve metrics', 500, null));
    }
  }
}

/**
 * Prometheus Query Examples:
 *
 * === API Metrics ===
 * @SLOWEST_API topk(5, rate(api_request_duration_seconds_sum[5m]) / rate(api_request_duration_seconds_count[5m]))
 * @MOST_COMMON_BROWSERS topk(5, api_requests_by_user_agent)
 * @TOP_REFERERS topk(5, api_requests_by_referer)
 * @API_ERROR_RATE_PERCENTAGE (sum(rate(api_request_errors_total[5m])) / sum(rate(api_requests_total[5m]))) * 100
 * @API_REQUESTS_PER_SECOND rate(api_requests_total[1m])
 * @API_REQUESTS_VOLUMNE rate(api_requests_total[5m])
 * @API_LATENCY_AVG rate(api_request_duration_seconds_sum[5m]) / rate(api_request_duration_seconds_count[5m])
 * @ACTIVE_USERS_GAUGE (sum(rate(api_requests_total[1m])) by (instance)) * 60
 * @CONCURRENT_REQUESTS_GAUGE sum(rate(concurrent_http_requests[1m])) by (instance)
 * @MOBILE_VS_WEB_REQUESTS (sum(rate(api_requests_by_user_agent{browser_family="Mobile"}[1m])) by (instance)) / (sum(rate(api_requests_by_user_agent{browser_family="Web"}[1m])) by (instance))
 *
 * === Business Metrics ===
 * @ACCESS_DECISIONS_RATE sum(rate(access_decisions_total[5m]))
 * @ACCESS_DENIAL_RATE sum(rate(access_decisions_total{allowed="false"}[5m])) / sum(rate(access_decisions_total[5m])) * 100
 * @POLICY_EVALUATIONS_RATE sum(rate(policy_evaluations_total[5m]))
 * @AUDIT_LOGS_RATE sum(rate(audit_logs_written_total[5m]))
 * @WEBHOOK_FAILURES_RATE sum(rate(webhook_failures_total[5m]))
 * @TOP_RESOURCES_BY_ACCESS topk(10, sum by (resource) (rate(access_decisions_total[5m])))
 * @WEBHOOK_FAILURES_BY_EVENT sum by (eventType) (rate(webhook_failures_total[5m]))
 */
