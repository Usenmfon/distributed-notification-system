import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TemplateModule } from './template/template.module';
import { Template_Definition } from './entities/template_definitions.entity';
import { Template_Version } from './entities/template_versions.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [Template_Definition, Template_Version],
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize: true,
    }),
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
