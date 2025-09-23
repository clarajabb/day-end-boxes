'use client'

import { useState, useEffect } from 'react'
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
  Search
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
}

interface Merchant {
  id: string
  name: string
  description: string
  cuisine: string
  area: string
  address: string
  phone: string
  email: string
  rating: number
  isSustainable: boolean
  isActive: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [boxes, setBoxes] = useState<Box[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load merchants
        const merchantsResponse = await ApiService.getAllMerchants()
        if (merchantsResponse.success) {
          setMerchants(merchantsResponse.data || [])
        }

        // Load user stats
        const statsResponse = await ApiService.getUserStats()
        if (statsResponse.success) {
          setUserStats(statsResponse.data)
        }

        // Try to get user location, but don't fail if unavailable
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              setUserLocation(location)
              
              // Load nearby boxes
              const boxesResponse = await ApiService.getNearbyBoxes(location.lat, location.lng, 10)
              if (boxesResponse.success) {
                setBoxes(boxesResponse.data || [])
              }
            },
            (error) => {
              console.warn('Location not available:', error.message)
              // Don't show error toast, just use default location (Beirut)
              const defaultLocation = { lat: 33.8938, lng: 35.5018 } // Beirut coordinates
              setUserLocation(defaultLocation)
              
              // Load boxes with default location
              ApiService.getNearbyBoxes(defaultLocation.lat, defaultLocation.lng, 10)
                .then(response => {
                  if (response.success) {
                    setBoxes(response.data || [])
                  }
                })
                .catch(err => console.error('Error loading boxes:', err))
            },
            {
              timeout: 5000,
              enableHighAccuracy: false,
              maximumAge: 300000 // 5 minutes
            }
          )
        } else {
          // Fallback to default location if geolocation is not supported
          const defaultLocation = { lat: 33.8938, lng: 35.5018 } // Beirut coordinates
          setUserLocation(defaultLocation)
          
          // Load boxes with default location
          try {
            const boxesResponse = await ApiService.getNearbyBoxes(defaultLocation.lat, defaultLocation.lng, 10)
            if (boxesResponse.success) {
              setBoxes(boxesResponse.data || [])
            }
          } catch (error) {
            console.error('Error loading boxes:', error)
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
    }, [])

  // Filter boxes based on search criteria
  const filteredBoxes = boxes.filter(box => {
    const matchesSearch = box.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.boxType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         box.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesArea = !selectedArea || merchants.find(m => m.id === box.merchantId)?.area === selectedArea
    const matchesCuisine = !selectedCuisine || merchants.find(m => m.id === box.merchantId)?.cuisine === selectedCuisine
    
    return matchesSearch && matchesArea && matchesCuisine
  })

  // Get unique areas and cuisines for filters
  const areas = [...new Set(merchants.map(m => m.area).filter(Boolean))].sort()
  const cuisines = [...new Set(merchants.map(m => m.cuisine).filter(Boolean))].sort()

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
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.completed}</p>
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

        {/* Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoxes.map((box) => {
            const merchant = merchants.find(m => m.id === box.merchantId)
            const distance = userLocation && merchant ? 
              calculateDistance(userLocation.lat, userLocation.lng, 33.8938, 35.5018) : null
            
            return (
              <div key={box.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
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
                    <span>{merchant?.area}</span>
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
                      <span className="ml-1 text-sm text-gray-600">{merchant?.rating}</span>
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
                  
                  <button className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
                    Reserve Now
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredBoxes.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No boxes found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
