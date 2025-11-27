# Grafana Dashboard Queries for Custom Metrics

Quick reference for creating Grafana dashboards with the custom business metrics.

## Access Decisions Metrics

### Panel: Access Decisions Rate (Stat)
```promql
sum(rate(access_decisions_total[5m]))
```
**Unit:** ops/sec

### Panel: Access Decisions Over Time (Time Series)
```promql
sum(rate(access_decisions_total[5m])) by (allowed)
```
**Legend:** `{{allowed}}`

### Panel: Access Allow vs Deny (Pie Chart)
```promql
sum by (allowed) (rate(access_decisions_total[5m]))
```

### Panel: Top Resources by Access Requests (Bar Gauge)
```promql
topk(10, sum by (resource) (rate(access_decisions_total[5m])))
```

### Panel: Access Denial Rate (Gauge)
```promql
sum(rate(access_decisions_total{allowed="false"}[5m])) / sum(rate(access_decisions_total[5m])) * 100
```
**Unit:** percent (0-100)

### Panel: Access Decisions by Tenant (Time Series)
```promql
sum by (tenantId) (rate(access_decisions_total[5m]))
```

## Policy Evaluations Metrics

### Panel: Policy Evaluations Rate (Stat)
```promql
sum(rate(policy_evaluations_total[5m]))
```
**Unit:** ops/sec

### Panel: Policy Evaluations Over Time (Time Series)
```promql
sum by (resource) (rate(policy_evaluations_total[5m]))
```

### Panel: Top Resources by Policy Evaluations (Bar Gauge)
```promql
topk(10, sum by (resource) (rate(policy_evaluations_total[5m])))
```

### Panel: Policy Evaluations by Tenant (Time Series)
```promql
sum by (tenantId) (rate(policy_evaluations_total[5m]))
```

## Audit Logs Metrics

### Panel: Audit Logs Written Rate (Stat)
```promql
sum(rate(audit_logs_written_total[5m]))
```
**Unit:** logs/sec

### Panel: Audit Logs Over Time (Time Series)
```promql
sum(rate(audit_logs_written_total[5m]))
```

### Panel: Audit Logs by Tenant (Time Series)
```promql
sum by (tenantId) (rate(audit_logs_written_total[5m]))
```

### Panel: Top Tenants by Audit Log Volume (Bar Gauge)
```promql
topk(10, sum by (tenantId) (rate(audit_logs_written_total[5m])))
```

## Webhook Failures Metrics

### Panel: Webhook Failures Rate (Stat)
```promql
sum(rate(webhook_failures_total[5m]))
```
**Unit:** failures/sec

### Panel: Webhook Failures Over Time (Time Series)
```promql
sum by (eventType) (rate(webhook_failures_total[5m]))
```

### Panel: Webhook Failures by Event Type (Bar Gauge)
```promql
sum by (eventType) (rate(webhook_failures_total[5m]))
```

### Panel: Webhook Failures by Tenant (Time Series)
```promql
sum by (tenantId) (rate(webhook_failures_total[5m]))
```

### Panel: Top Failing Event Types (Bar Gauge)
```promql
topk(10, sum by (eventType) (rate(webhook_failures_total[5m])))
```

## Combined Dashboard Queries

### Access Decision Breakdown by Resource and Action
```promql
sum by (resource, action) (rate(access_decisions_total[5m]))
```

### Access Decisions with Allowed Status
```promql
sum by (resource, action, allowed) (rate(access_decisions_total[5m]))
```

### Policy Evaluation vs Access Decision Ratio
```promql
sum(rate(policy_evaluations_total[5m])) / sum(rate(access_decisions_total[5m]))
```

## Alerting Queries

### Alert: High Access Denial Rate (>50%)
```promql
sum(rate(access_decisions_total{allowed="false"}[5m])) / sum(rate(access_decisions_total[5m])) * 100 > 50
```

### Alert: Webhook Failure Spike (>10 failures/min)
```promql
sum(rate(webhook_failures_total[5m])) > 10
```

### Alert: High Audit Log Write Rate (>1000 logs/min)
```promql
sum(rate(audit_logs_written_total[5m])) > 1000
```

## Grafana Dashboard Setup Steps

1. **Open Grafana**: Navigate to `http://localhost:3001`
2. **Create Dashboard**: Click "+" → "Create Dashboard"
3. **Add Data Source**: Ensure Prometheus is configured (usually at `http://prometheus:9090`)
4. **Add Panels**:
   - Click "Add panel"
   - Select "Time series" or "Stat" visualization
   - Enter PromQL query from above
   - Configure unit, legend, etc.
5. **Save Dashboard**: Click "Save dashboard"

## Example Complete Dashboard

Create a dashboard with these panels in order:

1. **Row: Access Control**
   - Access Decisions Rate (Stat)
   - Access Allow/Deny (Pie Chart)
   - Access Decisions Over Time (Time Series)
   - Access Denial Rate (Gauge)

2. **Row: Policy Evaluation**
   - Policy Evaluations Rate (Stat)
   - Policy Evaluations Over Time (Time Series)
   - Top Resources (Bar Gauge)

3. **Row: Audit Logs**
   - Audit Logs Written Rate (Stat)
   - Audit Logs by Tenant (Time Series)
   - Top Tenants (Bar Gauge)

4. **Row: Webhooks**
   - Webhook Failures Rate (Stat)
   - Failures by Event Type (Time Series)
   - Top Failing Events (Bar Gauge)

## Testing Metrics

After starting your application, verify metrics are available:

```bash
# Check if metrics are exposed
curl http://localhost:3000/v1/metrics | grep -E "access_decisions_total|policy_evaluations_total|audit_logs_written_total|webhook_failures_total"

# Should see output like:
# access_decisions_total{tenantId="...",resource="...",action="...",allowed="true"} 10
# policy_evaluations_total{tenantId="...",resource="...",action="..."} 10
# audit_logs_written_total{tenantId="..."} 5
# webhook_failures_total{tenantId="...",eventType="..."} 2
```
