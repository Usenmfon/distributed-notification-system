import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template_Definition } from '../entities/template_definitions.entity';
import { Template_Version } from '../entities/template_versions.entity';
import { Template_Definition_Dto } from './dtos';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template_Definition)
    private readonly template_definition: Repository<Template_Definition>,

    @InjectRepository(Template_Version)
    private readonly template_version: Repository<Template_Version>,
  ) {}

  async create_template_definition(
    template_definition: Template_Definition_Dto,
  ) {
    try {
      const { template_code, notification_type, description } =
        template_definition;

      if (!template_code || !notification_type || !description) {
        throw new BadRequestException('All fields are required');
      }

      const new_template_definition = this.template_definition.create({
        template_code,
        notification_type,
        description,
      });

      if (!new_template_definition) {
        throw new BadRequestException('Something went wrong');
      }

      return this.template_definition.save(new_template_definition);
    } catch (error) {
      console.log(error.message);
    }
  }
}
