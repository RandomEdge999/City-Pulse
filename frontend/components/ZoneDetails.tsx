import { useState, useEffect } from 'react'
import { ZoneData, ZoneDetailsData } from '../types/cityPulse'
import { TrendingUp, TrendingDown, Minus, Activity, Users, Clock } from 'lucide-react'

interface ZoneDetailsProps {
  zone: ZoneData | null
}

export default function ZoneDetails({ zone }: ZoneDetailsProps) {
  if (!zone) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-600 p-6 text-center">
        <div className="text-slate-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Zone Selected</h3>
        <p className="text-slate-400 text-sm">
          Click on a building in the city map to see detailed information about that zone.
        </p>
      </div>
    )
  }
  const [zoneDetails, setZoneDetails] = useState<ZoneDetailsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchZoneDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zone/${zone.zone_id}`)
        if (response.ok) {
          const data = await response.json()
          setZoneDetails(data)
        }
      } catch (error) {
        console.error('Failed to fetch zone details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchZoneDetails()
  }, [zone.zone_id])

  const getMoodTrend = (moodIndex: number) => {
    if (moodIndex >= 70) return { icon: TrendingUp, color: 'text-mood-positive', label: 'Positive' }
    if (moodIndex >= 40) return { icon: Minus, color: 'text-mood-neutral', label: 'Neutral' }
    return { icon: TrendingDown, color: 'text-mood-negative', label: 'Negative' }
  }

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: 'text-green-600',
      sadness: 'text-blue-600',
      anger: 'text-red-600',
      fear: 'text-purple-600',
      surprise: 'text-yellow-600',
      disgust: 'text-orange-600',
      neutral: 'text-gray-600'
    }
    return colors[emotion] || 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{zone.zone_name}</h3>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{zone.post_count}</span>
        </div>
      </div>

      {/* Current Mood */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Mood</span>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`text-3xl font-bold ${
            zone.current_mood_index >= 70 ? 'text-mood-positive' :
            zone.current_mood_index >= 40 ? 'text-mood-neutral' : 'text-mood-negative'
          }`}>
            {zone.current_mood_index}
          </div>
          
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  zone.current_mood_index >= 70 ? 'bg-mood-positive' :
                  zone.current_mood_index >= 40 ? 'bg-mood-neutral' : 'bg-mood-negative'
                }`}
                style={{ width: `${zone.current_mood_index}%` }}
              ></div>
            </div>
            <div className="flex items-center mt-1">
              {(() => {
                const trend = getMoodTrend(zone.current_mood_index)
                const Icon = trend.icon
                return (
                  <>
                    <Icon className={`w-4 h-4 ${trend.color} mr-1`} />
                    <span className={`text-sm ${trend.color}`}>{trend.label}</span>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Dominant Emotion */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Dominant Emotion</h4>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-gray-500" />
          <span className={`text-lg font-medium capitalize ${getEmotionColor(zone.dominant_emotion)}`}>
            {zone.dominant_emotion}
          </span>
        </div>
      </div>

      {/* Emotion Breakdown */}
      {zoneDetails && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Emotion Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(zoneDetails.emotion_breakdown).map(([emotion, value]) => (
              <div key={emotion} className="flex items-center justify-between">
                <span className={`text-sm capitalize ${getEmotionColor(emotion)}`}>
                  {emotion}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getEmotionColor(emotion)}`}
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environmental Data */}
      {zoneDetails && Object.keys(zoneDetails.environmental_data).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Environmental Data</h4>
          <div className="space-y-2">
            {Object.entries(zoneDetails.environmental_data).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                <span className="font-medium">
                  {data.average_value} {data.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>Last updated: {new Date(zone.last_updated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}
