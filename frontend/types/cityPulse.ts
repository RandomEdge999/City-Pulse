export interface ZoneData {
  zone_id: number
  zone_name: string
  center_lat: number
  center_lon: number
  current_mood_index: number
  post_count: number
  dominant_emotion: string
  last_updated: string
}

export interface CityPulseData {
  city_mood_index: number
  total_zones: number
  zones: ZoneData[]
  timestamp: string
}

export interface SocialPost {
  id: number
  content: string
  source: string
  zone_id: number
  lat: number | null
  lon: number | null
  created_at: string
  emotion_analysis: {
    mood_index: number
    dominant_emotion: string
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
    neutral: number
  }
}

export interface ZoneDetailsData {
  zone: {
    id: number
    name: string
    center_lat: number
    center_lon: number
  }
  current_status: {
    mood_index: number
    post_count: number
    dominant_emotion: string
    last_updated: string
  }
  emotion_breakdown: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
    neutral: number
  }
  environmental_data: Record<string, {
    average_value: number
    count: number
    unit: string
  }>
  timestamp: string
}

export interface TimeSeriesPoint {
  timestamp: string
  mood_index: number
  post_count: number
  dominant_emotion: string
  emotion_breakdown: Record<string, number>
}

export interface ZoneTimeSeries {
  zone_id: number
  zone_name: string
  time_series: TimeSeriesPoint[]
  period_hours: number
  data_points: number
  timestamp: string
}

export interface ForecastPoint {
  timestamp: string
  predicted_mood_index: number
  confidence: number
}

export interface ZoneForecast {
  zone_id: number
  zone_name: string
  historical_data_points: number
  forecast_hours: number
  forecast: ForecastPoint[]
  generated_at: string
}

export interface Anomaly {
  zone_id: number
  zone_name: string
  timestamp: string
  mood_index?: number
  average_value?: number
  data_type?: string
  data_points: number
  anomaly_type: string
  severity: 'low' | 'medium' | 'high'
}

export interface AnomalyData {
  anomalies: Anomaly[]
  total_data_points: number
  anomaly_count: number
  period_hours: number
  timestamp: string
}

export interface AlertsSummary {
  summary: {
    total_anomalies: number
    mood_anomalies: number
    environmental_anomalies: number
    severity_distribution: {
      low: number
      medium: number
      high: number
    }
    top_anomaly_zones: [string, number][]
  }
  period_hours: number
  timestamp: string
}
