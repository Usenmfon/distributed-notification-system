import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;
  let mockCacheManager: any;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    push_token: null,
    preferences: { email: true, push: true },
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        preferences: { email: true, push: true },
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        preferences: { email: true, push: true },
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [mockUser];
      mockRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: users,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.remove(mockUser.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
      expect(mockCacheManager.del).toHaveBeenCalled();
    });
  });

  describe('getUserPreferences', () => {
    it('should return cached preferences if available', async () => {
      const preferences = { email: true, push: false };
      mockCacheManager.get.mockResolvedValue(preferences);

      const result = await service.getUserPreferences(mockUser.id);

      expect(result).toEqual(preferences);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from database if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.getUserPreferences(mockUser.id);

      expect(result).toEqual(mockUser.preferences);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });
});