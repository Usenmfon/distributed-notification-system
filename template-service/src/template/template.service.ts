import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Template_Definition } from '../entities/template_definitions.entity';
import { Template_Version } from '../entities/template_versions.entity';
import { Template_Definition_Dto, Template_Version_Dto } from './dtos';
import { Active_Template_Query_Dto } from './dtos/active_template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template_Definition)
    private readonly template_definition: Repository<Template_Definition>,

    @InjectRepository(Template_Version)
    private readonly template_version: Repository<Template_Version>,

    private readonly entity_manager: EntityManager,
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
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new BadRequestException('Template code already exists');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async activate_version(template_version_id: string) {
    return this.entity_manager.transaction(async (manager) => {
      const version_to_activate = await manager.findOne(Template_Version, {
        where: { id: template_version_id },
        relations: ['definition'],
      });

      if (!version_to_activate) {
        throw new NotFoundException('Version not found');
      }

      await manager.getRepository(Template_Version).update(
        {
          definition: { id: version_to_activate.definition.id },
          language_code: version_to_activate.language_code,
        },
        { is_active: false },
      );
      version_to_activate.is_active = true;
      return await manager.save(version_to_activate);
    });
  }

  async create_template_version(version: Template_Version_Dto) {
    try {
      const definition = await this.template_definition.findOneBy({
        id: version.definition,
      });

      if (!definition) {
        throw new NotFoundException(
          `Template with id ${version.definition} not found`,
        );
      }

      const last_version = await this.template_version.findOne({
        where: {
          definition: {
            id: version.definition,
          },
          language_code: version.language_code,
        },
        order: {
          version: 'DESC',
        },
      });

      const next_version = last_version ? last_version.version + 1 : 1;

      const new_template_version = this.template_version.create({
        definition: definition,
        version: next_version,
        language_code: version.language_code,
        content: version.content,
        is_active: false,
      });

      const saved_template_version =
        await this.template_version.save(new_template_version);

      if (version.is_active === true) {
        return this.activate_version(saved_template_version.id);
      }

      return saved_template_version;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new BadRequestException('Template code already exists');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async get_all_template_definitions() {
    const template_definitions = await this.template_definition.find();

    if (!template_definitions || template_definitions.length === 0) {
      return [];
    }

    return template_definitions;
  }

  async get_active_template(query: Active_Template_Query_Dto) {
    try {
      const { code, lang, type } = query;

      if (
        !code ||
        typeof code !== 'string' ||
        !lang ||
        typeof lang !== 'string' ||
        !type ||
        typeof type !== 'string'
      ) {
        throw new BadRequestException('Invalid parameters in query');
      }

      const active_template = await this.template_version.findOne({
        where: {
          is_active: true,
          definition: {
            template_code: code,
            notification_type: type,
          },
        },
      });

      if (!active_template) {
        throw new NotFoundException('No active template found');
      }

      return active_template;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
