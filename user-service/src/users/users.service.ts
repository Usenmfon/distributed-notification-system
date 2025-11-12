import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    await this.cacheUserPreferences(savedUser.id, savedUser.preferences);

    return savedUser;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      select: [
        'id',
        'email',
        'name',
        'push_token',
        'preferences',
        'created_at',
      ],
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_previous: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'push_token',
        'preferences',
        'created_at',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    if (updateUserDto.preferences) {
      await this.cacheUserPreferences(id, updatedUser.preferences);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    await this.cacheManager.del(`user:${id}:preferences`);
  }

  async getUserPreferences(userId: string) {
    const cached = await this.cacheManager.get(`user:${userId}:preferences`);
    if (cached) return cached;

    const user = await this.findOne(userId);
    await this.cacheUserPreferences(userId, user.preferences);
    return user.preferences;
  }

  private async cacheUserPreferences(userId: string, preferences: any) {
    await this.cacheManager.set(
      `user:${userId}:preferences`,
      preferences,
      300000,
    );
  }
}
