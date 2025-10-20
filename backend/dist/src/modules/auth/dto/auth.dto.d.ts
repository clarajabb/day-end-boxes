export declare class RegisterDto {
    email: string;
    name: string;
    password: string;
    preferredLocale?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
