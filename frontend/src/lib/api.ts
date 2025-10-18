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
      // Only add auth token to protected endpoints
      const protectedEndpoints = ['/auth/', '/users/', '/reservations/', '/admin/']
      const isProtectedEndpoint = protectedEndpoints.some(endpoint => config.url?.includes(endpoint))
      
      if (isProtectedEndpoint) {
        const token = localStorage.getItem(APP_CONFIG.TOKEN_STORAGE_KEY)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
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
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.BOXES.NEARBY, {
      params: { lat, lng, radius }
    })
    return response.data
  }

  static async getBoxById(id: string): Promise<ApiResponse> {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BOXES.BY_ID}/${id}`)
    return response.data
  }

  // Reservations endpoints
  static async getUserReservations(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.RESERVATIONS.ALL)
    return response.data
  }

  static async createReservation(boxInventoryId: string, quantity: number = 1): Promise<ApiResponse> {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.RESERVATIONS.ALL, {
      boxInventoryId,
      quantity
    })
    return response.data
  }

  static async cancelReservation(reservationId: string): Promise<ApiResponse> {
    const response = await apiClient.patch(`${API_CONFIG.ENDPOINTS.RESERVATIONS.ALL}/${reservationId}/cancel`)
    return response.data
  }

  // Admin endpoints
  static async getDashboardStats(): Promise<ApiResponse> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.STATS)
    return response.data
  }
}

export default apiClient
