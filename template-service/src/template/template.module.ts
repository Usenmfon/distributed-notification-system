import { Module } from '@nestjs/common';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template_Definition } from '../entities/template_definitions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template_Definition])],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
