import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Download, Settings, Eye, Clock, MapPin } from 'lucide-react'

interface Alert {
  id: string
  type: 'mood_drop' | 'traffic_congestion' | 'weather_warning' | 'social_unrest' | 'infrastructure' | 'environmental'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  zone: string
  timestamp: string
  status: 'active' | 'acknowledged' | 'resolved'
  moodImpact: number
  affectedPopulation: number
}

interface AlertsPanelProps {
  selectedCity: string
}

export default function AlertsPanel({ selectedCity }: AlertsPanelProps): JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [showThresholdConfig, setShowThresholdConfig] = useState(false)
  const [thresholds, setThresholds] = useState({
    moodDrop: 15,
    trafficCongestion: 80,
    weatherWarning: 70,
    socialUnrest: 50,
    infrastructure: 60,
    environmental: 75
  })

  // City-specific alert data
  const cityAlertData = {
    nyc: {
      zones: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
      commonIssues: ['traffic', 'subway delays', 'construction', 'weather', 'air quality']
    },
    london: {
      zones: ['Westminster', 'Camden', 'Greenwich', 'Hackney', 'Islington', 'Southwark'],
      commonIssues: ['tube delays', 'traffic', 'weather', 'air quality', 'construction']
    },
    tokyo: {
      zones: ['Shibuya', 'Shinjuku', 'Harajuku', 'Ginza', 'Asakusa', 'Roppongi', 'Akihabara', 'Ueno'],
      commonIssues: ['crowding', 'weather', 'air quality', 'transportation', 'construction']
    },
    paris: {
      zones: ['Le Marais', 'Montmartre', 'Saint-Germain', 'Champs-Élysées'],
      commonIssues: ['metro delays', 'traffic', 'weather', 'air quality', 'protests']
    }
  }

  const generateAlerts = () => {
    const cityData = cityAlertData[selectedCity as keyof typeof cityAlertData] || cityAlertData.nyc
    const newAlerts: Alert[] = []
    
    const alertTypes: Array<{ type: Alert['type']; title: string; description: string }> = [
      {
        type: 'mood_drop',
        title: 'Significant Mood Decline Detected',
        description: 'Urban sentiment analysis shows notable decrease in positive emotions'
      },
      {
        type: 'traffic_congestion',
        title: 'Traffic Congestion Alert',
        description: 'Heavy traffic detected in multiple zones affecting commute times'
      },
      {
        type: 'weather_warning',
        title: 'Weather Warning Issued',
        description: 'Severe weather conditions expected to impact city operations'
      },
      {
        type: 'social_unrest',
        title: 'Social Unrest Indicators',
        description: 'Increased negative sentiment and social media activity detected'
      },
      {
        type: 'infrastructure',
        title: 'Infrastructure Issue Reported',
        description: 'Critical infrastructure problems affecting multiple zones'
      },
      {
        type: 'environmental',
        title: 'Environmental Alert',
        description: 'Environmental conditions requiring immediate attention'
      }
    ]

    for (let i = 0; i < 8; i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const severity = Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      const zone = cityData.zones[Math.floor(Math.random() * cityData.zones.length)]
      const status = Math.random() > 0.7 ? 'acknowledged' : Math.random() > 0.5 ? 'resolved' : 'active'
      
      newAlerts.push({
        id: `alert-${selectedCity}-${i}`,
        type: alertType.type,
        severity,
        title: alertType.title,
        description: alertType.description,
        zone,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        status,
        moodImpact: Math.floor(Math.random() * 30) + 5,
        affectedPopulation: Math.floor(Math.random() * 50000) + 1000
      })
    }
    
    setAlerts(newAlerts.sort((a, b) => {
      // Sort by severity first, then by timestamp
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }))
  }

  useEffect(() => {
    generateAlerts()
    const interval = setInterval(generateAlerts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [selectedCity]) // Regenerate when city changes

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'mood_drop': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'traffic_congestion': return <MapPin className="w-5 h-5 text-orange-500" />
      case 'weather_warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'social_unrest': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'infrastructure': return <AlertTriangle className="w-5 h-5 text-blue-500" />
      case 'environmental': return <AlertTriangle className="w-5 h-5 text-green-500" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const handleStatusChange = (alertId: string, newStatus: Alert['status']) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ))
  }

  const exportReport = (format: 'csv' | 'json') => {
    const data = alerts.map(alert => ({
      ID: alert.id,
      Type: alert.type,
      Severity: alert.severity,
      Title: alert.title,
      Description: alert.description,
      Zone: alert.zone,
      Timestamp: alert.timestamp,
      Status: alert.status,
      'Mood Impact': alert.moodImpact,
      'Affected Population': alert.affectedPopulation
    }))

    if (format === 'csv') {
      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedCity}_alerts_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedCity}_alerts_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const activeAlerts = alerts.filter(alert => alert.status === 'active')
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged')
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved')

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Real-Time Alerts</h3>
            <p className="text-sm text-gray-600">Live monitoring and alert system for {cityAlertData[selectedCity as keyof typeof cityAlertData]?.zones.join(', ')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 font-medium">{activeAlerts.length} Active</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAllAlerts(!showAllAlerts)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>{showAllAlerts ? 'Hide All Alerts' : 'View All Alerts'}</span>
          </button>
          
          <button
            onClick={() => exportReport('csv')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => exportReport('json')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          
          <button
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            <span>Configure Thresholds</span>
          </button>
        </div>
      </div>

      {/* Threshold Configuration */}
      {showThresholdConfig && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Alert Thresholds Configuration</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(thresholds).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-blue-800 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setThresholds(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-blue-600">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
        {activeAlerts.map(alert => (
          <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{alert.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{alert.zone}</span>
                    </span>
                    <span>Mood Impact: {alert.moodImpact}</span>
                    <span>Population: {alert.affectedPopulation.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusChange(alert.id, 'acknowledged')}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Acknowledge</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(alert.id, 'resolved')}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Resolve</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-200/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">{activeAlerts.length}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">{acknowledgedAlerts.length}</div>
            <div className="text-xs text-gray-600">Acknowledged</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{resolvedAlerts.length}</div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  )
}
