import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
declare const JwtTestStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtTestStrategy extends JwtTestStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: any): Promise<{
        id: any;
        sub: any;
        phone: any;
        iat: any;
        exp: any;
    }>;
}
export {};
