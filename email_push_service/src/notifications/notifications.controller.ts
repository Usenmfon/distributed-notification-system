import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { NotificationPayloadDto } from './dto/notification-payload.dto';

@Controller('notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('health')
  healthCheck() {
    return {
      success: true,
      message: 'Notification push and service is healthy',
    };
  }

  @EventPattern({ cmd: 'send_email' })
  async handleSendEmail(
    @Payload() data: NotificationPayloadDto,
    @Ctx() context: RmqContext,
  ) {
    const originalMsg = context.getMessage();
    const queue = (originalMsg as any).fields?.routingKey || 'unknown';

    // Only process if from email_queue
    if (queue.includes('email') || queue === 'email_queue') {
      console.log('Controller received email job:', data);
      await this.notificationsService.sendEmail(data);
    }
  }

  @EventPattern({ cmd: 'send_push' })
  async handleSendPush(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const queue = (originalMsg as any).fields?.routingKey || 'unknown';

    // Only process if from push_queue
    if (queue.includes('push') || queue === 'push_queue') {
      console.log('Controller received push job:', data);
      await this.notificationsService.sendPushNotification(data);
    }
  }
}
