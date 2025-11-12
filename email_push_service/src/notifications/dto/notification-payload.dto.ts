export class NotificationVariablesDto {
  name: string;
  link: string;
  meta?: any;
}

export class NotificationPayloadDto {
  notification_type: 'email' | 'push';
  user_id: string;
  user_email?: string;
  push_token?: string;
  template_code: string;
  variables: NotificationVariablesDto;
  request_id: string;
  priority: number;
  metadata?: any;
}
