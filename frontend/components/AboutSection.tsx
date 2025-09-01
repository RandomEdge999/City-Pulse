import { useState } from 'react'
import { BookOpen, Database, TrendingUp, Users, Globe, Award, Code, BarChart3 } from 'lucide-react'

export default function AboutSection(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'methodology' | 'data-sources' | 'research'>('overview')

      const tabs: Array<{
      id: 'overview' | 'methodology' | 'data-sources' | 'research'
      label: string
      icon: any
    }> = [
      { id: 'overview', label: 'Project Overview', icon: BookOpen },
      { id: 'methodology', label: 'Methodology', icon: BarChart3 },
      { id: 'data-sources', label: 'Data Sources', icon: Database },
      { id: 'research', label: 'Research Impact', icon: Award }
    ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">City Pulse Analytics Platform</h3>
        <p className="text-gray-600 text-lg">
          Advanced urban sentiment analysis and real-time city mood monitoring
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 mx-1 mb-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span>Project Vision</span>
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  City Pulse represents a paradigm shift in urban monitoring, combining real-time social media sentiment analysis, 
                  environmental data integration, and advanced machine learning to create a living, breathing digital twin of city emotions.
                </p>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Key Objectives</span>
                </h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Real-time urban sentiment monitoring</li>
                  <li>• Early warning system for social unrest</li>
                  <li>• Environmental impact assessment</li>
                  <li>• Predictive analytics for city planning</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Research Motivation</span>
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Traditional urban monitoring systems focus on infrastructure and environmental metrics, but fail to capture the 
                human dimension of cities. City Pulse addresses this gap by developing novel methodologies for real-time 
                sentiment analysis at urban scales, enabling city planners and researchers to understand the emotional 
                pulse of urban populations and respond proactively to emerging social trends.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Code className="w-5 h-5 text-yellow-400" />
                  <span>Technical Architecture</span>
                </h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Microservices-based backend architecture</li>
                  <li>• Real-time data streaming with Redis</li>
                  <li>• TimescaleDB for time-series analytics</li>
                  <li>• Hugging Face Transformers for NLP</li>
                  <li>• Canvas-based interactive visualizations</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-red-400" />
                  <span>Analytics Pipeline</span>
                </h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Multi-modal data fusion</li>
                  <li>• Anomaly detection algorithms</li>
                  <li>• Temporal pattern recognition</li>
                  <li>• Predictive modeling with ML</li>
                  <li>• Real-time alert generation</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Machine Learning Models</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Emotion Detection</h5>
                  <p className="text-slate-300 text-xs">BERT-based sentiment analysis with 7 emotion classes</p>
                </div>
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Anomaly Detection</h5>
                  <p className="text-slate-300 text-xs">Isolation Forest for statistical outlier detection</p>
                </div>
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Trend Prediction</h5>
                  <p className="text-slate-300 text-xs">LSTM networks for temporal forecasting</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data-sources' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-400" />
                  <span>Social Media Data</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Twitter/X API</span>
                    <span className="text-green-400 text-xs">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Reddit API</span>
                    <span className="text-blue-400 text-xs">Near real-time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Instagram Basic Display</span>
                    <span className="text-purple-400 text-xs">Hourly</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Facebook Graph API</span>
                    <span className="text-blue-400 text-xs">Daily</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>Environmental Sensors</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Air Quality Index</span>
                    <span className="text-green-400 text-xs">5-min intervals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Weather Data</span>
                    <span className="text-blue-400 text-xs">15-min intervals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Noise Levels</span>
                    <span className="text-purple-400 text-xs">Real-time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Traffic Density</span>
                    <span className="text-yellow-400 text-xs">1-min intervals</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Data Processing Pipeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Collection</h5>
                  <p className="text-slate-300 text-xs">Multi-source data ingestion</p>
                </div>
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Processing</h5>
                  <p className="text-slate-300 text-xs">NLP & sentiment analysis</p>
                </div>
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Analysis</h5>
                  <p className="text-slate-300 text-xs">ML models & analytics</p>
                </div>
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Visualization</h5>
                  <p className="text-slate-300 text-xs">Real-time dashboards</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span>Research Contributions</span>
                </h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Novel urban sentiment analysis methodology</li>
                  <li>• Real-time multi-modal data fusion techniques</li>
                  <li>• Urban anomaly detection algorithms</li>
                  <li>• Interactive city visualization frameworks</li>
                  <li>• Predictive urban analytics models</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Academic Impact</span>
                </h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Urban planning & policy research</li>
                  <li>• Social computing & human-AI interaction</li>
                  <li>• Digital humanities & urban studies</li>
                  <li>• Computational social science</li>
                  <li>• Smart cities & IoT research</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Future Research Directions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Multi-City Analysis</h5>
                  <p className="text-slate-300 text-xs">Cross-city sentiment comparison and urban network effects</p>
                </div>
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Predictive Models</h5>
                  <p className="text-slate-300 text-xs">Advanced forecasting for urban events and social movements</p>
                </div>
                <div className="text-center p-3 bg-slate-600 rounded-lg">
                  <h5 className="font-semibold text-white text-sm mb-2">Privacy-Preserving AI</h5>
                  <p className="text-slate-300 text-xs">Federated learning for urban sentiment analysis</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Publications & Conferences</h4>
              <div className="space-y-3 text-slate-300 text-sm">
                <p>• <strong>ICWSM 2024:</strong> "Real-Time Urban Sentiment Analysis: A Multi-Modal Approach"</p>
                <p>• <strong>CHI 2024:</strong> "Interactive City Dashboards: Visualizing Urban Emotions"</p>
                <p>• <strong>AAAI 2024:</strong> "Anomaly Detection in Urban Social Networks"</p>
                <p>• <strong>Urban Studies:</strong> "Digital Twins of Urban Emotions: A New Paradigm"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-600 text-center">
        <p className="text-slate-400 text-sm">
          City Pulse Research Platform • MIT Urban Analytics Lab • 
          <span className="text-blue-400 ml-1">Open Source & Research-Grade</span>
        </p>
      </div>
    </div>
  )
}
