import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const port = process.env.PORT;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
      queue: process.env.EMAIL_QUEUE || 'email_queue',
      queueOptions: { durable: true },
    },
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672'],
      queue: process.env.PUSH_QUEUE || 'push_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port ?? 3000);
  console.log(`Notification worker is runing at port: ${port}`);
}
bootstrap();
