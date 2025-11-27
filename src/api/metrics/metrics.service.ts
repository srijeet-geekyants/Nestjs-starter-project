import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class MetricsService {
  private readonly totalHttpRequests: Counter<string>;
  private readonly concurrentRequests: Gauge<string>;
  private readonly activeUsersGauge: Gauge<string>;
  private readonly apiRequestDuration: Histogram<string>;
  private readonly apiRequestCounter: Counter<string>;
  private readonly apiErrorCounter: Counter<string>;
  private readonly userAgentCounter: Counter<string>;
  private readonly refererCounter: Counter<string>;
  private readonly totalMobileRequests: Counter<string>;
  private readonly totalWebRequests: Counter<string>;

  // Custom business metrics
  private readonly accessDecisionsTotal: Counter<string>;
  private readonly policyEvaluationsTotal: Counter<string>;
  private readonly auditLogsWrittenTotal: Counter<string>;
  private readonly webhookFailuresTotal: Counter<string>;

  constructor() {
    this.totalHttpRequests = new Counter({
      name: 'total_http_requests',
      help: 'Total number of HTTP requests',
    });

    this.concurrentRequests = new Gauge({
      name: 'concurrent_http_requests',
      help: 'Number of concurrent HTTP requests',
    });

    this.activeUsersGauge = new Gauge({
      name: 'active_users_gauge',
      help: 'Number of active unique IP addresses in the last 5 minutes',
    });

    this.apiRequestDuration = new Histogram({
      name: 'api_request_duration_seconds',
      help: 'Duration of API requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5, 10],
    });

    this.apiRequestCounter = new Counter({
      name: 'api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'route', 'status'],
    });

    this.apiErrorCounter = new Counter({
      name: 'api_request_errors_total',
      help: 'Total number of API request failures',
      labelNames: ['method', 'route', 'status'],
    });

    this.userAgentCounter = new Counter({
      name: 'api_requests_by_user_agent',
      help: 'Total requests grouped by browser',
      labelNames: ['browser_family'],
    });

    this.refererCounter = new Counter({
      name: 'api_requests_by_referer',
      help: 'Total requests grouped by referer domain',
      labelNames: ['referer_domain'],
    });

    this.totalMobileRequests = new Counter({
      name: 'total_mobile_requests',
      help: 'Total requests grouped by Mobile',
      labelNames: ['mobile_request'],
    });

    this.totalWebRequests = new Counter({
      name: 'total_web_requests',
      help: 'Total requests grouped by Web',
      labelNames: ['web_request'],
    });

    // Custom business metrics
    this.accessDecisionsTotal = new Counter({
      name: 'access_decisions_total',
      help: 'Total number of access control decisions made',
      labelNames: ['tenantId', 'resource', 'action', 'allowed'],
    });

    this.policyEvaluationsTotal = new Counter({
      name: 'policy_evaluations_total',
      help: 'Total number of policy evaluations performed',
      labelNames: ['tenantId', 'resource', 'action'],
    });

    this.auditLogsWrittenTotal = new Counter({
      name: 'audit_logs_written_total',
      help: 'Total number of audit logs written to database',
      labelNames: ['tenantId'],
    });

    this.webhookFailuresTotal = new Counter({
      name: 'webhook_failures_total',
      help: 'Total number of webhook delivery failures',
      labelNames: ['tenantId', 'eventType'],
    });
  }

  incrementHttpRequests() {
    this.totalHttpRequests.inc();
  }

  incrementConcurrentRequests() {
    this.concurrentRequests.inc();
  }

  decrementConcurrentRequests() {
    this.concurrentRequests.dec();
  }

  setActiveUsers(value: number) {
    this.activeUsersGauge.set(value);
  }

  observeRequestDuration(method: string, route: string, status: string, duration: number) {
    this.apiRequestDuration.labels(method, route, status).observe(duration);
  }

  incrementApiRequestCounter(method: string, route: string, status: string) {
    this.apiRequestCounter.labels(method, route, status).inc();
  }

  incrementApiErrorCounter(method: string, route: string, status: string) {
    this.apiErrorCounter.labels(method, route, status).inc();
  }

  incrementUserAgentCounter(userAgentString: string) {
    const parser = new UAParser(userAgentString || '');
    const browserFamily = parser.getBrowser().name || 'Unknown';
    this.userAgentCounter.labels(browserFamily).inc();
  }

  incrementRefererCounter(refererString: string) {
    if (!refererString) {
      this.refererCounter.labels('unknown').inc();
      return;
    }
    try {
      const url = new URL(refererString);
      const hostname = url.hostname || 'unknown';
      this.refererCounter.labels(hostname).inc();
    } catch {
      this.refererCounter.labels('invalid-url').inc();
    }
  }

  incrementMobileWebReqCounter(isMobile: boolean) {
    if (isMobile) this.totalMobileRequests.inc();
    else this.totalWebRequests.inc();
  }

  // Custom business metrics methods
  incrementAccessDecision(tenantId: string, resource: string, action: string, allowed: boolean) {
    this.accessDecisionsTotal.labels(tenantId, resource, action, allowed.toString()).inc();
  }

  incrementPolicyEvaluation(tenantId: string, resource: string, action: string) {
    this.policyEvaluationsTotal.labels(tenantId, resource, action).inc();
  }

  incrementAuditLogWritten(tenantId: string) {
    this.auditLogsWrittenTotal.labels(tenantId).inc();
  }

  incrementWebhookFailure(tenantId: string, eventType: string) {
    this.webhookFailuresTotal.labels(tenantId, eventType).inc();
  }
}
