import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Cache } from 'cache-manager';
export declare class UsersService {
    private usersRepository;
    private cacheManager;
    constructor(usersRepository: Repository<User>, cacheManager: Cache);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, limit?: number): Promise<{
        data: User[];
        meta: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
        };
    }>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    getUserPreferences(userId: string): Promise<{}>;
    private cacheUserPreferences;
}
