export enum NotificationStatus {
  DELIVERED = 'delivered',
  PENDING = 'pending',
  FAILED = 'failed',
}

export class StatusUpdateDto {
  notification_id: string;
  status: NotificationStatus;
  timestamp?: Date;
  error?: string;
}
