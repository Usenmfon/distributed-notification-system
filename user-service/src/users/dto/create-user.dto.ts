import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class UserPreferenceDto {
  @ApiProperty({
    description: 'Enable email notifications',
    example: true,
  })
  @IsBoolean()
  email: boolean;

 @ApiProperty({
    description: 'Enable push notifications',
    example: true,
  })
  @IsBoolean()
  push: boolean;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  
  @ApiProperty({
    description: 'Firebase Cloud Messaging token for push notifications',
    example: 'fcm-token-12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  push_token?: string;

   @ApiProperty({
    description: 'User notification preferences',
    type: UserPreferenceDto,
  })
  @ValidateNested()
  @Type(() => UserPreferenceDto)
  preferences: UserPreferenceDto;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
