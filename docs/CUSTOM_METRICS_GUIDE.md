# Custom Business Metrics Guide

This guide explains how to use the custom Prometheus metrics for access control, policy evaluation, audit logs, and webhook monitoring.

## Available Metrics

### 1. `access_decisions_total`
**Description:** Total number of access control decisions made
**Labels:** `tenantId`, `resource`, `action`, `allowed`
**Type:** Counter

### 2. `policy_evaluations_total`
**Description:** Total number of policy evaluations performed
**Labels:** `tenantId`, `resource`, `action`
**Type:** Counter

### 3. `audit_logs_written_total`
**Description:** Total number of audit logs written to database
**Labels:** `tenantId`
**Type:** Counter

### 4. `webhook_failures_total`
**Description:** Total number of webhook delivery failures
**Labels:** `tenantId`, `eventType`
**Type:** Counter

## Prometheus Queries

### Access Decisions

#### Total Access Decisions (All Time)
```promql
sum(access_decisions_total)
```

#### Access Decisions Rate (per minute)
```promql
sum(rate(access_decisions_total[1m]))
```

#### Access Decisions by Allowed/Denied
```promql
sum by (allowed) (access_decisions_total)
```

#### Access Decisions by Resource
```promql
sum by (resource) (rate(access_decisions_total[5m]))
```

#### Access Decisions by Tenant
```promql
sum by (tenantId) (rate(access_decisions_total[5m]))
```

#### Access Denial Rate
```promql
sum(rate(access_decisions_total{allowed="false"}[5m])) / sum(rate(access_decisions_total[5m])) * 100
```

#### Top Resources by Access Requests
```promql
topk(10, sum by (resource) (rate(access_decisions_total[5m])))
```

### Policy Evaluations

#### Total Policy Evaluations (All Time)
```promql
sum(policy_evaluations_total)
```

#### Policy Evaluations Rate (per minute)
```promql
sum(rate(policy_evaluations_total[1m]))
```

#### Policy Evaluations by Resource and Action
```promql
sum by (resource, action) (rate(policy_evaluations_total[5m]))
```

#### Policy Evaluations by Tenant
```promql
sum by (tenantId) (rate(policy_evaluations_total[5m]))
```

#### Most Evaluated Resources
```promql
topk(10, sum by (resource) (rate(policy_evaluations_total[5m])))
```

### Audit Logs

#### Total Audit Logs Written (All Time)
```promql
sum(audit_logs_written_total)
```

#### Audit Logs Written Rate (per minute)
```promql
sum(rate(audit_logs_written_total[1m]))
```

#### Audit Logs by Tenant
```promql
sum by (tenantId) (rate(audit_logs_written_total[5m]))
```

#### Top Tenants by Audit Log Volume
```promql
topk(10, sum by (tenantId) (rate(audit_logs_written_total[5m])))
```

### Webhook Failures

#### Total Webhook Failures (All Time)
```promql
sum(webhook_failures_total)
```

#### Webhook Failure Rate (per minute)
```promql
sum(rate(webhook_failures_total[1m]))
```

#### Webhook Failures by Event Type
```promql
sum by (eventType) (rate(webhook_failures_total[5m]))
```

#### Webhook Failures by Tenant
```promql
sum by (tenantId) (rate(webhook_failures_total[5m]))
```

#### Webhook Failure Rate Percentage
```promql
sum(rate(webhook_failures_total[5m])) / sum(rate(webhook_deliveries_total[5m])) * 100
```

#### Top Failing Event Types
```promql
topk(10, sum by (eventType) (rate(webhook_failures_total[5m])))
```

## Grafana Dashboard Panels

### Panel 1: Access Decisions Overview
**Type:** Stat
**Query:**
```promql
sum(rate(access_decisions_total[5m]))
```
**Unit:** ops/sec

### Panel 2: Access Allow/Deny Ratio
**Type:** Pie Chart
**Query:**
```promql
sum by (allowed) (rate(access_decisions_total[5m]))
```

### Panel 3: Access Decisions Over Time
**Type:** Time Series
**Query:**
```promql
sum(rate(access_decisions_total[5m])) by (allowed)
```
**Legend:** `{{allowed}}`

### Panel 4: Top Resources by Access Requests
**Type:** Bar Gauge
**Query:**
```promql
topk(10, sum by (resource) (rate(access_decisions_total[5m])))
```

