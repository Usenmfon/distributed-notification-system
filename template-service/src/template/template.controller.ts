import { Body, Controller, Post } from '@nestjs/common';
import { TemplateService } from './template.service';
import { Template_Definition_Dto } from './dtos';

@Controller('api/v1/templates')
export class TemplateController {
  constructor(private readonly template_service: TemplateService) {}

  @Post()
  create_template_definition(
    @Body() template_definition: Template_Definition_Dto,
  ) {
    return this.template_service.create_template_definition(
      template_definition,
    );
  }
}
