import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Template_Definition } from './entities/template_definitions.entity';
import { Template_Version } from './entities/template_versions.entity';
import { Template_Definition_Dto, Template_Version_Dto } from './dtos';
import { Active_Template_Query_Dto } from './dtos/active_template.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockEntityManager = Partial<Record<keyof EntityManager, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
});

const createMockEntityManager = (): MockEntityManager & {
  getRepository: jest.Mock;
} => ({
  transaction: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  getRepository: jest.fn(() => createMockRepository()),
});

describe('TemplateService', () => {
  let service: TemplateService;
  let defRepository: MockRepository<Template_Definition>;
  let verRepository: MockRepository<Template_Version>;
  let entityManager: MockEntityManager & { getRepository: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        {
          provide: getRepositoryToken(Template_Definition),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Template_Version),
          useValue: createMockRepository(),
        },
        {
          provide: EntityManager,
          useValue: createMockEntityManager(),
        },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    defRepository = module.get(getRepositoryToken(Template_Definition));
    verRepository = module.get(getRepositoryToken(Template_Version));
    entityManager = module.get(EntityManager);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create_template_definition', () => {
    it('should create and save a new template definition', async () => {
      const dto: Template_Definition_Dto = {
        template_code: 'welcome',
        notification_type: 'email',
        description: 'Welcome email',
      };
      const mockDefinition = { ...dto, id: 'uuid-1' };
      const mockSavedDefinition = { ...mockDefinition };

      defRepository.create.mockReturnValue(mockDefinition);
      defRepository.save.mockResolvedValue(mockSavedDefinition);

      const result = await service.create_template_definition(dto);

      expect(result).toEqual(mockSavedDefinition);
      expect(defRepository.create).toHaveBeenCalledWith(dto);
      expect(defRepository.save).toHaveBeenCalledWith(mockDefinition);
    });

    it('should throw BadRequestException if fields are missing', async () => {
      const dto = {
        template_code: 'welcome',
        notification_type: 'email',
        description: null,
      } as unknown as Template_Definition_Dto;
      await expect(service.create_template_definition(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if template code already exists', async () => {
      const dto: Template_Definition_Dto = {
        template_code: 'welcome',
        notification_type: 'email',
        description: 'Welcome email',
      };
      defRepository.create.mockReturnValue(dto);
      const mockError = { code: '23505' };
      defRepository.save.mockRejectedValue(mockError);

      await expect(service.create_template_definition(dto)).rejects.toEqual(
        mockError,
      );
    });
  });

  describe('create_template_version', () => {
    let mockDto: Template_Version_Dto;
    let mockParentDefinition: Template_Definition;
    let mockObjectToCreate: Partial<Template_Version>;
    let mockSavedVersion: Template_Version;

    beforeEach(() => {
      mockDto = {
        definition: 'uuid-def-1',
        language_code: 'en',
        content: { subject: 'welcome', body: 'welcome on board' },
        is_active: false,
      };
      mockParentDefinition = { id: 'uuid-def-1' } as Template_Definition;

      mockObjectToCreate = {
        definition: mockParentDefinition,
        language_code: 'en',
        content: { subject: 'welcome', body: 'welcome on board' },
        version: 1,
        is_active: false,
      };
      mockSavedVersion = {
        id: 'uuid-ver-1',
        ...mockObjectToCreate,
      } as Template_Version;
    });

    it('should create a new template version (v1) successfully', async () => {
      defRepository.findOneBy.mockResolvedValue(mockParentDefinition);
      verRepository.findOne.mockResolvedValue(null);
      verRepository.create.mockReturnValue(mockObjectToCreate);
      verRepository.save.mockResolvedValue(mockSavedVersion);

      const result = await service.create_template_version(mockDto);

      expect(result).toEqual(mockSavedVersion);
      expect(defRepository.findOneBy).toHaveBeenCalledWith({
        id: 'uuid-def-1',
      });
      expect(verRepository.findOne).toHaveBeenCalled();
      expect(verRepository.create).toHaveBeenCalledWith(mockObjectToCreate);
      expect(verRepository.save).toHaveBeenCalledWith(mockObjectToCreate);
    });

    it('should correctly increment the version number', async () => {
      const mockLastVersion = { ...mockObjectToCreate, version: 1 };
      defRepository.findOneBy.mockResolvedValue(mockParentDefinition);
      verRepository.findOne.mockResolvedValue(mockLastVersion);
      verRepository.create.mockImplementation((obj) => obj);
      verRepository.save.mockImplementation(async (obj) => obj);

      await service.create_template_version(mockDto);

      expect(verRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ version: 2 }),
      );
    });

    it('should call activate_version if is_active is true', async () => {
      mockDto.is_active = true;
      const mockActivatedVersion = { ...mockSavedVersion, is_active: true };

      defRepository.findOneBy.mockResolvedValue(mockParentDefinition);
      verRepository.findOne.mockResolvedValue(null);
      verRepository.create.mockReturnValue(mockObjectToCreate);
      verRepository.save.mockResolvedValue(mockSavedVersion);

      const activateSpy = jest
        .spyOn(service, 'activate_version')
        .mockResolvedValue(mockActivatedVersion as any);

      const result = await service.create_template_version(mockDto);

      expect(result).toEqual(mockActivatedVersion);
      expect(activateSpy).toHaveBeenCalledWith(mockSavedVersion.id);

      activateSpy.mockRestore();
    });

    it('should throw an error if parent definition is not found', async () => {
      defRepository.findOneBy.mockResolvedValue(null);
      await expect(service.create_template_version(mockDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('activate_version', () => {
    it('should activate a version and deactivate others in a transaction', async () => {
      const versionId = 'uuid-ver-1';
      const mockVersionToActivate = {
        id: versionId,
        is_active: false,
        language_code: 'en',
        definition: { id: 'uuid-def-1' },
      };
      const mockSavedActivatedVersion = {
        ...mockVersionToActivate,
        is_active: true,
      };

      const mockUpdateRepo = createMockRepository();
      const mockManager = {
        findOne: jest.fn().mockResolvedValue(mockVersionToActivate),
        getRepository: jest.fn(() => mockUpdateRepo),
        save: jest.fn().mockResolvedValue(mockSavedActivatedVersion),
      };

      entityManager.transaction.mockImplementation(async (cb) =>
        cb(mockManager),
      );

      const result = await service.activate_version(versionId);

      expect(result).toEqual(mockSavedActivatedVersion);
      expect(mockManager.findOne).toHaveBeenCalledWith(Template_Version, {
        where: { id: versionId },
        relations: ['definition'],
      });
      expect(mockManager.getRepository).toHaveBeenCalledWith(Template_Version);

      expect(mockUpdateRepo.update).toHaveBeenCalledWith(
        {
          definition: { id: 'uuid-def-1' },
          language_code: 'en',
        },
        { is_active: false },
      );
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: true }),
      );
    });

    it('should throw NotFoundException if version to activate is not found', async () => {
      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      entityManager.transaction.mockImplementation(async (cb) =>
        cb(mockManager),
      );

      await expect(service.activate_version('uuid-404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('get_all_template_definitions', () => {
    it('should return all template definitions', async () => {
      const mockDefinitions = [{ id: 'uuid-1' }, { id: 'uuid-2' }];
      defRepository.find.mockResolvedValue(mockDefinitions);
      const result = await service.get_all_template_definitions();
      expect(result).toEqual(mockDefinitions);
    });

    it('should return an empty array if no definitions are found', async () => {
      defRepository.find.mockResolvedValue([]);
      const result = await service.get_all_template_definitions();
      expect(result).toEqual([]);
    });
  });

  describe('get_active_template', () => {
    it('should return the active template', async () => {
      const mockQuery: Active_Template_Query_Dto = {
        code: 'welcome',
        type: 'email',
        lang: 'en',
      };
      const mockActiveTemplate = { id: 'uuid-ver-1', is_active: true };
      verRepository.findOne.mockResolvedValue(mockActiveTemplate);

      const result = await service.get_active_template(mockQuery);

      expect(result).toEqual(mockActiveTemplate);

      expect(verRepository.findOne).toHaveBeenCalledWith({
        where: {
          is_active: true,
          definition: {
            template_code: 'welcome',
            notification_type: 'email',
          },
        },
      });
    });

    it('should throw NotFoundException if no active template is found', async () => {
      const mockQuery: Active_Template_Query_Dto = {
        code: 'non-existent',
        type: 'email',
        lang: 'en',
      };
      verRepository.findOne.mockResolvedValue(null);

      await expect(service.get_active_template(mockQuery)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if query params are invalid', async () => {
      const invalidQuery = {
        code: 'welcome',
        type: null,
        lang: 'en',
      } as unknown as Active_Template_Query_Dto;
      await expect(service.get_active_template(invalidQuery)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
