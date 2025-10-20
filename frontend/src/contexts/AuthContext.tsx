'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ApiService } from '@/lib/api'
import { APP_CONFIG } from '@/lib/config'
import toast from 'react-hot-toast'

// Types
interface User {
  id: string
  phone: string
  name?: string
  email?: string
  preferredLocale: string
  notificationPreferences: {
    pushEnabled: boolean
    smsEnabled: boolean
    emailEnabled: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phone: string, otp: string) => Promise<boolean>
  logout: () => Promise<void>
  sendOtp: (phone: string, locale: string) => Promise<boolean>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  refreshUser: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start with false

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for token in cookies (for SSR compatibility) or localStorage
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1] || localStorage.getItem(APP_CONFIG.TOKEN_STORAGE_KEY)
        
        const userData = localStorage.getItem(APP_CONFIG.USER_STORAGE_KEY)

        if (token && userData) {
          setUser(JSON.parse(userData))
          // Don't refresh user during initialization to avoid clearing tokens
          // The token will be validated on the first API call
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid data
        localStorage.removeItem(APP_CONFIG.TOKEN_STORAGE_KEY)
        localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY)
        localStorage.removeItem(APP_CONFIG.USER_STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth()
    } else {
      setIsLoading(false)
    }
  }, [])

  // Send OTP
  const sendOtp = async (phone: string, locale: string): Promise<boolean> => {
    try {
      const response = await ApiService.sendOtp(phone, locale)
      if (response.success) {
        toast.success('OTP sent successfully!')
        return true
      } else {
        toast.error(response.message || 'Failed to send OTP')
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      return false
    }
  }

  // Login with OTP
  const login = async (phone: string, otp: string): Promise<boolean> => {
    try {
      const response = await ApiService.verifyOtp(phone, otp)
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data
        
        // Store tokens and user data
        localStorage.setItem(APP_CONFIG.TOKEN_STORAGE_KEY, accessToken)
        localStorage.setItem(APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY, refreshToken)
        localStorage.setItem(APP_CONFIG.USER_STORAGE_KEY, JSON.stringify(userData))
        
        // Also set cookies for middleware compatibility
        document.cookie = `access_token=${accessToken}; path=/; max-age=900` // 15 minutes
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000` // 30 days
        
        setUser(userData)
        toast.success('Login successful!')
        return true
      } else {
        toast.error(response.message || 'Invalid OTP')
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return false
    }
  }

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await ApiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all stored data
      localStorage.removeItem(APP_CONFIG.TOKEN_STORAGE_KEY)
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY)
      localStorage.removeItem(APP_CONFIG.USER_STORAGE_KEY)
      
      // Clear cookies
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  // Update user profile
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await ApiService.updateProfile(data)
      
      if (response.success && response.data) {
        const updatedUser = response.data
        setUser(updatedUser)
        localStorage.setItem(APP_CONFIG.USER_STORAGE_KEY, JSON.stringify(updatedUser))
        toast.success('Profile updated successfully!')
        return true
      } else {
        toast.error(response.message || 'Failed to update profile')
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
      return false
    }
  }

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await ApiService.getProfile()
      
      if (response.success && response.data) {
        setUser(response.data)
        localStorage.setItem(APP_CONFIG.USER_STORAGE_KEY, JSON.stringify(response.data))
      } else {
        console.warn('Failed to fetch user profile, but keeping user logged in')
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // Don't logout user on refresh failure - just log the error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    sendOtp,
    updateProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
