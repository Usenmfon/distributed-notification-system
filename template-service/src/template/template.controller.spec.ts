import { Test, TestingModule } from '@nestjs/testing';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { Template_Definition_Dto, Template_Version_Dto } from './dtos';
import { Active_Template_Query_Dto } from './dtos/active_template.dto';
import { Template_Version } from './entities/template_versions.entity';
import { Template_Definition } from './entities/template_definitions.entity';

const mockTemplateService = {
  get_all_template_definitions: jest.fn(),
  create_template_definition: jest.fn(),
  get_active_template: jest.fn(),
  create_template_version: jest.fn(),
  activate_version: jest.fn(),
};

describe('TemplateController', () => {
  let controller: TemplateController;
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
      ],
    }).compile();

    controller = module.get<TemplateController>(TemplateController);
    service = module.get<TemplateService>(TemplateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get_all_template_definitions', () => {
    it('should return all the template definitions', async () => {
      const mockDefinition = {
        id: 'uuid-uuid-1',
        template_code: 'welcome',
        notification_type: 'push',
        description: 'welcome to organization',
      } as Template_Definition;
      const mockDefinitions = [mockDefinition];

      mockTemplateService.get_all_template_definitions.mockResolvedValue(
        mockDefinitions,
      );

      const result = await controller.get_all_template_definitions();

      expect(result).toEqual(mockDefinitions);
      expect(
        mockTemplateService.get_all_template_definitions,
      ).toHaveBeenCalled();
    });
  });

  describe('create_template_definition', () => {
    it('should call service and create a new template definition', async () => {
      const mockDto = {
        template_code: 'welcome',
        notification_type: 'push',
        description: 'welcome to organization',
      } as Template_Definition_Dto;

      const mockResult = {
        id: 'uuid-uuid-1',
        ...mockDto,
      } as Template_Definition;

      mockTemplateService.create_template_definition.mockResolvedValue(
        mockResult,
      );

      const result = await controller.create_template_definition(mockDto);

      expect(result).toEqual(mockResult);
      expect(
        mockTemplateService.create_template_definition,
      ).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('get_active_template', () => {
    it('should call the service with the query parameters and get active templates', async () => {
      const mockQuery = {
        code: 'welcome',
        lang: 'en',
        type: 'push',
      } as Active_Template_Query_Dto;

      const mockResult = {
        id: 'uuid-version-1',
        version: 2,
        language_code: 'en',
        content: {
          body: 'welcome to this place',
          subject: 'welcome',
        },
        is_active: true,
      } as Template_Version;

      mockTemplateService.get_active_template.mockResolvedValue(mockResult);

      const result = await controller.get_active_template(mockQuery);

      expect(result).toEqual(mockResult);
      expect(mockTemplateService.get_active_template).toHaveBeenCalledWith(
        mockQuery,
      );
    });
  });

  describe('create_template_version', () => {
    it('should call service with dto to create a new template version', async () => {
      const mockDto = {
        definition: 'uuid-def-1',
        language_code: 'en',
        content: {
          subject: 'welcome',
          body: 'welcome on board',
        },
      } as Template_Version_Dto;

      const mockResult = {
        id: 'uuid-v1',
        ...mockDto,
      } as unknown as Template_Version;

      mockTemplateService.create_template_version.mockResolvedValue(mockResult);

      const result = await controller.create_template_version(mockDto);

      expect(result).toEqual(mockResult);
      expect(service.create_template_version).toHaveBeenCalledWith(mockDto);
      expect(service.create_template_version).toHaveBeenCalledTimes(1);
    });
  });

  describe('activate_version', () => {
    it('should call the service with the version_id param', async () => {
      const version_id = 'uuid-v1-to-activate';
      const mockResult = { id: version_id, is_active: true };
      mockTemplateService.activate_version.mockResolvedValue(mockResult);

      const result = await controller.activate_version(version_id);

      expect(result).toEqual(mockResult);
      expect(service.activate_version).toHaveBeenCalledWith(version_id);
      expect(service.activate_version).toHaveBeenCalledTimes(1);
    });
  });
});
