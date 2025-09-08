import 'package:flutter/material.dart';

class AppConfig {
  // API Configuration
  static const String baseUrl = 'https://api.dayendboxes.lb/v1';
  static const String stagingBaseUrl = 'https://staging-api.dayendboxes.lb/v1';
  
  // App Configuration
  static const String appName = 'Day-End Boxes';
  static const String appVersion = '1.0.0';
  
  // Supported locales
  static const List<Locale> supportedLocales = [
    Locale('ar'), // Arabic
    Locale('en'), // English
  ];
  
  // Default locale
  static const Locale defaultLocale = Locale('ar');
  
  // Reservation Configuration
  static const int reservationTtlMinutes = 20;
  static const int maxReservationsPerUser = 3;
  
  // Map Configuration
  static const double defaultMapZoom = 14.0;
  static const int maxSearchRadiusKm = 50;
  static const int defaultSearchRadiusKm = 10;
  
  // Lebanon coordinates (Beirut center)
  static const double defaultLatitude = 33.8938;
  static const double defaultLongitude = 35.5018;
  
  // UI Configuration
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  
  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // Network Configuration
  static const int connectTimeoutMs = 10000;
  static const int receiveTimeoutMs = 10000;
  static const int sendTimeoutMs = 10000;
  
  // Cache Configuration
  static const int imageCacheMaxAge = 7; // days
  static const int apiCacheMaxAge = 5; // minutes
  
  // Notification Configuration
  static const String fcmTopicAll = 'all_users';
  static const String fcmTopicReservations = 'reservations';
  
  // Phone number validation
  static const String lebanonCountryCode = '+961';
  static const String phoneNumberPattern = r'^(\+961)?[0-9]{8}$';
  
  // OTP Configuration
  static const int otpLength = 6;
  static const int otpExpiryMinutes = 5;
  static const int maxOtpAttempts = 3;
  
  // File upload limits
  static const int maxImageSizeMB = 5;
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  
  // Business hours format
  static const String timeFormat = 'HH:mm';
  static const String dateFormat = 'yyyy-MM-dd';
  static const String dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
  
  // Environment check
  static bool get isProduction => 
      const String.fromEnvironment('ENVIRONMENT') == 'production';
  
  static bool get isDevelopment => !isProduction;
  
  // Get appropriate base URL based on environment
  static String get apiBaseUrl => isProduction ? baseUrl : stagingBaseUrl;
  
  // Feature flags
  static const bool enableAnalytics = true;
  static const bool enableCrashlytics = true;
  static const bool enablePerformanceMonitoring = true;
  
  // Social media links
  static const String instagramUrl = 'https://instagram.com/dayendboxes.lb';
  static const String facebookUrl = 'https://facebook.com/dayendboxes.lb';
  static const String whatsappNumber = '+96171123456';
  
  // Legal links
  static const String privacyPolicyUrl = 'https://dayendboxes.lb/privacy';
  static const String termsOfServiceUrl = 'https://dayendboxes.lb/terms';
  static const String supportEmail = 'support@dayendboxes.lb';
  
  // Rating configuration
  static const int minRating = 1;
  static const int maxRating = 5;
  static const int minReviewLength = 10;
  static const int maxReviewLength = 500;
}
