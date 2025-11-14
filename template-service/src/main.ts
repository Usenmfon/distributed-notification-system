import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Template Service')
    .setDescription('Template Service that serves content for the whole notification application')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  console.log('Connected to the database successfully...');
  console.log(`Access the docs here: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
