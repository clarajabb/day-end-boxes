'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ApiService } from '@/lib/api'
import { 
  Home, 
  ShoppingBag, 
  User, 
  Settings, 
  Bell, 
  LogOut,
  Menu,
  X,
  MapPin,
  Heart
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Reservations', href: '/reservations', icon: ShoppingBag },
  { name: 'Profile', href: '/profile', icon: User },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeReservations, setActiveReservations] = useState(0)

  // Load active reservations count
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await ApiService.getUserReservations()
        if (response.success && response.data) {
          const activeCount = response.data.filter((reservation: any) => 
            reservation.status === 'ACTIVE'
          ).length
          setActiveReservations(activeCount)
        }
      } catch (error) {
        console.error('Error loading reservations:', error)
      }
    }

    loadReservations()

    // Listen for reservation updates
    const handleReservationUpdate = () => {
      loadReservations()
    }

    window.addEventListener('reservationUpdated', handleReservationUpdate)
    
    return () => {
      window.removeEventListener('reservationUpdated', handleReservationUpdate)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-emerald-600">Day-End Boxes</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="relative mr-4">
                          <item.icon className="h-6 w-6" />
                          {item.name === 'Reservations' && activeReservations > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {activeReservations}
                            </span>
                          )}
                        </div>
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
              
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-sm font-medium text-gray-500">{user?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-emerald-600">Day-End Boxes</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="relative mr-3">
                        <item.icon className="h-5 w-5" />
                        {item.name === 'Reservations' && activeReservations > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {activeReservations}
                          </span>
                        )}
                      </div>
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                  <p className="text-xs font-medium text-gray-500">{user?.phone}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
