// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: 10000,
  ENDPOINTS: {
        AUTH: {
          HEALTH: '/auth/health',
          SEND_OTP: '/auth/send-otp',
          VERIFY_OTP: '/auth/verify-otp',
          REFRESH: '/auth/refresh',
          PROFILE: '/auth/profile',
          LOGOUT: '/auth/logout',
        },
        USERS: {
          PROFILE: '/users/profile',
          STATS: '/users/stats',
        },
        MERCHANTS: {
          ALL: '/merchants',
        },
    BOXES: {
      NEARBY: '/boxes/nearby',
      BY_ID: '/boxes',
    },
    RESERVATIONS: {
      ALL: '/reservations',
    },
    ADMIN: {
      STATS: '/admin/stats',
    },
  },
} as const

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Day-End Boxes',
  APP_DESCRIPTION: 'TooGoodToGo-style marketplace for end-of-day food boxes in Lebanon',
  SUPPORTED_LOCALES: ['ar', 'en'] as const,
  DEFAULT_LOCALE: 'ar' as const,
  PHONE_REGEX: /^(\+961)?[0-9]{8}$/,
  OTP_LENGTH: 6,
  TOKEN_STORAGE_KEY: 'access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  USER_STORAGE_KEY: 'user_data',
} as const

// UI Configuration
export const UI_CONFIG = {
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
  COLORS: {
    PRIMARY: '#059669', // emerald-600
    SECONDARY: '#0d9488', // teal-600
    ACCENT: '#dc2626', // red-600
    SUCCESS: '#16a34a', // green-600
    WARNING: '#d97706', // amber-600
    ERROR: '#dc2626', // red-600
    INFO: '#2563eb', // blue-600
  },
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    '2XL': '3rem',
  },
} as const

// Lebanese Areas for Location Services
export const LEBANESE_AREAS = [
  'Hamra',
  'Verdun',
  'Ashrafieh',
  'Gemmayze',
  'Mar Mikhael',
  'Jounieh',
  'Jal el Dib',
  'Metn',
  'Baabda',
  'Aley',
  'Chouf',
  'Saida',
  'Tyre',
  'Tripoli',
  'Zgharta',
  'Keserwan',
  'Byblos',
  'Batroun',
] as const

// Box Categories
export const BOX_CATEGORIES = [
  'Restaurant',
  'Bakery',
  'Dessert Shop',
  'Fast Food',
  'Cafe',
  'Grocery',
  'Butcher',
  'Vegetables',
  'Fruits',
] as const

// Cuisine Types
export const CUISINE_TYPES = [
  'Lebanese',
  'Mediterranean',
  'Arabic',
  'Italian',
  'French',
  'Asian',
  'Indian',
  'Mexican',
  'American',
  'Vegetarian',
  'Vegan',
  'Fast Food',
] as const

// Reservation Status
export const RESERVATION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  PUSH: 'push',
  SMS: 'sms',
  EMAIL: 'email',
} as const

export type Locale = typeof APP_CONFIG.SUPPORTED_LOCALES[number]
export type LebaneseArea = typeof LEBANESE_AREAS[number]
export type BoxCategory = typeof BOX_CATEGORIES[number]
export type CuisineType = typeof CUISINE_TYPES[number]
export type ReservationStatus = typeof RESERVATION_STATUS[keyof typeof RESERVATION_STATUS]
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]
