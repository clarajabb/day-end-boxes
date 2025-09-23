import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, APP_CONFIG } from './config'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(APP_CONFIG.TOKEN_STORAGE_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem(APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY)
          
          if (refreshToken) {
            const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
              refreshToken,
            })

            const { accessToken } = response.data.data
            localStorage.setItem(APP_CONFIG.TOKEN_STORAGE_KEY, accessToken)
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(APP_CONFIG.TOKEN_STORAGE_KEY)
          localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY)
          localStorage.removeItem(APP_CONFIG.USER_STORAGE_KEY)
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: Array<{ field: string; message: string }>
}

// API service class
export class ApiService {
  // Auth endpoints
  static async healthCheck(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.HEALTH)
    return response.data
  }

  static async sendOtp(phone: string, locale: string): Promise<ApiResponse> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, {
      phone,
      locale,
    })
    return response.data
  }

  static async verifyOtp(phone: string, otp: string): Promise<ApiResponse> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
      phone,
      otp,
    })
    return response.data
  }

  static async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    })
    return response.data
  }

  static async getProfile(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE)
    return response.data
  }

  static async updateProfile(data: any): Promise<ApiResponse> {
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.AUTH.PROFILE, data)
    return response.data
  }

  static async logout(): Promise<ApiResponse> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
    return response.data
  }

  // Users endpoints
  static async getUserProfile(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.PROFILE)
    return response.data
  }

  static async getUserStats(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.STATS)
    return response.data
  }

  // Merchants endpoints
  static async getAllMerchants(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MERCHANTS.ALL)
    return response.data
  }

  // Boxes endpoints
  static async getNearbyBoxes(lat: number, lng: number, radius?: number): Promise<ApiResponse> {
    // For test mode, return mock boxes data instead of calling the API
    const mockBoxes = [
      {
        id: 'box_1',
        merchantId: 'merchant_1',
        merchantName: 'Café Central',
        boxType: 'Mixed Meal Box',
        originalPrice: 25000,
        discountedPrice: 12500,
        discountPercentage: 50,
        availableQuantity: 3,
        pickupTime: '18:00-19:00',
        description: 'Fresh Lebanese mezze with grilled meats and traditional sides',
        allergens: ['nuts', 'dairy'],
        isAvailable: true,
        createdAt: '2025-01-23T10:00:00.000Z'
      },
      {
        id: 'box_2',
        merchantId: 'merchant_2',
        merchantName: 'Fresh Bakery',
        boxType: 'Bakery Delights',
        originalPrice: 15000,
        discountedPrice: 7500,
        discountPercentage: 50,
        availableQuantity: 5,
        pickupTime: '17:30-18:30',
        description: 'Assorted pastries, bread, and Lebanese sweets',
        allergens: ['gluten', 'eggs'],
        isAvailable: true,
        createdAt: '2025-01-23T09:30:00.000Z'
      },
      {
        id: 'box_3',
        merchantId: 'merchant_3',
        merchantName: 'Lebanese Kitchen',
        boxType: 'Dinner Special',
        originalPrice: 30000,
        discountedPrice: 15000,
        discountPercentage: 50,
        availableQuantity: 2,
        pickupTime: '19:00-20:00',
        description: 'Traditional Lebanese dinner with grilled meats and rice',
        allergens: ['nuts'],
        isAvailable: true,
        createdAt: '2025-01-23T11:00:00.000Z'
      },
      {
        id: 'box_4',
        merchantId: 'merchant_4',
        merchantName: 'Green Garden',
        boxType: 'Healthy Bowl',
        originalPrice: 20000,
        discountedPrice: 10000,
        discountPercentage: 50,
        availableQuantity: 4,
        pickupTime: '18:30-19:30',
        description: 'Fresh vegetarian bowl with quinoa, vegetables, and tahini',
        allergens: ['sesame'],
        isAvailable: true,
        createdAt: '2025-01-23T08:45:00.000Z'
      },
      {
        id: 'box_5',
        merchantId: 'merchant_5',
        merchantName: 'Sweet Dreams',
        boxType: 'Dessert Box',
        originalPrice: 18000,
        discountedPrice: 9000,
        discountPercentage: 50,
        availableQuantity: 6,
        pickupTime: '20:00-21:00',
        description: 'Assorted desserts including cakes, pastries, and ice cream',
        allergens: ['dairy', 'eggs', 'nuts'],
        isAvailable: true,
        createdAt: '2025-01-23T12:15:00.000Z'
      },
      {
        id: 'box_6',
        merchantId: 'merchant_6',
        merchantName: 'Quick Bites',
        boxType: 'Burger Combo',
        originalPrice: 22000,
        discountedPrice: 11000,
        discountPercentage: 50,
        availableQuantity: 3,
        pickupTime: '19:30-20:30',
        description: 'Gourmet burger with fries and drink',
        allergens: ['gluten', 'dairy'],
        isAvailable: true,
        createdAt: '2025-01-23T13:20:00.000Z'
      }
    ]

    return {
      success: true,
      message: 'Mock boxes retrieved successfully',
      data: mockBoxes
    }
  }

  static async getBoxById(id: string): Promise<ApiResponse> {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BOXES.BY_ID}/${id}`)
    return response.data
  }

  // Reservations endpoints
  static async getUserReservations(): Promise<ApiResponse> {
    // For test mode, use a known test user ID
    const testUserId = 'user_test_1'
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USERS.PROFILE.replace('/profile', '')}/${testUserId}/reservations`)
    return response.data
  }

  // Admin endpoints
  static async getDashboardStats(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.STATS)
    return response.data
  }
}

export default apiClient
