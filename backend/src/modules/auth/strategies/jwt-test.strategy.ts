import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Test-friendly JWT strategy that doesn't require database lookup
 * This allows us to test protected endpoints without external dependencies
 */
@Injectable()
export class JwtTestStrategy extends PassportStrategy(Strategy, 'jwt-test') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'test-jwt-secret-for-authentication-testing-very-long-and-secure'),
    });
  }

  async validate(payload: any) {
    // In test mode, we trust the JWT payload and don't need database lookup
    // This is safe because we're only using this in test mode
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    // Return the payload as the user object
    // This will be available as the @GetUser() parameter in controllers
    return {
      id: payload.sub,
      sub: payload.sub, // Keep both for compatibility
      phone: payload.phone,
      iat: payload.iat,
      exp: payload.exp
    };
  }
}
