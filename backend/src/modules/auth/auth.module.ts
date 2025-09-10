import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTestController } from './auth-test.controller';
import { AuthTestService } from './auth-test.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtTestStrategy } from './strategies/jwt-test.strategy';
import { UsersModule } from '../users/users.module';
import { OtpModule } from '../../common/otp/otp.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    UsersModule,
    OtpModule,
  ],
  controllers: [AuthController, AuthTestController],
  providers: [AuthService, AuthTestService, JwtStrategy, JwtTestStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
