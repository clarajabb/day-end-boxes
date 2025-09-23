'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { APP_CONFIG } from '@/lib/config'
import { formatCurrency, formatDate } from '@/lib/utils'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Globe, 
  Save,
  Edit3,
  ShoppingBag,
  Clock,
  Star,
  Heart,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

// Validation schema
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  preferredLocale: z.enum(['ar', 'en']),
  notificationPreferences: z.object({
    pushEnabled: z.boolean(),
    smsEnabled: z.boolean(),
    emailEnabled: z.boolean(),
  }),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      preferredLocale: user?.preferredLocale || 'ar',
      notificationPreferences: {
        pushEnabled: user?.notificationPreferences?.pushEnabled || true,
        smsEnabled: user?.notificationPreferences?.smsEnabled || true,
        emailEnabled: user?.notificationPreferences?.emailEnabled || false,
      },
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        preferredLocale: user.preferredLocale || 'ar',
        notificationPreferences: {
          pushEnabled: user.notificationPreferences?.pushEnabled || true,
          smsEnabled: user.notificationPreferences?.smsEnabled || true,
          emailEnabled: user.notificationPreferences?.emailEnabled || false,
        },
      })
    }
  }, [user, form])

  const handleSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      const success = await updateProfile(data)
      if (success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <p className="text-gray-600 mt-2">Please log in again.</p>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {user.name || 'User'}
                </h2>
                <p className="text-gray-600">{user.phone}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-emerald-600 mr-2" />
                    <span className="text-sm text-gray-600">Total Reservations</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Favorite Merchant</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Al Falamanki</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Total Saved</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">LBP 45,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              </div>
              
              <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        {...form.register('name')}
                        type="text"
                        disabled={!isEditing}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    {form.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        {...form.register('email')}
                        type="email"
                        disabled={!isEditing}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Number (Read-only) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={user.phone}
                      disabled
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Phone number cannot be changed
                  </p>
                </div>

                {/* Language Preference */}
                <div>
                  <label htmlFor="preferredLocale" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      {...form.register('preferredLocale')}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Notification Preferences
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                      </div>
                      <input
                        {...form.register('notificationPreferences.pushEnabled')}
                        type="checkbox"
                        disabled={!isEditing}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive SMS messages</p>
                        </div>
                      </div>
                      <input
                        {...form.register('notificationPreferences.smsEnabled')}
                        type="checkbox"
                        disabled={!isEditing}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive email updates</p>
                        </div>
                      </div>
                      <input
                        {...form.register('notificationPreferences.emailEnabled')}
                        type="checkbox"
                        disabled={!isEditing}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Logout</h4>
                    <p className="text-sm text-gray-500">Sign out of your account</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
