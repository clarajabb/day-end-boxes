import { IsString, IsIn, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Lebanese phone number',
    example: '+96171123456',
    pattern: '^(\\+961)?[0-9]{8}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+961)?[0-9]{8}$/, {
    message: 'Phone number must be a valid Lebanese number (+96171123456 or 71123456)',
  })
  phone: string;

  @ApiProperty({
    description: 'Preferred locale for OTP message',
    example: 'ar',
    enum: ['ar', 'en'],
  })
  @IsString()
  @IsIn(['ar', 'en'])
  locale: string;
}
