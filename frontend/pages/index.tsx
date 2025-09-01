import { useState, useEffect, useCallback } from 'react'
import CityMap from '../components/CityMap'
import DataFlow from '../components/DataFlow'
import MoodTimeline from '../components/MoodTimeline'
import ZoneDetails from '../components/ZoneDetails'
import AlertsPanel from '../components/AlertsPanel'
import AboutSection from '../components/AboutSection'
import CitySelector from '../components/CitySelector'
import NewsFeed from '../components/NewsFeed'
import { ZoneData, CityPulseData } from '../types/cityPulse'
import { BarChart3, Map, Info, Globe, Settings, TrendingUp, Users, Activity, Clock, Wifi, Signal, Battery } from 'lucide-react'

export default function Home() {
  const [cityData, setCityData] = useState<CityPulseData | null>(null)
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null)
  const [selectedCity, setSelectedCity] = useState('nyc')
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'about' | 'cities'>('dashboard')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isOnline, setIsOnline] = useState(true)

  // City-specific data mapping with real-time simulation
  const cityDataMap = {
    nyc: {
      name: 'New York',
      country: 'United States',
      timezone: 'EST (UTC-5)',
      population: '8.8M',
      zones: [
        { zone_id: 1, zone_name: 'Manhattan', center_lat: 40.7589, center_lon: -73.9851, current_mood_index: 75, post_count: 456, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 2, zone_name: 'Brooklyn', center_lat: 40.6782, center_lon: -73.9442, current_mood_index: 68, post_count: 389, dominant_emotion: 'happy', last_updated: new Date().toISOString() },
        { zone_id: 3, zone_name: 'Queens', center_lat: 40.7282, center_lon: -73.7949, current_mood_index: 72, post_count: 234, dominant_emotion: 'content', last_updated: new Date().toISOString() },
        { zone_id: 4, zone_name: 'Bronx', center_lat: 40.8448, center_lon: -73.8648, current_mood_index: 65, post_count: 123, dominant_emotion: 'neutral', last_updated: new Date().toISOString() },
        { zone_id: 5, zone_name: 'Staten Island', center_lat: 40.5795, center_lon: -74.1502, current_mood_index: 70, post_count: 45, dominant_emotion: 'happy', last_updated: new Date().toISOString() }
      ],
      city_mood_index: 70,
      total_zones: 5
    },
    london: {
      name: 'London',
      country: 'United Kingdom',
      timezone: 'GMT (UTC+0)',
      population: '9.0M',
      zones: [
        { zone_id: 1, zone_name: 'Westminster', center_lat: 51.5074, center_lon: -0.1278, current_mood_index: 78, post_count: 567, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 2, zone_name: 'Camden', center_lat: 51.5517, center_lon: -0.1588, current_mood_index: 72, post_count: 423, dominant_emotion: 'happy', last_updated: new Date().toISOString() },
        { zone_id: 3, zone_name: 'Greenwich', center_lat: 51.4800, center_lon: -0.0000, current_mood_index: 69, post_count: 234, dominant_emotion: 'content', last_updated: new Date().toISOString() },
        { zone_id: 4, zone_name: 'Hackney', center_lat: 51.5734, center_lon: -0.0724, current_mood_index: 71, post_count: 345, dominant_emotion: 'happy', last_updated: new Date().toISOString() },
        { zone_id: 5, zone_name: 'Islington', center_lat: 51.5362, center_lon: -0.1033, current_mood_index: 74, post_count: 289, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 6, zone_name: 'Southwark', center_lat: 51.4885, center_lon: -0.0915, current_mood_index: 66, post_count: 156, dominant_emotion: 'neutral', last_updated: new Date().toISOString() }
      ],
      city_mood_index: 72,
      total_zones: 6
    },
    tokyo: {
      name: 'Tokyo',
      country: 'Japan',
      timezone: 'JST (UTC+9)',
      population: '14.0M',
      zones: [
        { zone_id: 1, zone_name: 'Shibuya', center_lat: 35.6580, center_lon: 139.7016, current_mood_index: 82, post_count: 789, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 2, zone_name: 'Shinjuku', center_lat: 35.6895, center_lon: 139.6917, current_mood_index: 79, post_count: 654, dominant_emotion: 'happy', last_updated: new Date().toISOString() },
        { zone_id: 3, zone_name: 'Harajuku', center_lat: 35.6702, center_lon: 139.7019, current_mood_index: 76, post_count: 432, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 4, zone_name: 'Ginza', center_lat: 35.6720, center_lon: 139.7673, current_mood_index: 74, post_count: 345, dominant_emotion: 'content', last_updated: new Date().toISOString() },
        { zone_id: 5, zone_name: 'Asakusa', center_lat: 35.7148, center_lon: 139.7967, current_mood_index: 71, post_count: 234, dominant_emotion: 'happy', last_updated: new Date().toISOString() },
        { zone_id: 6, zone_name: 'Roppongi', center_lat: 35.6586, center_lon: 139.7454, current_mood_index: 77, post_count: 456, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 7, zone_name: 'Akihabara', center_lat: 35.7021, center_lon: 139.7745, current_mood_index: 80, post_count: 567, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 8, zone_name: 'Ueno', center_lat: 35.7148, center_lon: 139.7967, current_mood_index: 73, post_count: 234, dominant_emotion: 'happy', last_updated: new Date().toISOString() }
      ],
      city_mood_index: 77,
      total_zones: 8
    },
    paris: {
      name: 'Paris',
      country: 'France',
      timezone: 'CET (UTC+1)',
      population: '2.2M',
      zones: [
        { zone_id: 1, zone_name: 'Le Marais', center_lat: 48.8566, center_lon: 2.3522, current_mood_index: 75, post_count: 456, dominant_emotion: 'excited', last_updated: new Date().toISOString() },
        { zone_id: 2, zone_name: 'Montmartre', center_lat: 48.8867, center_lon: 2.3431, current_mood_index: 78, post_count: 567, dominant_emotion: 'happy', last_updated: new Date().toISOString() },
        { zone_id: 3, zone_name: 'Saint-Germain', center_lat: 48.8534, center_lon: 2.3488, current_mood_index: 72, post_count: 234, dominant_emotion: 'content', last_updated: new Date().toISOString() },
        { zone_id: 4, zone_name: 'Champs-Élysées', center_lat: 48.8698, center_lon: 2.3077, current_mood_index: 69, post_count: 345, dominant_emotion: 'neutral', last_updated: new Date().toISOString() }
      ],
      city_mood_index: 74,
      total_zones: 4
    }
  }

  // Real-time data simulation
  const simulateRealTimeData = useCallback(() => {
    const mockData = cityDataMap[selectedCity as keyof typeof cityDataMap] || cityDataMap.nyc
    
    // Simulate real-time fluctuations
    const updatedZones = mockData.zones.map(zone => ({
      ...zone,
      current_mood_index: Math.max(0, Math.min(100, zone.current_mood_index + (Math.random() - 0.5) * 4)),
      post_count: zone.post_count + Math.floor(Math.random() * 10),
      last_updated: new Date().toISOString()
    }))
    
    // Calculate new city mood index
    const newCityMoodIndex = Math.round(
      updatedZones.reduce((sum, zone) => sum + zone.current_mood_index, 0) / updatedZones.length
    )
    
    const transformedData: CityPulseData = {
      city_mood_index: newCityMoodIndex,
      total_zones: updatedZones.length,
      zones: updatedZones,
      timestamp: new Date().toISOString()
    }
    
    setCityData(transformedData)
    setLastUpdate(new Date())
  }, [selectedCity])

  // Handle city change
  const handleCityChange = useCallback((cityId: string) => {
    setSelectedCity(cityId)
    setSelectedZone(null) // Reset selected zone when changing cities
    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      simulateRealTimeData()
      setLoading(false)
    }, 500)
  }, [simulateRealTimeData])

  useEffect(() => {
    // Initial data load
    simulateRealTimeData()
    setLoading(false)
    
    // Real-time updates every 5 seconds
    const interval = setInterval(simulateRealTimeData, 5000)
    
    // Online status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [simulateRealTimeData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="mt-6 text-gray-700 text-xl font-medium">Initializing City Pulse Analytics</p>
              <p className="mt-2 text-gray-500 text-sm">Loading urban intelligence systems...</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Connection Error</h1>
            <p className="text-gray-600 text-lg mb-6">Unable to connect to the City Pulse analytics platform.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentCityInfo = cityDataMap[selectedCity as keyof typeof cityDataMap] || cityDataMap.nyc

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Apple-style Status Bar */}
      <div className="bg-black text-white px-4 py-2 text-sm font-medium">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>{currentCityInfo.name}</span>
            <span>•</span>
            <span>{currentCityInfo.timezone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Professional Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  City Pulse Analytics
                </h1>
                <p className="text-xs text-gray-500">Urban Intelligence Platform</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all font-medium ${
                  activeView === 'dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveView('cities')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all font-medium ${
                  activeView === 'cities'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Cities</span>
              </button>
              
              <button
                onClick={() => setActiveView('about')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all font-medium ${
                  activeView === 'about'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </button>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'Live' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    Mood: <span className="font-semibold text-blue-600">{cityData.city_mood_index}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">
                    Zones: <span className="font-semibold text-purple-600">{cityData.total_zones}</span>
                  </span>
                </div>
              </div>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <>
            {/* Header Section */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {currentCityInfo.name} Urban Sentiment Analytics
                </h1>
                <p className="text-gray-600 text-lg mb-4">
                  Real-time city mood analysis and predictive urban intelligence
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                  </span>
                  <span>•</span>
                  <span>{currentCityInfo.country}</span>
                  <span>•</span>
                  <span>{currentCityInfo.population} population</span>
                </div>
              </div>
              
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">City Mood Index</p>
                      <p className="text-2xl font-bold text-gray-900">{cityData.city_mood_index}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Zones</p>
                      <p className="text-2xl font-bold text-gray-900">{cityData.total_zones}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Posts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {cityData.zones.reduce((sum, zone) => sum + zone.post_count, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Current City</p>
                      <p className="text-2xl font-bold text-gray-900">{currentCityInfo.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* City Map - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <CityMap
                  zones={cityData.zones}
                  onZoneSelect={setSelectedZone}
                  selectedZone={selectedZone}
                  selectedCity={selectedCity}
                />
              </div>

              {/* Data Flow Network */}
              <div className="lg:col-span-1">
                <DataFlow
                  zones={cityData.zones}
                  cityMoodIndex={cityData.city_mood_index}
                />
              </div>
            </div>

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Mood Timeline */}
              <div className="lg:col-span-2">
                <MoodTimeline zones={cityData.zones} />
              </div>

              {/* Zone Details */}
              <div className="lg:col-span-1">
                <ZoneDetails zone={selectedZone} />
              </div>
            </div>

            {/* News Feed & Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* News Feed */}
              <div>
                <NewsFeed selectedCity={selectedCity} />
              </div>
              
              {/* Alerts Panel */}
              <div>
                <AlertsPanel selectedCity={selectedCity} />
              </div>
            </div>
          </>
        )}

        {/* Cities View */}
        {activeView === 'cities' && (
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Multi-City Analysis</h2>
              <p className="text-gray-600 text-lg">
                Explore urban sentiment patterns across different global cities
              </p>
            </div>
            <CitySelector
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
            />
          </div>
        )}

        {/* About View */}
        {activeView === 'about' && (
          <div className="mb-8">
            <AboutSection />
          </div>
        )}
      </div>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  Platform {isOnline ? 'Active' : 'Offline'}
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 text-sm">
                Data Sources: <span className="text-blue-600 font-medium">6 APIs</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 text-sm">
                ML Models: <span className="text-purple-600 font-medium">3 Active</span>
              </span>
            </div>
            
            <p className="text-gray-500 text-sm mb-4">
              City Pulse Analytics Platform • Urban Intelligence Lab • 
              <span className="text-blue-600 ml-1 font-medium">Enterprise-Grade Analytics</span>
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <span>© 2024 Urban Intelligence Lab</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>API Documentation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
