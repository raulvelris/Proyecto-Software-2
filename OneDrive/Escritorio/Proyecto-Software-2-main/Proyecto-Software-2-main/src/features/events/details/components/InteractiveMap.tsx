import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { useState } from 'react'
import { Button } from '../../../../components/Button'

interface InteractiveMapProps {
  coordinates: { lat: number; lng: number }
  eventName: string
  locationCity: string
  apiKey: string
}

const containerStyle = {
  width: '100%',
  height: '300px'
}

export default function InteractiveMap({ coordinates, eventName, locationCity, apiKey }: InteractiveMapProps) {
  const [showInfoWindow, setShowInfoWindow] = useState(false)

  const handleMarkerClick = () => {
    setShowInfoWindow(!showInfoWindow)
  }

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`,
      '_blank'
    )
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  })

  if (loadError) {
    return <div className="p-4 text-sm text-red-400">Error al cargar el mapa</div>
  }

  if (!isLoaded) {
    return <div className="p-4 text-sm text-slate-400">Cargando mapa…</div>
  }

  return (
    <div className="space-y-3">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={coordinates}
        zoom={14}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={coordinates}
          onClick={handleMarkerClick}
          animation={window.google?.maps?.Animation?.DROP}
        />
        
        {showInfoWindow && (
          <InfoWindow
            position={coordinates}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div className="p-2">
              <h4 className="font-semibold text-slate-900">{eventName}</h4>
              <p className="text-sm text-slate-600">{locationCity}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <Button 
        variant="primary" 
        onClick={openInGoogleMaps}
        className="w-full"
      >
        <i className="bi bi-map me-2" />
        Abrir en Google Maps
      </Button>
    </div>
  )
}
