from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CityZone, EmotionAnalysis, EnvironmentalData
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import pytz
from typing import List, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

router = APIRouter()

class AnomalyDetector:
    """Anomaly detection using Isolation Forest"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = IsolationForest(contamination=0.1, random_state=42)
    
    def detect_mood_anomalies(self, mood_data: List[float], threshold: float = 2.0) -> List[bool]:
        """Detect anomalies in mood index data using z-score method"""
        if len(mood_data) < 3:
            return [False] * len(mood_data)
        
        # Calculate z-scores
        mean_mood = np.mean(mood_data)
        std_mood = np.std(mood_data)
        
        if std_mood == 0:
            return [False] * len(mood_data)
        
        z_scores = [(mood - mean_mood) / std_mood for mood in mood_data]
        
        # Mark as anomaly if z-score exceeds threshold
        anomalies = [abs(z_score) > threshold for z_score in z_scores]
        
        return anomalies
    
    def detect_environmental_anomalies(self, env_data: List[float], data_type: str) -> List[bool]:
        """Detect anomalies in environmental data"""
        if len(env_data) < 3:
            return [False] * len(env_data)
        
        # Define thresholds for different environmental parameters
        thresholds = {
            'air_quality': {
                'pm25': (0, 150),      # μg/m³ - EPA standards
                'pm10': (0, 150),      # μg/m³ - EPA standards
                'o3': (0, 70),         # ppb - EPA 8-hour standard
                'no2': (0, 100),       # ppb - EPA 1-hour standard
                'co': (0, 9),          # ppm - EPA 8-hour standard
                'so2': (0, 75)         # ppb - EPA 1-hour standard
            },
            'weather': {
                'temperature': (-20, 45),  # °C - reasonable range
                'humidity': (0, 100),      # % - valid range
                'pressure': (900, 1100),   # hPa - reasonable range
                'wind_speed': (0, 50),     # m/s - reasonable range
                'visibility': (0, 50)      # km - reasonable range
            },
            'noise': {
                'db_level': (30, 120)     # dB - reasonable range
            }
        }
        
        # Get thresholds for this data type
        param_thresholds = thresholds.get(data_type, {})
        if not param_thresholds:
            return [False] * len(env_data)
        
        # For now, use simple range checking
        # In a real implementation, you might use more sophisticated methods
        anomalies = []
        for value in env_data:
            is_anomaly = False
            for param, (min_val, max_val) in param_thresholds.items():
                if value < min_val or value > max_val:
                    is_anomaly = True
                    break
            anomalies.append(is_anomaly)
        
        return anomalies

# Global anomaly detector instance
anomaly_detector = AnomalyDetector()

@router.get("/mood-anomalies")
async def get_mood_anomalies(
    zone_id: int = None,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get mood index anomalies for zones"""
    try:
        # Calculate time range
        now = datetime.now(pytz.UTC)
        start_time = now - timedelta(hours=hours)
        
        # Build query
        query = db.query(EmotionAnalysis).filter(
            EmotionAnalysis.created_at >= start_time
        )
        
        if zone_id:
            query = query.filter(EmotionAnalysis.zone_id == zone_id)
        
        emotion_data = query.order_by(EmotionAnalysis.created_at).all()
        
        if not emotion_data:
            return {
                'anomalies': [],
                'total_data_points': 0,
                'anomaly_count': 0,
                'period_hours': hours
            }
        
        # Group by zone and hour
        zone_hourly_data = {}
        for emotion in emotion_data:
            zone_id = emotion.zone_id
            hour_key = emotion.created_at.replace(minute=0, second=0, microsecond=0)
            
            if zone_id not in zone_hourly_data:
                zone_hourly_data[zone_id] = {}
            
            if hour_key not in zone_hourly_data[zone_id]:
                zone_hourly_data[zone_id][hour_key] = []
            
            zone_hourly_data[zone_id][hour_key].append(float(emotion.mood_index))
        
        # Detect anomalies for each zone
        anomalies = []
        total_points = 0
        anomaly_count = 0
        
        for zone_id, hourly_data in zone_hourly_data.items():
            zone = db.query(CityZone).filter(CityZone.id == zone_id).first()
            if not zone:
                continue
            
            for hour, mood_indices in sorted(hourly_data.items()):
                total_points += len(mood_indices)
                
                # Calculate average mood for this hour
                avg_mood = sum(mood_indices) / len(mood_indices)
                
                # Detect anomalies
                anomaly_flags = anomaly_detector.detect_mood_anomalies(mood_indices)
                is_anomaly = any(anomaly_flags)
                
                if is_anomaly:
                    anomaly_count += 1
                    anomalies.append({
                        'zone_id': zone_id,
                        'zone_name': zone.name,
                        'timestamp': hour.isoformat(),
                        'mood_index': round(avg_mood, 2),
                        'data_points': len(mood_indices),
                        'anomaly_type': 'mood_spike',
                        'severity': 'medium' if len([f for f in anomaly_flags if f]) > len(anomaly_flags) * 0.5 else 'low'
                    })
        
        return {
            'anomalies': anomalies,
            'total_data_points': total_points,
            'anomaly_count': anomaly_count,
            'period_hours': hours,
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting mood anomalies: {str(e)}")

@router.get("/environmental-anomalies")
async def get_environmental_anomalies(
    zone_id: int = None,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get environmental data anomalies"""
    try:
        # Calculate time range
        now = datetime.now(pytz.UTC)
        start_time = now - timedelta(hours=hours)
        
        # Build query
        query = db.query(EnvironmentalData).filter(
            EnvironmentalData.created_at >= start_time
        )
        
        if zone_id:
            query = query.filter(EnvironmentalData.zone_id == zone_id)
        
        env_data = query.order_by(EnvironmentalData.created_at).all()
        
        if not env_data:
            return {
                'anomalies': [],
                'total_data_points': 0,
                'anomaly_count': 0,
                'period_hours': hours
            }
        
        # Group by zone, data type, and hour
        grouped_data = {}
        for data_point in env_data:
            zone_id = data_point.zone_id
            data_type = data_point.data_type
            hour_key = data_point.created_at.replace(minute=0, second=0, microsecond=0)
            
            if zone_id not in grouped_data:
                grouped_data[zone_id] = {}
            
            if data_type not in grouped_data[zone_id]:
                grouped_data[zone_id][data_type] = {}
            
            if hour_key not in grouped_data[zone_id][data_type]:
                grouped_data[zone_id][data_type][hour_key] = []
            
            grouped_data[zone_id][data_type][hour_key].append(float(data_point.value))
        
        # Detect anomalies
        anomalies = []
        total_points = 0
        anomaly_count = 0
        
        for zone_id, data_types in grouped_data.items():
            zone = db.query(CityZone).filter(CityZone.id == zone_id).first()
            if not zone:
                continue
            
            for data_type, hourly_data in data_types.items():
                for hour, values in sorted(hourly_data.items()):
                    total_points += len(values)
                    
                    # Calculate average value for this hour
                    avg_value = sum(values) / len(values)
                    
                    # Detect anomalies
                    anomaly_flags = anomaly_detector.detect_environmental_anomalies(values, data_type)
                    is_anomaly = any(anomaly_flags)
                    
                    if is_anomaly:
                        anomaly_count += 1
                        anomalies.append({
                            'zone_id': zone_id,
                            'zone_name': zone.name,
                            'data_type': data_type,
                            'timestamp': hour.isoformat(),
                            'average_value': round(avg_value, 2),
                            'data_points': len(values),
                            'anomaly_type': 'environmental_threshold_exceeded',
                            'severity': 'high' if len([f for f in anomaly_flags if f]) > len(anomaly_flags) * 0.7 else 'medium'
                        })
        
        return {
            'anomalies': anomalies,
            'total_data_points': total_points,
            'anomaly_count': anomaly_count,
            'period_hours': hours,
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting environmental anomalies: {str(e)}")

@router.get("/summary")
async def get_alerts_summary(
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get summary of all alerts and anomalies"""
    try:
        # Get mood anomalies
        mood_anomalies = await get_mood_anomalies(hours=hours, db=db)
        
        # Get environmental anomalies
        env_anomalies = await get_environmental_anomalies(hours=hours, db=db)
        
        # Calculate severity distribution
        severity_counts = {
            'low': 0,
            'medium': 0,
            'high': 0
        }
        
        for anomaly in mood_anomalies['anomalies'] + env_anomalies['anomalies']:
            severity_counts[anomaly['severity']] += 1
        
        # Get zones with most anomalies
        zone_anomaly_counts = {}
        for anomaly in mood_anomalies['anomalies'] + env_anomalies['anomalies']:
            zone_name = anomaly['zone_name']
            zone_anomaly_counts[zone_name] = zone_anomaly_counts.get(zone_name, 0) + 1
        
        # Sort zones by anomaly count
        top_zones = sorted(zone_anomaly_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'summary': {
                'total_anomalies': mood_anomalies['anomaly_count'] + env_anomalies['anomaly_count'],
                'mood_anomalies': mood_anomalies['anomaly_count'],
                'environmental_anomalies': env_anomalies['anomaly_count'],
                'severity_distribution': severity_counts,
                'top_anomaly_zones': top_zones
            },
            'period_hours': hours,
            'timestamp': datetime.now(pytz.UTC).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting alerts summary: {str(e)}")
