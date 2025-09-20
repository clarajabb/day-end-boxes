/// Environment configuration for Day-End Boxes app
class Environment {
  Environment._();

  /// API base URL - points to the NestJS backend
  static const String apiBaseUrl = 'http://localhost:3000/api/v1';
  
  /// API timeout duration
  static const Duration apiTimeout = Duration(seconds: 30);
  
  /// App version
  static const String appVersion = '1.0.0';
  
  /// Build number
  static const String buildNumber = '1';
  
  /// Environment (development, staging, production)
  static const String environment = 'development';
  
  /// Google Maps API key (for production, this should be in environment variables)
  static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  
  /// Firebase project configuration
  static const String firebaseProjectId = 'day-end-boxes';
  
  /// Default locale
  static const String defaultLocale = 'en';
  
  /// Supported locales
  static const List<String> supportedLocales = ['en', 'ar'];
  
  /// Default currency
  static const String defaultCurrency = 'LBP';
  
  /// Supported currencies
  static const List<String> supportedCurrencies = ['LBP', 'USD'];
  
  /// Default location (Beirut, Lebanon)
  static const double defaultLatitude = 33.8938;
  static const double defaultLongitude = 35.5018;
  
  /// Default search radius in kilometers
  static const double defaultSearchRadius = 10.0;
  
  /// Maximum search radius in kilometers
  static const double maxSearchRadius = 50.0;
  
  /// Minimum search radius in kilometers
  static const double minSearchRadius = 1.0;
  
  /// OTP expiry time in minutes
  static const int otpExpiryMinutes = 5;
  
  /// JWT token refresh threshold in minutes
  static const int tokenRefreshThresholdMinutes = 5;
  
  /// Cache TTL for list endpoints in minutes
  static const int cacheTtlMinutes = 5;
  
  /// Maximum retry attempts for API calls
  static const int maxRetryAttempts = 3;
  
  /// Retry delay in milliseconds
  static const int retryDelayMs = 1000;
  
  /// Image cache duration in days
  static const int imageCacheDays = 7;
  
  /// Maximum image size in MB
  static const double maxImageSizeMB = 5.0;
  
  /// Supported image formats
  static const List<String> supportedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  
  /// Payment methods
  static const List<String> paymentMethods = [
    'apple_pay',
    'google_pay',
    'card',
    'cash_on_pickup',
  ];
  
  /// Default pickup window duration in minutes
  static const int defaultPickupWindowMinutes = 30;
  
  /// Reservation hold time in minutes
  static const int reservationHoldMinutes = 10;
  
  /// Maximum quantity per reservation
  static const int maxQuantityPerReservation = 5;
  
  /// Minimum quantity per reservation
  static const int minQuantityPerReservation = 1;
  
  /// Rating scale (1-5 stars)
  static const int ratingScale = 5;
  
  /// Minimum rating for display
  static const double minRatingDisplay = 1.0;
  
  /// Maximum rating for display
  static const double maxRatingDisplay = 5.0;
  
  /// Default pagination limit
  static const int defaultPaginationLimit = 20;
  
  /// Maximum pagination limit
  static const int maxPaginationLimit = 100;
  
  /// Search debounce delay in milliseconds
  static const int searchDebounceMs = 250;
  
  /// Animation duration in milliseconds
  static const int animationDurationMs = 200;
  
  /// Skeleton animation duration in milliseconds
  static const int skeletonAnimationDurationMs = 1500;
  
  /// Toast duration in milliseconds
  static const int toastDurationMs = 3000;
  
  /// Snackbar duration in milliseconds
  static const int snackbarDurationMs = 4000;
  
  /// Loading indicator delay in milliseconds
  static const int loadingIndicatorDelayMs = 500;
  
  /// Pull to refresh threshold in pixels
  static const double pullToRefreshThreshold = 80.0;
  
  /// Infinite scroll threshold in pixels
  static const double infiniteScrollThreshold = 200.0;
  
  /// Map zoom levels
  static const double mapDefaultZoom = 15.0;
  static const double mapMinZoom = 10.0;
  static const double mapMaxZoom = 20.0;
  
  /// Map cluster size
  static const int mapClusterSize = 50;
  
  /// Map cluster radius
  static const double mapClusterRadius = 100.0;
  
  /// Location accuracy threshold in meters
  static const double locationAccuracyThreshold = 100.0;
  
  /// Location timeout in seconds
  static const int locationTimeoutSeconds = 30;
  
  /// Location update interval in seconds
  static const int locationUpdateIntervalSeconds = 10;
  
  /// Analytics enabled
  static const bool analyticsEnabled = true;
  
  /// Crash reporting enabled
  static const bool crashReportingEnabled = true;
  
  /// Debug mode
  static const bool debugMode = true;
  
  /// Logging enabled
  static const bool loggingEnabled = true;
  
  /// Performance monitoring enabled
  static const bool performanceMonitoringEnabled = true;
  
  /// Feature flags
  static const Map<String, bool> featureFlags = {
    'favorites': true,
    'recently_viewed': true,
    'smart_recommendations': false,
    'social_sharing': true,
    'push_notifications': true,
    'offline_mode': false,
    'dark_mode': false,
    'biometric_auth': false,
  };
}

