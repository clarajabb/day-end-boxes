'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiService } from '@/lib/api'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Star, 
  QrCode,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Reservation {
  id: string
  userId: string
  boxId: string
  merchantName: string
  boxType: string
  quantity: number
  totalPrice: number
  status: 'active' | 'completed' | 'cancelled' | 'expired'
  pickupTime: string
  qrCode: string
  createdAt: string
  updatedAt: string
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  // Load reservations
  useEffect(() => {
    const loadReservations = async () => {
      try {
        setIsLoading(true)
        const response = await ApiService.getUserReservations()
        
        if (response.success) {
          setReservations(response.data || [])
        } else {
          toast.error('Failed to load reservations')
        }
      } catch (error) {
        console.error('Error loading reservations:', error)
        toast.error('Failed to load reservations')
      } finally {
        setIsLoading(false)
      }
    }

    loadReservations()
  }, [])

  // Filter reservations based on status
  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true
    return reservation.status === filter
  })

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Active'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Completed'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Cancelled'
        }
      case 'expired':
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Expired'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Unknown'
        }
    }
  }

  // Handle QR code download
  const handleDownloadQR = (qrCode: string, reservationId: string) => {
    try {
      const link = document.createElement('a')
      link.href = qrCode
      link.download = `reservation-${reservationId}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('QR code downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download QR code')
    }
  }

  // Handle sharing reservation
  const handleShareReservation = async (reservation: Reservation) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My reservation at ${reservation.merchantName}`,
          text: `I have a reservation for ${reservation.boxType} at ${reservation.merchantName}`,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        const text = `My reservation at ${reservation.merchantName}: ${reservation.boxType} - ${formatCurrency(reservation.totalPrice)}`
        await navigator.clipboard.writeText(text)
        toast.success('Reservation details copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to share reservation')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
        </div>
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => r.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All', count: reservations.length },
                { key: 'active', label: 'Active', count: reservations.filter(r => r.status === 'active').length },
                { key: 'completed', label: 'Completed', count: reservations.filter(r => r.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: reservations.filter(r => r.status === 'cancelled').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    filter === tab.key
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-6">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You haven't made any reservations yet."
                  : `No ${filter} reservations found.`
                }
              </p>
            </div>
          ) : (
            filteredReservations.map((reservation) => {
              const statusInfo = getStatusInfo(reservation.status)
              const StatusIcon = statusInfo.icon

              return (
                <div key={reservation.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.boxType}
                          </h3>
                          <p className="text-sm text-gray-600">{reservation.merchantName}</p>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusInfo.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Created: {formatDate(reservation.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Pickup: {reservation.pickupTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          <span>Quantity: {reservation.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-emerald-600">
                          {formatCurrency(reservation.totalPrice)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Reservation ID: {reservation.id.slice(-8)}
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    {reservation.status === 'active' && reservation.qrCode && (
                      <div className="ml-6 flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-lg mb-2">
                          <img
                            src={reservation.qrCode}
                            alt="QR Code"
                            className="h-24 w-24"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadQR(reservation.qrCode, reservation.id)}
                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                          <button
                            onClick={() => handleShareReservation(reservation)}
                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {reservation.status === 'active' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-end space-x-4">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                          View Details
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                          Cancel Reservation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
