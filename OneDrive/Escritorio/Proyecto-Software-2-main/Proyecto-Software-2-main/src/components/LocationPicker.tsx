import React, { useEffect, useRef, useState } from 'react'

type Props = {
  onCancel: () => void
  onSelect: (address: string, lat: number, lng: number) => void
}

// Lima approximate bounds
const LIMA_BOUNDS = {
  south: -12.5,
  north: -11.7,
  west: -77.3,
  east: -76.6,
}

export default function LocationPicker({ onCancel, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function ensureLeaflet() {
      function hasL(): boolean { return typeof (window as any).L !== 'undefined' }
      if (hasL()) return

      // inject CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      // inject JS
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Leaflet'))
        document.body.appendChild(script)
      })
    }

    async function init() {
      try {
        await ensureLeaflet()
        if (cancelled) return
        const L = (window as any).L
        if (!containerRef.current) return

        const map = L.map(containerRef.current).setView([-12.0464, -77.0428], 11)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        const bounds = L.latLngBounds(
          L.latLng(LIMA_BOUNDS.south, LIMA_BOUNDS.west),
          L.latLng(LIMA_BOUNDS.north, LIMA_BOUNDS.east)
        )
        map.setMaxBounds(bounds)
        map.on('drag', function () { map.panInsideBounds(bounds, { animate: false }) })

        let marker: any = null

        async function reverseGeocode(lat: number, lng: number): Promise<string> {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
          if (!res.ok) throw new Error('Geocoding failed')
          const data = await res.json()
          return data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }

        async function onMapClick(e: any) {
          const { lat, lng } = e.latlng
          if (!bounds.contains([lat, lng])) {
            setError('La ubicación debe estar dentro de Lima')
            return
          }
          setError(null)
          if (marker) map.removeLayer(marker)
          marker = L.marker([lat, lng]).addTo(map)
          try {
            const addr = await reverseGeocode(lat, lng)
            onSelect(addr, lat, lng)
          } catch {
            onSelect('Lima', lat, lng)
          }
        }

        map.on('click', onMapClick)
        setLoading(false)

        return () => {
          map.off()
          map.remove()
        }
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el mapa')
        setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [onSelect])

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold">Pick location (Lima only)</h3>
          <button className="btn-secondary" onClick={onCancel}>Close</button>
        </div>
        <div className="h-[60vh]">
          <div ref={containerRef} className="w-full h-full" />
        </div>
        <div className="p-3 border-t border-slate-700 text-sm">
          {loading && <span className="text-slate-400">Cargando mapa…</span>}
          {error && <span className="text-red-400">{error}</span>}
          {!loading && !error && <span className="text-slate-400">Haz click en el mapa dentro de Lima para seleccionar.</span>}
        </div>
      </div>
    </div>
  )
}
