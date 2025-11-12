import { Module } from '@nestjs/common';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template_Definition } from './entities/template_definitions.entity';
import { Template_Version } from './entities/template_versions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template_Definition, Template_Version])],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
