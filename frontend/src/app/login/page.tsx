'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { APP_CONFIG } from '@/lib/config'
import { formatLebanesePhone, isValidLebanesePhone } from '@/lib/utils'
import { Phone, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Validation schemas
const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((phone) => isValidLebanesePhone(phone), {
      message: 'Please enter a valid Lebanese phone number',
    }),
  locale: z.enum(['ar', 'en']),
})

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type OtpFormData = z.infer<typeof otpSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, sendOtp, isAuthenticated, isLoading } = useAuth()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [locale, setLocale] = useState<'ar' | 'en'>('ar')
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
      locale: 'ar',
    },
  })

  // OTP form
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  // Handle phone submission
  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true)
    try {
      const formattedPhone = formatLebanesePhone(data.phone)
      const success = await sendOtp(formattedPhone, data.locale)
      
      if (success) {
        setPhoneNumber(formattedPhone)
        setLocale(data.locale)
        setOtpSent(true)
        setStep('otp')
        setOtpTimer(60) // 60 seconds timer
        toast.success('OTP sent successfully!')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle OTP submission
  const handleOtpSubmit = async (data: OtpFormData) => {
    setIsSubmitting(true)
    try {
      const success = await login(phoneNumber, data.otp)
      
      if (success) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return
    
    setIsSubmitting(true)
    try {
      const success = await sendOtp(phoneNumber, locale)
      
      if (success) {
        setOtpTimer(60)
        toast.success('OTP resent successfully!')
      }
    } catch (error) {
      console.error('Error resending OTP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  // Go back to phone step
  const handleBackToPhone = () => {
    setStep('phone')
    setOtpSent(false)
    setOtpTimer(0)
    otpForm.reset()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-emerald-600 p-3 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 'phone' ? 'Sign in to your account' : 'Enter verification code'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'phone' 
            ? 'Enter your Lebanese phone number to receive an OTP'
            : `We sent a 6-digit code to ${phoneNumber}`
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...phoneForm.register('phone')}
                    type="tel"
                    placeholder="+961 71 123 456"
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  {...phoneForm.register('locale')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </button>
                <span className="text-sm text-gray-500">
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Can resend now'}
                </span>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  {...otpForm.register('otp')}
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-center text-2xl tracking-widest"
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Test Mode Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Test Mode</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>For testing purposes, use OTP: <strong>123456</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
