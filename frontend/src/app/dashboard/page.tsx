'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ApiService } from '@/lib/api'
import { formatCurrency, formatDate, calculateDistance } from '@/lib/utils'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  ShoppingBag, 
  Search,
  XCircle,
  Calendar,
  Phone,
  Info,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Box {
  id: string
  merchantId: string
  merchantName: string
  boxType: string
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  availableQuantity: number
  pickupTime: string
  description: string
  allergens: string[]
  isAvailable: boolean
  createdAt: string
  availableDate: string
  merchantAddress: string
  merchantCategory: string
  merchantImage?: string
}

interface Merchant {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  category: string
  address: string
  latitude: number
  longitude: number
  description: string
  businessLicense: string
  profileImage: string
  operatingHours: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedBox, setSelectedBox] = useState<Box | null>(null)
  const [showReservationModal, setShowReservationModal] = useState(false)


  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load merchants (public endpoint)
        const merchantsResponse = await ApiService.getAllMerchants()
        if (merchantsResponse.success) {
          setMerchants(merchantsResponse.data || [])
        }

        // Load user stats only if user is authenticated
        if (user) {
          const statsResponse = await ApiService.getUserStats()
          if (statsResponse.success) {
            setUserStats(statsResponse.data)
          }
        }

        // Load boxes with default Beirut location
        const defaultLocation = { lat: 33.8938, lng: 35.5018 } // Beirut coordinates
        setUserLocation(defaultLocation)
        
        try {
          const boxesResponse = await ApiService.getNearbyBoxes(defaultLocation.lat, defaultLocation.lng, 10)
          if (boxesResponse.success) {
            // Merge merchant data with boxes
            const boxesWithMerchantData = (boxesResponse.data || []).map((box: any) => {
              const merchant = merchants.find(m => m.id === box.merchantId)
              return {
                ...box,
                merchantImage: merchant?.profileImage
              }
            })
            setBoxes(boxesWithMerchantData)
          }
        } catch (error) {
          console.error('Error loading boxes:', error)
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


  // Filter boxes based on search criteria
  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = box.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.boxType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const merchant = merchants.find(m => m.id === box.merchantId)
    const matchesArea = !selectedArea || merchant?.address.toLowerCase().includes(selectedArea.toLowerCase())
    const matchesCuisine = !selectedCuisine || merchant?.category.toLowerCase() === selectedCuisine.toLowerCase()
    
    return matchesSearch && matchesArea && matchesCuisine
  })

  // Get unique areas and cuisines for filters
  const areas = [...new Set(merchants.map(m => m.address.split(',')[0]).filter(Boolean))].sort()
  const cuisines = [...new Set(merchants.map(m => m.category).filter(Boolean))].sort()

  const handleReserveBox = (box: Box) => {
    setSelectedBox(box)
    setShowReservationModal(true)
  }

  const confirmReservation = async () => {
    if (!selectedBox) return

    try {
      const response = await ApiService.createReservation(selectedBox.id, 1)
      
      if (response.success) {
        toast.success(`Reservation created for ${selectedBox.boxType} at ${selectedBox.merchantName}!`)
        
        // Update user stats
        if (userStats) {
          setUserStats({
            ...userStats,
            total: userStats.total + 1,
            active: userStats.active + 1
          })
        }
        
        // Refresh boxes to update availability
        const boxesResponse = await ApiService.getNearbyBoxes(userLocation?.lat || 33.8938, userLocation?.lng || 35.5018, 10)
        if (boxesResponse.success) {
          // Merge merchant data with boxes
          const boxesWithMerchantData = (boxesResponse.data || []).map((box: any) => {
            const merchant = merchants.find(m => m.id === box.merchantId)
            return {
              ...box,
              merchantImage: merchant?.profileImage
            }
          })
          setBoxes(boxesWithMerchantData)
        }
        
        // Dispatch event to update header
        window.dispatchEvent(new CustomEvent('reservationUpdated'))
        
        // Close modal
        setShowReservationModal(false)
        setSelectedBox(null)
      } else {
        toast.error(response.message || 'Failed to create reservation')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Failed to create reservation. Please try again.')
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-gray-600">
            Discover amazing food boxes near you and save money while reducing waste.
          </p>
          {!userLocation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Enable location services for personalized results and distance calculations.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <Star className="h-8 w-8 text-yellow-600" />
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
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(userStats.totalSaved)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search boxes, merchants, or cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Areas</option>
                {areas.map((area, index) => (
                  <option key={`area-${area}-${index}`} value={area}>{area}</option>
                ))}
              </select>
              
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Cuisines</option>
                {cuisines.map((cuisine, index) => (
                  <option key={`cuisine-${cuisine}-${index}`} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Restaurants Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Restaurants Near You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchants.map((merchant) => {
              const merchantBoxes = boxes.filter(box => box.merchantId === merchant.id)
              const distance = userLocation ? 
                calculateDistance(userLocation.lat, userLocation.lng, merchant.latitude, merchant.longitude) : null
              
              
              return (
                <div key={merchant.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={merchant.profileImage} 
                      alt={merchant.businessName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                      {distance ? `${distance.toFixed(1)} km` : 'Nearby'}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{merchant.businessName}</h3>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm font-medium">4.5</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{merchant.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">{merchant.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
                        {merchant.category.toLowerCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {merchantBoxes.length} boxes available
                      </span>
                    </div>
                    
                    <div className="space-y-2 flex-grow">
                      {merchantBoxes.slice(0, 2).map((box) => (
                        <div key={box.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{box.boxType}</p>
                            <p className="text-xs text-gray-600 truncate">{box.description}</p>
                          </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-green-600">{formatCurrency(box.discountedPrice)}</p>
                      <p className="text-xs text-gray-500 line-through">{formatCurrency(box.originalPrice)}</p>
                    </div>
                        </div>
                      ))}
                      {merchantBoxes.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{merchantBoxes.length - 2} more boxes
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/restaurant/${merchant.id}`)}
                      className="w-full mt-3 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      View All Boxes
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Boxes Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Boxes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoxes.map((box) => {
            const merchant = merchants.find(m => m.id === box.merchantId)
            const distance = userLocation && merchant ? 
              calculateDistance(userLocation.lat, userLocation.lng, merchant.latitude, merchant.longitude) : null
            
            return (
              <div key={box.id} id={`box-${box.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Restaurant Image */}
                {box.merchantImage && (
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={box.merchantImage}
                      alt={`${box.merchantName} restaurant`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{box.boxType}</h3>
                      <p className="text-sm text-gray-600">{box.merchantName}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-500">
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{box.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{merchant?.address.split(',')[0]}</span>
                    {distance && (
                      <span className="ml-2">• {distance.toFixed(1)} km away</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Pickup: {box.pickupTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">4.5</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {box.availableQuantity} left
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(box.discountedPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(box.originalPrice)}
                      </span>
                    </div>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {box.discountPercentage}% OFF
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleReserveBox(box)}
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            )
          })}
          </div>
        </div>

        {filteredBoxes.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No boxes found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
          </div>
        )}
      </div>

      {/* Reservation Details Modal */}
      {selectedBox && showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Reserve Box</h2>
              <button
                onClick={() => {
                  setShowReservationModal(false)
                  setSelectedBox(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Restaurant Image */}
              {selectedBox.merchantImage && (
                <div className="h-32 w-full overflow-hidden rounded-lg">
                  <img
                    src={selectedBox.merchantImage}
                    alt={`${selectedBox.merchantName} restaurant`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Box Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{selectedBox.boxType}</h3>
                <p className="text-gray-600 mb-4">{selectedBox.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(selectedBox.discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(selectedBox.originalPrice)}
                    </span>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {selectedBox.discountPercentage}% OFF
                  </span>
                </div>

                {selectedBox.allergens.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Allergens:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedBox.allergens.map((allergen, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Pickup Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedBox.merchantName}</p>
                      <p className="text-sm text-gray-600">{selectedBox.merchantAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pickup Time</p>
                      <p className="text-sm text-gray-600">{selectedBox.pickupTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Available Date</p>
                      <p className="text-sm text-gray-600">{formatDate(selectedBox.availableDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Available Quantity</p>
                      <p className="text-sm text-gray-600">{selectedBox.availableQuantity} boxes left</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Reservation expires in 24 hours</li>
                  <li>• Payment is made at pickup (cash only)</li>
                  <li>• Bring your pickup code to the restaurant</li>
                  <li>• Contact the restaurant if you need to cancel</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowReservationModal(false)
                  setSelectedBox(null)
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReservation}
                className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
