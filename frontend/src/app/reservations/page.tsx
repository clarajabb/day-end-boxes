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
  Share2,
  Phone,
  Mail,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Reservation {
  id: string
  userId: string
  boxInventoryId: string
  merchantId: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
  pickupCode: string
  totalAmount: number
  reservedAt: string
  expiresAt: string
  completedAt?: string
  cancelledAt?: string
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  paymentMethod?: string
  createdAt: string
  updatedAt: string
  boxInventory: {
    id: string
    availableDate: string
    pickupStartTime: string
    pickupEndTime: string
    price: number
    boxType: {
      id: string
      name: string
      description: string
      originalPrice: number
      merchant: {
        id: string
        businessName: string
        address: string
        phone: string
        email: string
      }
    }
  }
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Load reservations and user stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Only load data if user is authenticated
        if (user) {
          // Load reservations
          const reservationsResponse = await ApiService.getUserReservations()
          if (reservationsResponse.success) {
            setReservations(reservationsResponse.data || [])
          } else {
            toast.error('Failed to load reservations')
          }

          // Load user stats
          const statsResponse = await ApiService.getUserStats()
          if (statsResponse.success) {
            setUserStats(statsResponse.data)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  // Listen for user stats updates from other pages
  useEffect(() => {
    const handleUserStatsUpdate = (event: CustomEvent) => {
      setUserStats(event.detail)
    }

    window.addEventListener('userStatsUpdated', handleUserStatsUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userStatsUpdated', handleUserStatsUpdate as EventListener)
    }
  }, [])

  // Filter reservations based on status
  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true
    return reservation.status.toLowerCase() === filter
  })

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
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
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
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
          title: `My reservation at ${reservation.boxInventory.boxType.merchant.businessName}`,
          text: `I have a reservation for ${reservation.boxInventory.boxType.name} at ${reservation.boxInventory.boxType.merchant.businessName}`,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        const text = `My reservation at ${reservation.boxInventory.boxType.merchant.businessName}: ${reservation.boxInventory.boxType.name} - ${formatCurrency(reservation.totalAmount)}`
        await navigator.clipboard.writeText(text)
        toast.success('Reservation details copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to share reservation')
    }
  }

  // Handle viewing reservation details
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsDetailModalOpen(true)
  }

  // Handle cancelling reservation
  const handleCancelReservation = async () => {
    if (!selectedReservation) return

    try {
      setIsCancelling(true)
      const response = await ApiService.cancelReservation(selectedReservation.id)
      
      if (response.success) {
        toast.success('Reservation cancelled successfully!')
        
        // Refresh reservations
        const reservationsResponse = await ApiService.getUserReservations()
        if (reservationsResponse.success) {
          setReservations(reservationsResponse.data || [])
        }
        
        // Refresh user stats to update header
        try {
          const statsResponse = await ApiService.getUserStats()
          if (statsResponse.success) {
            // Trigger a custom event to update header stats
            window.dispatchEvent(new CustomEvent('userStatsUpdated', { 
              detail: statsResponse.data 
            }))
          }
        } catch (error) {
          console.error('Error refreshing user stats:', error)
        }
        
        // Close modal
        setIsDetailModalOpen(false)
        setSelectedReservation(null)
      } else {
        toast.error('Failed to cancel reservation. Please try again.')
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      toast.error('Failed to cancel reservation. Please try again.')
    } finally {
      setIsCancelling(false)
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
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.completed}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.cancelled || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All', count: reservations.length },
                { key: 'active', label: 'Active', count: reservations.filter(r => r.status.toLowerCase() === 'active').length },
                { key: 'completed', label: 'Completed', count: reservations.filter(r => r.status.toLowerCase() === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: reservations.filter(r => r.status.toLowerCase() === 'cancelled').length },
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
                            {reservation.boxInventory.boxType.name}
                          </h3>
                          <p className="text-sm text-gray-600">{reservation.boxInventory.boxType.merchant.businessName}</p>
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
                          <span>Pickup: {reservation.boxInventory.pickupStartTime.slice(0, 5)}-{reservation.boxInventory.pickupEndTime.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{reservation.boxInventory.boxType.merchant.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-emerald-600">
                          {formatCurrency(reservation.totalAmount)}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(reservation)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                          {reservation.status.toLowerCase() === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedReservation(reservation)
                                setIsDetailModalOpen(true)
                              }}
                              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
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

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setSelectedReservation(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Box Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedReservation.boxInventory.boxType.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedReservation.boxInventory.boxType.merchant.businessName}</p>
                <p className="text-sm text-gray-600 mb-3">{selectedReservation.boxInventory.boxType.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(selectedReservation.totalAmount)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(selectedReservation.boxInventory.boxType.originalPrice)}
                    </span>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                    {Math.round(((selectedReservation.boxInventory.boxType.originalPrice - selectedReservation.totalAmount) / selectedReservation.boxInventory.boxType.originalPrice) * 100)}% off
                  </span>
                </div>
              </div>

              {/* Pickup Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Pickup Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Restaurant Address</p>
                      <p className="text-sm text-gray-600">{selectedReservation.boxInventory.boxType.merchant.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Available Date</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedReservation.boxInventory.availableDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pickup Time</p>
                      <p className="text-sm text-gray-600">{selectedReservation.boxInventory.pickupStartTime.slice(0, 5)}-{selectedReservation.boxInventory.pickupEndTime.slice(0, 5)}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Restaurant Phone</p>
                      <p className="text-sm text-gray-600">{selectedReservation.boxInventory.boxType.merchant.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Restaurant Email</p>
                      <p className="text-sm text-gray-600">{selectedReservation.boxInventory.boxType.merchant.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Reservation Details</p>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
                      <li>• Pickup Code: {selectedReservation.pickupCode}</li>
                      <li>• Reservation ID: {selectedReservation.id.slice(-8)}</li>
                      <li>• Status: {selectedReservation.status}</li>
                      <li>• Payment: {selectedReservation.paymentStatus} ({selectedReservation.paymentMethod || 'Cash'})</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false)
                  setSelectedReservation(null)
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedReservation.status.toLowerCase() === 'active' && (
                <button
                  onClick={handleCancelReservation}
                  disabled={isCancelling}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCancelling
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
