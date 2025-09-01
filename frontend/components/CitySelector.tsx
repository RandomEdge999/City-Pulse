import { useState } from 'react'
import { Globe, MapPin, TrendingUp, Users, Activity, Clock } from 'lucide-react'

interface City {
  id: string
  name: string
  country: string
  status: 'active' | 'beta' | 'coming-soon'
  zones: number
  moodIndex: number
  postCount: number
  description: string
  timezone: string
  population: string
}

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (cityId: string) => void
}

export default function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const [showAllCities, setShowAllCities] = useState(false)

  const cities: City[] = [
    {
      id: 'nyc',
      name: 'New York',
      country: 'United States',
      status: 'active',
      zones: 5,
      moodIndex: 72,
      postCount: 1247,
      description: 'The Big Apple - Financial capital with diverse neighborhoods and vibrant culture',
      timezone: 'EST (UTC-5)',
      population: '8.8M'
    },
    {
      id: 'london',
      name: 'London',
      country: 'United Kingdom',
      status: 'active',
      zones: 6,
      moodIndex: 68,
      postCount: 1893,
      description: 'Historic metropolis with modern innovation and diverse communities',
      timezone: 'GMT (UTC+0)',
      population: '9.0M'
    },
    {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japan',
      status: 'beta',
      zones: 8,
      moodIndex: 75,
      postCount: 2156,
      description: 'High-tech megacity with traditional culture and efficient urban planning',
      timezone: 'JST (UTC+9)',
      population: '14.0M'
    },
    {
      id: 'paris',
      name: 'Paris',
      country: 'France',
      status: 'beta',
      zones: 4,
      moodIndex: 71,
      postCount: 1432,
      description: 'City of Light with artistic heritage and modern urban development',
      timezone: 'CET (UTC+1)',
      population: '2.2M'
    },
    {
      id: 'singapore',
      name: 'Singapore',
      country: 'Singapore',
      status: 'coming-soon',
      zones: 0,
      moodIndex: 0,
      postCount: 0,
      description: 'Smart city with advanced technology and sustainable urban solutions',
      timezone: 'SGT (UTC+8)',
      population: '5.7M'
    },
    {
      id: 'berlin',
      name: 'Berlin',
      country: 'Germany',
      status: 'coming-soon',
      zones: 0,
      moodIndex: 0,
      postCount: 0,
      description: 'Creative capital with innovative startups and cultural diversity',
      timezone: 'CET (UTC+1)',
      population: '3.7M'
    }
  ]

  const currentCity = cities.find(city => city.id === selectedCity) || cities[0]

  const getStatusColor = (status: City['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'beta': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'coming-soon': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: City['status']) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'beta': return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      case 'coming-soon': return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    }
  }

  const handleCitySelect = (cityId: string) => {
    const city = cities.find(c => c.id === cityId)
    if (city && city.status !== 'coming-soon') {
      onCityChange(cityId)
      setShowAllCities(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current City Display */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentCity.name}</h2>
              <p className="text-gray-600">{currentCity.country}</p>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentCity.status)}`}>
              {getStatusIcon(currentCity.status)}
              <span className="ml-2">
                {currentCity.status === 'active' ? 'Live' : 
                 currentCity.status === 'beta' ? 'Beta' : 'Coming Soon'}
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Zones</p>
              <p className="text-xl font-bold text-gray-900">{currentCity.zones}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mood Index</p>
              <p className="text-xl font-bold text-gray-900">{currentCity.moodIndex}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Posts</p>
              <p className="text-xl font-bold text-gray-900">{currentCity.postCount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-gray-700">{currentCity.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{currentCity.timezone}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{currentCity.population} population</span>
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAllCities(!showAllCities)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{showAllCities ? 'Hide All Cities' : 'View All Cities'}</span>
          </button>
        </div>
      </div>

      {/* All Cities Grid */}
      {showAllCities && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Cities</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map(city => (
              <div
                key={city.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  city.id === selectedCity
                    ? 'border-blue-500 bg-blue-50'
                    : city.status === 'coming-soon'
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handleCitySelect(city.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{city.name}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(city.status)}`}>
                    {getStatusIcon(city.status)}
                    <span className="ml-1">
                      {city.status === 'active' ? 'Live' : 
                       city.status === 'beta' ? 'Beta' : 'Coming Soon'}
                    </span>
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{city.country}</p>
                
                {city.status !== 'coming-soon' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Zones:</span>
                      <span className="font-medium">{city.zones}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mood:</span>
                      <span className="font-medium">{city.moodIndex}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Posts:</span>
                      <span className="font-medium">{city.postCount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Coming Soon</p>
                    <p className="text-xs text-gray-400 mt-1">This city will be available in future updates</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live Cities: {cities.filter(c => c.status === 'active').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Beta Cities: {cities.filter(c => c.status === 'beta').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Coming Soon: {cities.filter(c => c.status === 'coming-soon').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
