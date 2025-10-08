import { useState, useEffect } from 'react'
import { cn } from '../utils/cn'

interface LocationInputProps {
  address?: string
  lat?: number
  lng?: number
  onLocationChange: (data: { address: string; lat: number; lng: number }) => void
  error?: string
  className?: string
}

export default function LocationInput({ 
  address = '', 
  lat, 
  lng, 
  onLocationChange, 
  error, 
  className 
}: LocationInputProps) {
  const [manualAddress, setManualAddress] = useState(address)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Google Maps API
  useEffect(() => {
    const initializeGoogleMaps = () => {
      if (window.google && window.google.maps) {
        return
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    initializeGoogleMaps()
  }, [])

  const handleManualAddressChange = (value: string) => {
    setManualAddress(value)
    onLocationChange({ address: value, lat: lat || 0, lng: lng || 0 })
  }

  const handleGoogleMapsSearch = () => {
    if (!window.google || !window.google.maps) {
      alert('Google Maps API not loaded. Please check your API key.')
      return
    }

    setIsLoading(true)

    const service = new window.google.maps.places.PlacesService(document.createElement('div'))
    
    const request = {
      query: manualAddress,
      fields: ['name', 'geometry', 'formatted_address']
    }

    service.textSearch(request, (results: any, status: any) => {
      setIsLoading(false)
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0]
        const location = place.geometry?.location
        
        if (location) {
          const newAddress = place.formatted_address || manualAddress
          const newLat = location.lat()
          const newLng = location.lng()
          
          setManualAddress(newAddress)
          onLocationChange({ 
            address: newAddress, 
            lat: newLat, 
            lng: newLng 
          })
        }
      } else {
        alert('Location not found. Please try a different address.')
      }
    })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Reverse geocoding to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder()
          const latlng = new window.google.maps.LatLng(latitude, longitude)
          
          geocoder.geocode({ location: latlng }, (results: any, status: any) => {
            setIsLoading(false)
            
            if (status === 'OK' && results && results[0]) {
              const newAddress = results[0].formatted_address
              setManualAddress(newAddress)
              onLocationChange({ 
                address: newAddress, 
                lat: latitude, 
                lng: longitude 
              })
            } else {
              setManualAddress(`${latitude}, ${longitude}`)
              onLocationChange({ 
                address: `${latitude}, ${longitude}`, 
                lat: latitude, 
                lng: longitude 
              })
            }
          })
        } else {
          setManualAddress(`${latitude}, ${longitude}`)
          onLocationChange({ 
            address: `${latitude}, ${longitude}`, 
            lat: latitude, 
            lng: longitude 
          })
          setIsLoading(false)
        }
      },
      (error) => {
        setIsLoading(false)
        alert('Error getting current location: ' + error.message)
      }
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="label">Exact Location</label>
      
      <div className="space-y-3">
        {/* Address input */}
        <div>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => handleManualAddressChange(e.target.value)}
            placeholder="Enter exact address (e.g., Av. Larco 123, Miraflores, Lima)"
            className={cn(
              'input w-full',
              error && 'border-red-300'
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGoogleMapsSearch}
            disabled={!manualAddress.trim() || isLoading}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search on Google Maps'}
          </button>
          
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Getting location...' : 'Use Current Location'}
          </button>
        </div>

        {/* Coordinates display */}
        {(lat && lng) && (
          <div className="text-sm text-slate-500 bg-slate-50 p-2 rounded-md">
            <strong>Coordinates:</strong> {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      <p className="text-xs text-slate-500">
        Enter the exact address manually or use Google Maps to search and get precise coordinates.
      </p>
    </div>
  )
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any
  }
}
