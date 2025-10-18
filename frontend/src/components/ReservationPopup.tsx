'use client'

import { useState } from 'react'
import { X, MapPin, Clock, Calendar, ShoppingBag, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

interface ReservationPopupProps {
  isOpen: boolean
  onClose: () => void
  box: {
    id: string
    merchantName: string
    boxType: string
    discountedPrice: number
    originalPrice: number
    pickupTime: string
    availableDate: string
    merchantAddress: string
  }
  onConfirm: () => void
  isLoading?: boolean
}

export default function ReservationPopup({ 
  isOpen, 
  onClose, 
  box, 
  onConfirm, 
  isLoading = false 
}: ReservationPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Reservation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Box Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{box.boxType}</h3>
            <p className="text-sm text-gray-600 mb-3">{box.merchantName}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(box.discountedPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(box.originalPrice)}
                </span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                {Math.round(((box.originalPrice - box.discountedPrice) / box.originalPrice) * 100)}% off
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
                  <p className="text-sm text-gray-600">{box.merchantAddress}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Available Date</p>
                  <p className="text-sm text-gray-600">{formatDate(box.availableDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pickup Time</p>
                  <p className="text-sm text-gray-600">{box.pickupTime || '17:00-21:00'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ShoppingBag className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Quantity</p>
                  <p className="text-sm text-gray-600">1 box</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Important Notes</p>
                <ul className="text-xs text-blue-800 mt-1 space-y-1">
                  <li>• Please arrive within the pickup time window</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• Payment is made at the restaurant</li>
                  <li>• Reservation expires 24 hours after creation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isLoading ? 'Creating...' : 'Confirm Reservation'}
          </button>
        </div>
      </div>
    </div>
  )
}
