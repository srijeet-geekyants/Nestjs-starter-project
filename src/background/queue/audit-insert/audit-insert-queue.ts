import { JobName, QueueName } from '@bg/constants/job.constant';
import { IAuditInsertJob } from '@bg/interfaces/job.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class AuditInsertQueue {
  private readonly logger = new Logger(AuditInsertQueue.name);

  constructor(@InjectQueue(QueueName.AUDIT_INSERT) private auditInsertQueue: Queue) {}

  async addAuditInsertJob(data: IAuditInsertJob): Promise<void> {
    this.logger.debug(
      `Adding audit insert job for tenant ${data.tenantId}, user ${data.userId || 'N/A'}, resource ${data.resource}, action ${data.action}`
    );
    await this.auditInsertQueue.add(JobName.AUDIT_INSERT, data);
  }
}
