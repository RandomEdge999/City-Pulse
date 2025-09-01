import { useState, useEffect } from 'react'
import { MessageSquare, TrendingUp, TrendingDown, Clock, User, Hash, ExternalLink } from 'lucide-react'

interface NewsPost {
  id: string
  content: string
  author: string
  platform: 'twitter' | 'reddit' | 'instagram' | 'news'
  timestamp: string
  sentiment: 'positive' | 'negative' | 'neutral'
  moodImpact: number
  engagement: number
  hashtags: string[]
  zone: string
  url?: string
}

interface NewsFeedProps {
  selectedCity: string
}

export default function NewsFeed({ selectedCity }: NewsFeedProps): JSX.Element {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitter' | 'reddit' | 'instagram' | 'news'>('all')

  // City-specific news data
  const cityNewsData = {
    nyc: {
      zones: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
      topics: ['finance', 'culture', 'politics', 'entertainment', 'business'],
      hashtags: ['#NYC', '#Manhattan', '#Brooklyn', '#Queens', '#Bronx', '#StatenIsland']
    },
    london: {
      zones: ['Westminster', 'Camden', 'Greenwich', 'Hackney', 'Islington', 'Southwark'],
      topics: ['royalty', 'finance', 'culture', 'politics', 'arts', 'business'],
      hashtags: ['#London', '#Westminster', '#Camden', '#Greenwich', '#Hackney', '#Islington', '#Southwark']
    },
    tokyo: {
      zones: ['Shibuya', 'Shinjuku', 'Harajuku', 'Ginza', 'Asakusa', 'Roppongi', 'Akihabara', 'Ueno'],
      topics: ['technology', 'anime', 'fashion', 'food', 'culture', 'business'],
      hashtags: ['#Tokyo', '#Shibuya', '#Shinjuku', '#Harajuku', '#Ginza', '#Asakusa', '#Roppongi', '#Akihabara', '#Ueno']
    },
    paris: {
      zones: ['Le Marais', 'Montmartre', 'Saint-Germain', 'Champs-Élysées'],
      topics: ['fashion', 'art', 'food', 'culture', 'politics', 'tourism'],
      hashtags: ['#Paris', '#LeMarais', '#Montmartre', '#SaintGermain', '#ChampsElysees']
    }
  }

  const generatePosts = () => {
    const cityData = cityNewsData[selectedCity as keyof typeof cityNewsData] || cityNewsData.nyc
    const newPosts: NewsPost[] = []
    
    const sampleContent = [
      `Just experienced the amazing energy in ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]}! The vibe here is incredible 🎉`,
      `Can't believe how beautiful ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]} looks today. Perfect weather for exploring! ☀️`,
      `The food scene in ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]} is absolutely mind-blowing. Best meal I've had in months! 🍽️`,
      `Love how ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]} combines history with modern innovation. Such a unique place! 🏛️`,
      `The people in ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]} are so friendly and welcoming. Makes me feel right at home! ❤️`,
      `Exploring ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]} today and discovering so many hidden gems. This city never ceases to amaze! ✨`,
      `The architecture in ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]} is absolutely stunning. Every building tells a story! 🏗️`,
      `Just had the most amazing cultural experience in ${cityData.zones[Math.floor(Math.random() * cityData.zones.length)]}. This city is a treasure! 🎭`
    ]

    for (let i = 0; i < 15; i++) {
      const platform = ['twitter', 'reddit', 'instagram', 'news'][Math.floor(Math.random() * 4)] as NewsPost['platform']
      const sentiment = Math.random() > 0.7 ? 'positive' : Math.random() > 0.4 ? 'neutral' : 'negative'
      const content = sampleContent[Math.floor(Math.random() * sampleContent.length)]
      const zone = cityData.zones[Math.floor(Math.random() * cityData.zones.length)]
      
      newPosts.push({
        id: `post-${selectedCity}-${i}`,
        content,
        author: `user_${Math.floor(Math.random() * 1000)}`,
        platform,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        sentiment,
        moodImpact: Math.floor(Math.random() * 20) + 1,
        engagement: Math.floor(Math.random() * 1000) + 10,
        hashtags: cityData.hashtags.slice(0, Math.floor(Math.random() * 3) + 1),
        zone,
        url: Math.random() > 0.5 ? `https://${platform}.com/post/${i}` : undefined
      })
    }
    
    setPosts(newPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
  }

  useEffect(() => {
    generatePosts()
    const interval = setInterval(generatePosts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [selectedCity]) // Regenerate when city changes

  const getSentimentColor = (sentiment: NewsPost['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      case 'neutral': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPlatformIcon = (platform: NewsPost['platform']) => {
    switch (platform) {
      case 'twitter': return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'reddit': return <MessageSquare className="w-4 h-4 text-orange-500" />
      case 'instagram': return <MessageSquare className="w-4 h-4 text-pink-500" />
      case 'news': return <MessageSquare className="w-4 h-4 text-green-500" />
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getPlatformName = (platform: NewsPost['platform'] | 'all') => {
    switch (platform) {
      case 'twitter': return 'Twitter'
      case 'reddit': return 'Reddit'
      case 'instagram': return 'Instagram'
      case 'news': return 'News'
      case 'all': return 'All'
      default: return platform
    }
  }

  const filteredPosts = posts.filter(post => {
    if (selectedFilter !== 'all' && post.sentiment !== selectedFilter) return false
    if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) return false
    return true
  })

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Real-Time News Feed</h3>
            <p className="text-sm text-gray-600">Live social media and news updates from {cityNewsData[selectedCity as keyof typeof cityNewsData]?.zones.join(', ')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Live</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Sentiment Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sentiment:</span>
            {(['all', 'positive', 'negative', 'neutral'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Platform:</span>
            {(['all', 'twitter', 'reddit', 'instagram', 'news'] as const).map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getPlatformName(platform)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-h-96 overflow-y-auto">
        {filteredPosts.map(post => (
          <div key={post.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getPlatformIcon(post.platform)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">{post.author}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{getPlatformName(post.platform)}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{post.zone}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                  </span>
                </div>
                
                <p className="text-gray-800 mb-3 leading-relaxed">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Sentiment Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(post.sentiment)}`}>
                      {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)}
                    </span>
                    
                    {/* Mood Impact */}
                    <div className="flex items-center space-x-1">
                      {post.moodImpact > 10 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-600">Mood: {post.moodImpact}</span>
                    </div>
                    
                    {/* Engagement */}
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">💬 {post.engagement}</span>
                    </div>
                  </div>
                  
                  {/* Hashtags */}
                  <div className="flex items-center space-x-2">
                    {post.hashtags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {post.hashtags.length > 2 && (
                      <span className="text-xs text-gray-500">+{post.hashtags.length - 2}</span>
                    )}
                  </div>
                </div>
                
                {/* External Link */}
                {post.url && (
                  <div className="mt-3">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View on {getPlatformName(post.platform)}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-200/50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredPosts.length} of {posts.length} posts</span>
          <span>Auto-refresh every minute</span>
        </div>
      </div>
    </div>
  )
}
