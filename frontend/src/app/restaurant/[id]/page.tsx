'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ApiService } from '@/lib/api'
import { formatCurrency, formatDate, calculateDistance } from '@/lib/utils'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import ReservationPopup from '@/components/ReservationPopup'
import { 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  ShoppingBag,
  ArrowLeft,
  Phone,
  Mail,
  Calendar
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

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedBox, setSelectedBox] = useState<Box | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isReserving, setIsReserving] = useState(false)

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setIsLoading(true)
        
        // Load merchants to find the specific restaurant
        const merchantsResponse = await ApiService.getAllMerchants()
        if (merchantsResponse.success) {
          const foundMerchant = merchantsResponse.data.find((m: Merchant) => m.id === params.id)
          if (foundMerchant) {
            setMerchant(foundMerchant)
          } else {
            toast.error('Restaurant not found')
            router.push('/dashboard')
            return
          }
        }

        // Set user location (default to Beirut)
        const defaultLocation = { lat: 33.8938, lng: 35.5018 }
        setUserLocation(defaultLocation)
        
        // Load boxes for this specific restaurant
        const boxesResponse = await ApiService.getNearbyBoxes(defaultLocation.lat, defaultLocation.lng, 50) // Larger radius to get all boxes
        if (boxesResponse.success) {
          // Filter boxes to only show this restaurant's boxes
          const restaurantBoxes = boxesResponse.data.filter((box: Box) => box.merchantId === params.id)
          setBoxes(restaurantBoxes)
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error)
        toast.error('Failed to load restaurant data')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadRestaurantData()
    }
  }, [params.id, router])

  const handleReserveBox = async (box: Box) => {
    setSelectedBox(box)
    setIsPopupOpen(true)
  }

  const handleConfirmReservation = async () => {
    if (!selectedBox) return

    try {
      setIsReserving(true)
      const response = await ApiService.createReservation(selectedBox.id, 1)
      
      if (response.success) {
        toast.success(`Reservation created for ${selectedBox.boxType} at ${selectedBox.merchantName}!`)
        
        // Refresh the boxes to update availability
        const boxesResponse = await ApiService.getNearbyBoxes(userLocation!.lat, userLocation!.lng, 50)
        if (boxesResponse.success) {
          const restaurantBoxes = boxesResponse.data.filter((b: Box) => b.merchantId === params.id)
          setBoxes(restaurantBoxes)
        }
        
        // Close popup
        setIsPopupOpen(false)
        setSelectedBox(null)
      } else {
        toast.error('Failed to create reservation. Please try again.')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      toast.error('Failed to create reservation. Please try again.')
    } finally {
      setIsReserving(false)
    }
  }

  const distance = userLocation && merchant ? 
    calculateDistance(userLocation.lat, userLocation.lng, merchant.latitude, merchant.longitude) : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!merchant) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Restaurant Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{merchant.businessName}</h1>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Restaurant Image */}
                <div className="lg:w-1/3">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={merchant.profileImage} 
                      alt={merchant.businessName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'
                      }}
                    />
                  </div>
                </div>
                
                {/* Restaurant Info */}
                <div className="lg:w-2/3">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                        <span className="text-lg font-medium">4.5</span>
                        <span className="text-gray-500 ml-2">({boxes.length} boxes available)</span>
                      </div>
                      <p className="text-gray-600 mb-4">{merchant.description}</p>
                    </div>
                    {distance && (
                      <div className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                        {distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{merchant.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{merchant.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{merchant.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm capitalize">
                        {merchant.category.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boxes Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Boxes</h2>
            <p className="text-gray-600">Choose from {boxes.length} available boxes</p>
          </div>

          {boxes.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No boxes available</h3>
              <p className="text-gray-600">This restaurant doesn't have any boxes available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxes.map((box) => (
                <div key={box.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col h-full">
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{box.boxType}</h3>
                        <p className="text-gray-600 text-sm mb-3">{box.description}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Heart className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Available: {formatDate(box.availableDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Pickup: {box.pickupTime}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        <span>{box.availableQuantity} left</span>
                      </div>
                    </div>
                    
                    {box.allergens.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Allergens:</p>
                        <div className="flex flex-wrap gap-1">
                          {box.allergens.map((allergen, index) => (
                            <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-emerald-600">
                          {formatCurrency(box.discountedPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(box.originalPrice)}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          {box.discountPercentage}% off
                        </span>
                      </div>
                    </div>
                    
                  </div>
                  
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleReserveBox(box)}
                      disabled={!box.isAvailable}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        box.isAvailable
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {box.isAvailable ? 'Reserve Now' : 'Not Available'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reservation Popup */}
      {selectedBox && (
        <ReservationPopup
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false)
            setSelectedBox(null)
          }}
          box={selectedBox}
          onConfirm={handleConfirmReservation}
          isLoading={isReserving}
        />
      )}
    </AuthenticatedLayout>
  )
}
