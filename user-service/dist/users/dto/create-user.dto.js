"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class UserPreferenceDto {
    email;
    push;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable email notifications',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserPreferenceDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Enable push notifications',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserPreferenceDto.prototype, "push", void 0);
class CreateUserDto {
    name;
    email;
    push_token;
    preferences;
    password;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User full name',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User email address',
        example: 'john@example.com',
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Firebase Cloud Messaging token for push notifications',
        example: 'fcm-token-12345',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "push_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User notification preferences',
        type: UserPreferenceDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserPreferenceDto),
    __metadata("design:type", UserPreferenceDto)
], CreateUserDto.prototype, "preferences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password (minimum 8 characters)',
        example: 'securePassword123',
        minLength: 8,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
//# sourceMappingURL=create-user.dto.js.map