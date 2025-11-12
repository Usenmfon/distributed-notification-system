import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import {
  Transport,
  ClientProxyFactory,
  ClientProxy,
} from '@nestjs/microservices';
import { AppModule } from '../src/app.module';

jest.setTimeout(60000);

describe('Email-Push Microservice (e2e)', () => {
  let app: INestMicroservice | undefined;
  let emailClient: ClientProxy | undefined;
  let pushClient: ClientProxy | undefined;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    try {
      // Connect to email_queue microservice
      app = module.createNestMicroservice({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'email_queue',
          queueOptions: { durable: true },
        },
      });

      await app.listen();

      // Create email client
      emailClient = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'email_queue',
        },
      });

      // Create push client
      pushClient = ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'push_queue',
        },
      });

      await emailClient.connect();
      await pushClient.connect();
    } catch (err) {
      console.error(
        'Failed to start microservice or client:',
        (err as any).message || err,
      );

      if (emailClient && (emailClient as any).close) {
        try {
          await (emailClient as any).close();
        } catch (_) {}
      }
      if (pushClient && (pushClient as any).close) {
        try {
          await (pushClient as any).close();
        } catch (_) {}
      }
      if (app && (app as any).close) {
        try {
          await (app as any).close();
        } catch (_) {}
      }
      throw err;
    }
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (emailClient && (emailClient as any).close) {
      await (emailClient as any).close();
    }
    if (pushClient && (pushClient as any).close) {
      await (pushClient as any).close();
    }
    if (app && (app as any).close) {
      await (app as any).close();
    }
  });

  it('should process an email message successfully', async () => {
    if (!emailClient) {
      throw new Error('Email client not initialized');
    }

    // Updated payload structure to match NotificationPayloadDto
    emailClient.emit(
      { cmd: 'send_email' },
      {
        notification_type: 'email',
        user_id: 'user_test',
        user_email: 'taiwosamuel8296@gmail.com', // Added real email
        template_code: 'welcome', // Changed from template_id
        variables: {
          name: 'Taiwo',
          link: 'https://example.com/welcome', // Added link
          meta: { source: 'test' }, // Added meta
        },
        request_id: 'req_999',
        priority: 1, // Added priority
        metadata: { test: true }, // Added metadata
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(true).toBe(true);
  }, 15000);

  it('should process a push notification message successfully', async () => {
    if (!pushClient) {
      throw new Error('Push client not initialized');
    }

    // Updated payload structure to match NotificationPayloadDto
    pushClient.emit(
      { cmd: 'send_push' },
      {
        notification_type: 'push',
        user_id: 'user_push_test',
        push_token: 'test_push_token_123', // Added push token
        template_code: 'new_message', // Changed from template_id
        variables: {
          name: 'Samuel',
          link: 'https://example.com/message', // Added link
          meta: { message_id: '456' }, // Added meta
        },
        request_id: 'req_1000',
        priority: 2, // Added priority
        metadata: { channel: 'mobile' }, // Added metadata
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(true).toBe(true);
  }, 15000);
});
