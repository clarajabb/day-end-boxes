export declare class UpdateProfileDto {
    name?: string;
    email?: string;
    preferredLocale?: string;
    notificationPreferences?: {
        pushEnabled?: boolean;
        smsEnabled?: boolean;
        emailEnabled?: boolean;
    };
}
