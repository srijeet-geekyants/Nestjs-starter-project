import { Injectable, Logger } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { IAuditInsertJob } from '@bg/interfaces/job.interface';
import { randomUUID } from 'crypto';
import { MetricsService } from '@metrics/metrics.service';

@Injectable()
export class AuditInsertQueueService {
  private readonly logger = new Logger(AuditInsertQueueService.name);

  constructor(
    private readonly dbService: DBService,
    private readonly metricsService: MetricsService
  ) {}

  async insertAuditLog(data: IAuditInsertJob): Promise<{ id: string }> {
    try {
      const auditLog = await this.dbService.audit_logs.create({
        data: {
          id: randomUUID(),
          tenant_id: data.tenantId,
          user_id: data.userId || null,
          resource: data.resource,
          action: data.action,
          allowed: data.allowed,
          context: data.context || null,
        },
      });

      this.logger.debug(
        `Successfully inserted audit log with id ${auditLog.id} for tenant ${data.tenantId}, user ${data.userId || 'N/A'}, resource ${data.resource}, action ${data.action}`
      );

      // Increment audit log written metric
      this.metricsService.incrementAuditLogWritten(data.tenantId);

      return { id: auditLog.id };
    } catch (error) {
      this.logger.error(
        `Failed to insert audit log for tenant ${data.tenantId}, user ${data.userId || 'N/A'}: ${(error as Error)?.message}`,
        (error as Error)?.stack
      );
      throw error;
    }
  }
}
