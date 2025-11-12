import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            name: string;
            push_token: string;
            preferences: {
                email: boolean;
                push: boolean;
            };
            created_at: Date;
            updated_at: Date;
        };
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: import("./entities/user.entity").User[];
        meta: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
        };
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    getPreferences(id: string): Promise<{
        success: boolean;
        message: string;
        data: {};
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            name: string;
            push_token: string;
            preferences: {
                email: boolean;
                push: boolean;
            };
            created_at: Date;
            updated_at: Date;
        };
    }>;
    validateUser(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            preferences: {
                email: boolean;
                push: boolean;
            };
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