### Panel 5: Policy Evaluations Rate
**Type:** Stat
**Query:**
```promql
sum(rate(policy_evaluations_total[5m]))
```
**Unit:** ops/sec

### Panel 6: Policy Evaluations by Resource
**Type:** Time Series
**Query:**
```promql
sum by (resource) (rate(policy_evaluations_total[5m]))
```

### Panel 7: Audit Logs Written Rate
**Type:** Stat
**Query:**
```promql
sum(rate(audit_logs_written_total[5m]))
```
**Unit:** logs/sec

### Panel 8: Audit Logs by Tenant
**Type:** Time Series
**Query:**
```promql
sum by (tenantId) (rate(audit_logs_written_total[5m]))
```

### Panel 9: Webhook Failures Rate
**Type:** Stat
**Query:**
```promql
sum(rate(webhook_failures_total[5m]))
```
**Unit:** failures/sec

### Panel 10: Webhook Failures by Event Type
**Type:** Time Series
**Query:**
```promql
sum by (eventType) (rate(webhook_failures_total[5m]))
```

### Panel 11: Access Denial Rate
**Type:** Gauge
**Query:**
```promql
sum(rate(access_decisions_total{allowed="false"}[5m])) / sum(rate(access_decisions_total[5m])) * 100
```
**Unit:** percent (0-100)

### Panel 12: Webhook Failure Rate Percentage
**Type:** Gauge
**Query:**
```promql
sum(rate(webhook_failures_total[5m])) / (sum(rate(webhook_failures_total[5m])) + sum(rate(webhook_successes_total[5m]))) * 100
```
**Note:** Requires `webhook_successes_total` metric if available, or adjust based on your webhook delivery metrics.

## Grafana Dashboard JSON

Here's a complete Grafana dashboard JSON you can import:

```json
{
  "dashboard": {
    "title": "Business Metrics Dashboard",
    "panels": [
      {
        "title": "Access Decisions Rate",
        "targets": [{
          "expr": "sum(rate(access_decisions_total[5m]))"
        }],
        "type": "stat"
      },
      {
        "title": "Access Allow/Deny",
        "targets": [{
          "expr": "sum by (allowed) (rate(access_decisions_total[5m]))"
        }],
        "type": "piechart"
      },
      {
        "title": "Policy Evaluations Rate",
        "targets": [{
          "expr": "sum(rate(policy_evaluations_total[5m]))"
        }],
        "type": "stat"
      },
      {
        "title": "Audit Logs Written Rate",
        "targets": [{
          "expr": "sum(rate(audit_logs_written_total[5m]))"
        }],
        "type": "stat"
      },
      {
        "title": "Webhook Failures Rate",
        "targets": [{
          "expr": "sum(rate(webhook_failures_total[5m]))"
        }],
        "type": "stat"
      }
    ]
  }
}
```

## Accessing Metrics

### Prometheus Endpoint
```
http://localhost:3000/v1/metrics
```

### View Metrics in Prometheus
1. Open Prometheus UI: `http://localhost:9090`
2. Go to "Graph" tab
3. Enter any of the queries above
4. Click "Execute"

### View Metrics in Grafana
1. Open Grafana: `http://localhost:3001`
2. Create a new dashboard
3. Add panels with the queries above
4. Save dashboard

## Alerting Rules

### Example Alert: High Access Denial Rate
```yaml
groups:
  - name: access_control_alerts
    rules:
      - alert: HighAccessDenialRate
        expr: |
          sum(rate(access_decisions_total{allowed="false"}[5m])) /
          sum(rate(access_decisions_total[5m])) * 100 > 50
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High access denial rate detected"
          description: "Access denial rate is {{ $value }}% (threshold: 50%)"
```

### Example Alert: Webhook Failure Spike
```yaml
      - alert: WebhookFailureSpike
        expr: |
          rate(webhook_failures_total[5m]) > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Webhook failure spike detected"
          description: "Webhook failures: {{ $value }} failures/sec"
```

## Integration Points

The metrics are automatically incremented at:
- **Access Decisions:** `AccessService.checkAccess()` - when access is checked
- **Policy Evaluations:** `PoliciesService.evaluateAccess()` - when policies are evaluated
- **Audit Logs:** `AuditInsertQueueService.insertAuditLog()` - when audit log is successfully written
- **Webhook Failures:** `WebhookDispatchQueueService.dispatchWebhook()` - when webhook delivery fails
