import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { Template_Definition_Dto, Template_Version_Dto } from './dtos';
import { Active_Template_Query_Dto } from './dtos/active_template.dto';

@Controller('api/v1/templates')
export class TemplateController {
  constructor(private readonly template_service: TemplateService) {}

  @Get()
  get_all_template_definitions() {
    return this.template_service.get_all_template_definitions();
  }

  @Post()
  create_template_definition(
    @Body() template_definition: Template_Definition_Dto,
  ) {
    return this.template_service.create_template_definition(
      template_definition,
    );
  }

  @Get('/active')
  get_active_template(@Query() query: Active_Template_Query_Dto) {
    return this.template_service.get_active_template(query);
  }

  @Post('/:template_id/versions')
  create_template_version(@Body() template_version: Template_Version_Dto) {
    return this.template_service.create_template_version(template_version);
  }

  @Patch('/versions/:version_id/activate')
  activate_version(@Param('version_id') version_id: string) {
    return this.template_service.activate_version(version_id);
  }
}
