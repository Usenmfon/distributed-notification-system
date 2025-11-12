declare class UserPreferenceDto {
    email: boolean;
    push: boolean;
}
export declare class CreateUserDto {
    name: string;
    email: string;
    push_token?: string;
    preferences: UserPreferenceDto;
    password: string;
}
export {};
