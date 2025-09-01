
import { useEffect, useState } from 'react'
import { ZoneData } from '../types/cityPulse'

interface LeafletMapProps {
  zones: ZoneData[]
  onZoneSelect: (zone: ZoneData | null) => void
  selectedZone: ZoneData | null
}

export default function LeafletMap({ zones, onZoneSelect, selectedZone }: LeafletMapProps): JSX.Element {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get color based on mood index
  const getZoneColor = (moodIndex: number) => {
    if (moodIndex >= 70) return '#10b981' // Green for positive mood
    if (moodIndex >= 40) return '#6b7280' // Gray for neutral mood
    return '#ef4444' // Red for negative mood
  }

  // Get opacity based on selection
  const getZoneOpacity = (zoneId: number) => {
    return selectedZone?.zone_id === zoneId ? 0.8 : 0.6
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90 p-2 z-10 border-b">
        <h3 className="text-sm font-medium text-gray-700">NYC City Zones</h3>
        <p className="text-xs text-gray-500">Click zones to see details</p>
      </div>
      
      {/* Map Container */}
      <div className="relative w-full h-full p-4 pt-16">
        {/* Zone Grid */}
        <div className="grid grid-cols-3 gap-4 h-full">
          {zones.map((zone) => (
            <div
              key={zone.zone_id}
              className={`
                relative rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105
                ${selectedZone?.zone_id === zone.zone_id ? 'ring-4 ring-blue-500' : ''}
              `}
              style={{
                backgroundColor: getZoneColor(zone.current_mood_index),
                opacity: getZoneOpacity(zone.zone_id),
                borderColor: selectedZone?.zone_id === zone.zone_id ? '#3b82f6' : '#374151'
              }}
              onClick={() => onZoneSelect(zone)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.zIndex = '20'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.zIndex = '10'
              }}
            >
              {/* Zone Content */}
              <div className="p-3 text-white">
                <h4 className="font-bold text-lg mb-1">{zone.zone_name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Mood:</span>
                    <span className="font-semibold">{zone.current_mood_index}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posts:</span>
                    <span className="font-semibold">{zone.post_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotion:</span>
                    <span className="font-semibold capitalize">{zone.dominant_emotion}</span>
                  </div>
                </div>
              </div>
              
              {/* Selection Indicator */}
              {selectedZone?.zone_id === zone.zone_id && (
                <div className="absolute top-2 right-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Map Instructions */}
        <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-90 rounded p-2 text-center">
          <p className="text-xs text-gray-600">
            💡 <strong>Interactive Map:</strong> Click on any zone to see detailed information
          </p>
        </div>
      </div>
    </div>
  )
}
