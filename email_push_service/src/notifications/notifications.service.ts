import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import { NotificationPayloadDto } from './dto/notification-payload.dto';
import { StatusUpdateDto, NotificationStatus } from './dto/status-update.dto'; // Add this import

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;
  private statusApiUrl: string;

  async onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.statusApiUrl =
      process.env.STATUS_API_URL ||
      'http://localhost:3000/api/v1/notifications/status';
    console.log('NotificationsService initialized');
  }

  public async sendEmail(data: NotificationPayloadDto) {
    try {
      if (!data.user_email) {
        throw new Error('user_email is required');
      }

      const mailOptions = {
        from: `"Notifier" <${process.env.SMTP_USER}>`,
        to: data.user_email,
        subject: `Notification: ${data.template_code}`,
        html: `
          <h2>Hello ${data.variables?.name || 'User'},</h2>
          <p>This is your ${data.template_code} notification.</p>
          ${data.variables?.link ? `<a href="${data.variables.link}">Click here</a>` : ''}
        `,
      };

      if (
        !this.transporter ||
        typeof this.transporter.sendMail !== 'function'
      ) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.sendMail(mailOptions);

      console.log(
        `Email sent to ${mailOptions.to} (request_id: ${data.request_id})`,
      );

      // Update status to DELIVERED
      await this.reportStatus({
        notification_id: data.request_id,
        status: NotificationStatus.DELIVERED, // Now this will work
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error sending email:', (err as any).message || err);

      // Update Status to FAILED
      await this.reportStatus({
        notification_id: data.request_id,
        status: NotificationStatus.FAILED, // Now this will work
        timestamp: new Date(),
        error: (err as any).message,
      });

      throw err;
    }
  }

  public async sendPushNotification(data: NotificationPayloadDto) {
    try {
      if (!data.push_token) {
        throw new Error('push_token is required');
      }

      const apiUrl = process.env.PUSH_API_URL;
      if (!apiUrl) {
        throw new Error('PUSH_API_URL not configured');
      }

      const payload = {
        token: data.push_token,
        title: `Notification: ${data.template_code}`,
        body: `Hey ${data.variables?.name || 'User'}, check your update`,
        data: {
          link: data.variables?.link,
          meta: data.variables?.meta,
        },
      };

      await axios.post(apiUrl, payload);

      console.log(
        `Push notification sent to ${data.user_id} (request_id: ${data.request_id})`,
      );

      await this.reportStatus({
        notification_id: data.request_id,
        status: NotificationStatus.DELIVERED, // Now this will work
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error sending push:', (err as any).message || err);

      await this.reportStatus({
        notification_id: data.request_id,
        status: NotificationStatus.FAILED, // Now this will work
        timestamp: new Date(),
        error: (err as any).message,
      });

      throw err;
    }
  }

  private async reportStatus(statusUpdate: StatusUpdateDto) {
    try {
      if (!this.statusApiUrl) {
        console.log('STATUS_API_URL not configured, skipping status report');
        return;
      }

      await axios.post(this.statusApiUrl, statusUpdate);
      console.log(
        `Status reported: ${statusUpdate.notification_id} - ${statusUpdate.status}`,
      );
    } catch (err) {
      console.error('Failed to report status:', (err as any).message || err);
      // Don't throw - status reporting failure shouldn't break notification delivery
    }
  }
}
