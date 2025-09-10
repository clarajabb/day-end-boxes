import { IsString, IsEmail, IsOptional, IsIn, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Ahmad Khalil',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'ahmad@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Preferred locale',
    example: 'ar',
    enum: ['ar', 'en'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ar', 'en'])
  preferredLocale?: string;

  @ApiProperty({
    description: 'Notification preferences',
    example: {
      pushEnabled: true,
      smsEnabled: true,
      emailEnabled: false,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  notificationPreferences?: {
    pushEnabled?: boolean;
    smsEnabled?: boolean;
    emailEnabled?: boolean;
  };
}
