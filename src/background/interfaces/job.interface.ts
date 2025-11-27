import { CronJobName, QueueName } from '@bg/constants/job.constant';

export interface IEmailJob {
  email: string;
  customerName?: string;
}

export interface IOtpEmailJob extends IEmailJob {
  otp: number;
  passwordResetLink?: string;
  passwordSetLink?: string;
}

export interface IMediaUploadJob {
  file: Express.Multer.File;
  metadata?: Record<string, any>;
}

export interface ICronJob {
  jobType: CronJobName;
  data?: any;
  options?: {
    priority?: number;
    timestamp?: number;
  };
}

export interface INotificationJob {
  deviceTokens: string[];
  subject: string;
  message: string;
  url: string;
  data: Record<string, any>;
}

export interface INotificationTopicJob {
  topic: string;
  subject: string;
  message: string;
  url: string;
  data: Record<string, any>;
}

export interface ISendNotificationJob {
  user_ids: string[];
  subject: string;
  message: string;
  url: string;
  notification_type: string;
  data?: Record<string, any>;
}

export interface IDLQFailedJobData {
  originalQueueName: QueueName;
  originalJobId: string;
  originalJobName: string;
  originalJobData: any;
  failedReason: string;
  stacktrace?: string[];
  timestamp: number;
}

export interface IPolicyEvaluateJob {
  tenantId: string;
  userId: string;
  resource: string;
  action: string;
  context: any;
  requestId: string;
}
export interface IAuditInsertJob {
  tenantId: string;
  userId?: string;
  resource: string;
  action: string;
  allowed: boolean;
  context: any;
}

export interface IWebhookDispatchJob {
  tenantId: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, any>;
}
