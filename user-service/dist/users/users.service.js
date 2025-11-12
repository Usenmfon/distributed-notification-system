"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
const cache_manager_1 = require("@nestjs/cache-manager");
let UsersService = class UsersService {
    usersRepository;
    cacheManager;
    constructor(usersRepository, cacheManager) {
        this.usersRepository = usersRepository;
        this.cacheManager = cacheManager;
    }
    async create(createUserDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
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
    async findAll(page = 1, limit = 10) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        const updatedUser = await this.usersRepository.save(user);
        if (updateUserDto.preferences) {
            await this.cacheUserPreferences(id, updatedUser.preferences);
        }
        return updatedUser;
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
        await this.cacheManager.del(`user:${id}:preferences`);
    }
    async getUserPreferences(userId) {
        const cached = await this.cacheManager.get(`user:${userId}:preferences`);
        if (cached)
            return cached;
        const user = await this.findOne(userId);
        await this.cacheUserPreferences(userId, user.preferences);
        return user.preferences;
    }
    async cacheUserPreferences(userId, preferences) {
        await this.cacheManager.set(`user:${userId}:preferences`, preferences, 300000);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map