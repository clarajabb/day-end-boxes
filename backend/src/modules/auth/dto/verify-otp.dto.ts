import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Lebanese phone number',
    example: '+96171123456',
    pattern: '^(\\+961)?[0-9]{8}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+961)?[0-9]{8}$/, {
    message: 'Phone number must be a valid Lebanese number',
  })
  phone: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must contain only numbers' })
  otp: string;
}
