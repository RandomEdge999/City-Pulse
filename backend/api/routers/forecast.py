from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CityZone, EmotionAnalysis
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import pytz
from typing import List, Dict, Any
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

router = APIRouter()

class SimpleForecaster:
    """Simple forecasting using linear regression on recent trends"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = LinearRegression()
    
    def prepare_features(self, time_series_data: List[Dict]) -> tuple:
        """Prepare features for forecasting"""
        if len(time_series_data) < 3:
            return None, None
        
        # Extract mood indices and create time features
        mood_indices = [point['mood_index'] for point in time_series_data]
        timestamps = [datetime.fromisoformat(point['timestamp'].replace('Z', '+00:00')) for point in time_series_data]
        
        # Create time-based features
        base_time = timestamps[0]
        time_features = []
        for ts in timestamps:
            hours_since_base = (ts - base_time).total_seconds() / 3600
            time_features.append([hours_since_base])
        
        # Create lag features (previous values)
        lag_features = []
        for i in range(len(mood_indices)):
            if i == 0:
                lag_features.append([mood_indices[0]])
            else:
                lag_features.append([mood_indices[i-1]])
        
        # Combine features
        X = np.hstack([time_features, lag_features])
        y = np.array(mood_indices)
        
        return X, y
    
    def forecast(self, time_series_data: List[Dict], hours_ahead: int = 24) -> List[Dict]:
        """Generate forecast for the next N hours"""
        try:
            X, y = self.prepare_features(time_series_data)
            if X is None or len(X) < 3:
                # Not enough data, return simple trend
                return self._simple_trend_forecast(time_series_data, hours_ahead)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            
            # Generate future time points
            last_timestamp = datetime.fromisoformat(time_series_data[-1]['timestamp'].replace('Z', '+00:00'))
            base_timestamp = datetime.fromisoformat(time_series_data[0]['timestamp'].replace('Z', '+00:00'))
            
            forecasts = []
            for hour in range(1, hours_ahead + 1):
                future_time = last_timestamp + timedelta(hours=hour)
                hours_since_base = (future_time - base_timestamp).total_seconds() / 3600
                
                # Create feature vector for this future time
                last_mood = time_series_data[-1]['mood_index']
                future_X = np.array([[hours_since_base, last_mood]])
                future_X_scaled = self.scaler.transform(future_X)
                
                # Predict
                predicted_mood = self.model.predict(future_X_scaled)[0]
                
                # Ensure prediction is within valid range
                predicted_mood = max(0, min(100, predicted_mood))
                
                forecasts.append({
                    'timestamp': future_time.isoformat(),
                    'predicted_mood_index': round(predicted_mood, 2),
                    'confidence': 0.7  # Simple confidence score
                })
            
            return forecasts
            
        except Exception as e:
            # Fallback to simple trend
            return self._simple_trend_forecast(time_series_data, hours_ahead)
    
    def _simple_trend_forecast(self, time_series_data: List[Dict], hours_ahead: int) -> List[Dict]:
        """Simple trend-based forecast when ML model fails"""
        if len(time_series_data) < 2:
            return []
        
        # Calculate simple trend
        recent_moods = [point['mood_index'] for point in time_series_data[-3:]]
        if len(recent_moods) >= 2:
            trend = (recent_moods[-1] - recent_moods[0]) / (len(recent_moods) - 1)
        else:
            trend = 0
        
        # Generate forecasts
        last_timestamp = datetime.fromisoformat(time_series_data[-1]['timestamp'].replace('Z', '+00:00'))
        last_mood = time_series_data[-1]['mood_index']
        
        forecasts = []
        for hour in range(1, hours_ahead + 1):
            future_time = last_timestamp + timedelta(hours=hour)
            predicted_mood = last_mood + (trend * hour)
            predicted_mood = max(0, min(100, predicted_mood))
            
            forecasts.append({
                'timestamp': future_time.isoformat(),
                'predicted_mood_index': round(predicted_mood, 2),
                'confidence': 0.5  # Lower confidence for simple trend
            })
        
        return forecasts

# Global forecaster instance
forecaster = SimpleForecaster()

@router.get("/zone/{zone_id}")
async def get_zone_forecast(
    zone_id: int,
    hours_ahead: int = 24,
    db: Session = Depends(get_db)
):
    """Get mood index forecast for a specific zone"""
    try:
        zone = db.query(CityZone).filter(CityZone.id == zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        
        # Get historical data for forecasting (last 7 days)
        start_time = datetime.now(pytz.UTC) - timedelta(days=7)
        
        emotion_data = db.query(EmotionAnalysis).filter(
            EmotionAnalysis.zone_id == zone_id,
            EmotionAnalysis.created_at >= start_time
        ).order_by(EmotionAnalysis.created_at).all()
        
        if not emotion_data:
            raise HTTPException(status_code=400, detail="Insufficient data for forecasting")
        
        # Group by hour and calculate averages
        hourly_data = {}
        for emotion in emotion_data:
            hour_key = emotion.created_at.replace(minute=0, second=0, microsecond=0)
            if hour_key not in hourly_data:
                hourly_data[hour_key] = []
            hourly_data[hour_key].append(float(emotion.mood_index))
        
        # Convert to time series format
        time_series = []
        for hour, mood_indices in sorted(hourly_data.items()):
            avg_mood = sum(mood_indices) / len(mood_indices)
            time_series.append({
                'timestamp': hour.isoformat(),
                'mood_index': round(avg_mood, 2)
            })
        
        # Generate forecast
        forecast = forecaster.forecast(time_series, hours_ahead)
        
        return {
            'zone_id': zone_id,
            'zone_name': zone.name,
            'historical_data_points': len(time_series),
            'forecast_hours': hours_ahead,
            'forecast': forecast,
            'generated_at': datetime.now(pytz.UTC).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")

@router.get("/city")
async def get_city_forecast(
    hours_ahead: int = 24,
    db: Session = Depends(get_db)
):
    """Get city-wide mood index forecast"""
    try:
        # Get all zones
        zones = db.query(CityZone).all()
        if not zones:
            raise HTTPException(status_code=404, detail="No zones found")
        
        # Get forecast for each zone
        zone_forecasts = {}
        city_forecast = []
        
        for zone in zones:
            try:
                # Get zone forecast
                start_time = datetime.now(pytz.UTC) - timedelta(days=7)
                emotion_data = db.query(EmotionAnalysis).filter(
                    EmotionAnalysis.zone_id == zone.id,
                    EmotionAnalysis.created_at >= start_time
                ).order_by(EmotionAnalysis.created_at).all()
                
                if emotion_data:
                    # Group by hour
                    hourly_data = {}
                    for emotion in emotion_data:
                        hour_key = emotion.created_at.replace(minute=0, second=0, microsecond=0)
                        if hour_key not in hourly_data:
                            hourly_data[hour_key] = []
                        hourly_data[hour_key].append(float(emotion.mood_index))
                    
                    # Convert to time series
                    time_series = []
                    for hour, mood_indices in sorted(hourly_data.items()):
                        avg_mood = sum(mood_indices) / len(mood_indices)
                        time_series.append({
                            'timestamp': hour.isoformat(),
                            'mood_index': round(avg_mood, 2)
                        })
                    
                    # Generate forecast for this zone
                    zone_forecast = forecaster.forecast(time_series, hours_ahead)
                    zone_forecasts[zone.id] = zone_forecast
                    
                    # Add to city forecast
                    for i, forecast_point in enumerate(zone_forecast):
                        if i >= len(city_forecast):
                            city_forecast.append({
                                'timestamp': forecast_point['timestamp'],
                                'zone_moods': {},
                                'city_average': 0.0
                            })
                        
                        city_forecast[i]['zone_moods'][zone.id] = forecast_point['predicted_mood_index']
            except Exception as e:
                # Skip zones with errors, continue with others
                continue
        
        # Calculate city averages
        for forecast_point in city_forecast:
            if forecast_point['zone_moods']:
                avg_mood = sum(forecast_point['zone_moods'].values()) / len(forecast_point['zone_moods'])
                forecast_point['city_average'] = round(avg_mood, 2)
        
        return {
            'forecast_hours': hours_ahead,
            'total_zones': len(zones),
            'zones_with_data': len(zone_forecasts),
            'city_forecast': city_forecast,
            'zone_forecasts': zone_forecasts,
            'generated_at': datetime.now(pytz.UTC).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating city forecast: {str(e)}")
