import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

export default function MapPicker({ onLocationChange, initialCoordinates = null }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const [coordinates, setCoordinates] = useState(initialCoordinates || { lat: 30.0444, lng: 31.2357 })
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordinates.lng, coordinates.lat],
      zoom: 11,
    })

    // Add click handler
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat
      setCoordinates({ lat, lng })
      
      // Add/update marker
      if (marker.current) {
        marker.current.setLngLat([lng, lat])
      } else {
        marker.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current)
      }

      // Reverse geocode to get address
      await reverseGeocode(lng, lat)
    })

    // Add initial marker if coordinates exist
    if (initialCoordinates) {
      marker.current = new mapboxgl.Marker()
        .setLngLat([initialCoordinates.lng, initialCoordinates.lat])
        .addTo(map.current)
      
      reverseGeocode(initialCoordinates.lng, initialCoordinates.lat)
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Reverse geocoding function
  const reverseGeocode = async (lng, lat) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name
        setAddress(placeName)
        onLocationChange({ lat, lng, address: placeName })
      } else {
        setAddress('Location not found')
        onLocationChange({ lat, lng, address: 'Unknown location' })
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      setAddress('Error getting address')
      onLocationChange({ lat, lng, address: 'Unknown location' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <div ref={mapContainer} className="h-80 w-full" />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Selected Location Address
        </label>
        <input
          type="text"
          value={loading ? 'Getting address...' : address}
          readOnly
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700"
          placeholder="Click on the map to select location"
        />
      </div>
      
      <div className="text-[10px] text-gray-400">
        Click anywhere on the map to drop a pin and get the address
      </div>
    </div>
  )
}
