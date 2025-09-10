import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Test-friendly JWT Auth Guard that uses the jwt-test strategy
 * This doesn't require database lookup for user validation
 */
@Injectable()
export class JwtTestAuthGuard extends AuthGuard('jwt-test') {}
