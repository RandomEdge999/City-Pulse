from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CityZone, EmotionAnalysis, EnvironmentalData
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import pytz
from typing import List, Dict, Any

router = APIRouter()

@router.get("/{zone_id}")
async def get_zone_details(zone_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific zone"""
    try:
        zone = db.query(CityZone).filter(CityZone.id == zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        
        # Get current timestamp
        now = datetime.now(pytz.UTC)
        one_hour_ago = now - timedelta(hours=1)
        
        # Get recent emotion analysis for this zone
        recent_emotions = db.query(EmotionAnalysis).filter(
            EmotionAnalysis.zone_id == zone_id,
            EmotionAnalysis.created_at >= one_hour_ago
        ).all()
        
        # Calculate zone statistics
        if recent_emotions:
            avg_mood = sum(float(e.mood_index) for e in recent_emotions) / len(recent_emotions)
            post_count = len(recent_emotions)
            
            # Emotion breakdown
            emotion_breakdown = {
                'joy': sum(float(e.joy) for e in recent_emotions) / len(recent_emotions),
                'sadness': sum(float(e.sadness) for e in recent_emotions) / len(recent_emotions),
                'anger': sum(float(e.anger) for e in recent_emotions) / len(recent_emotions),
                'fear': sum(float(e.fear) for e in recent_emotions) / len(recent_emotions),
                'surprise': sum(float(e.surprise) for e in recent_emotions) / len(recent_emotions),
                'disgust': sum(float(e.disgust) for e in recent_emotions) / len(recent_emotions),
                'neutral': sum(float(e.neutral) for e in recent_emotions) / len(recent_emotions)
            }
            
            # Dominant emotion
            emotion_counts = {}
            for emotion in recent_emotions:
                dominant = emotion.dominant_emotion
                emotion_counts[dominant] = emotion_counts.get(dominant, 0) + 1
            
            dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else 'neutral'
        else:
            avg_mood = 50.0
            post_count = 0
            emotion_breakdown = {
                'joy': 0.0, 'sadness': 0.0, 'anger': 0.0, 'fear': 0.0,
                'surprise': 0.0, 'disgust': 0.0, 'neutral': 1.0
            }
            dominant_emotion = 'neutral'
        
        # Get recent environmental data
        recent_env_data = db.query(EnvironmentalData).filter(
            EnvironmentalData.zone_id == zone_id,
            EnvironmentalData.created_at >= one_hour_ago
        ).all()
        
        # Group environmental data by type
        env_summary = {}
        for data_point in recent_env_data:
            data_type = data_point.data_type
            if data_type not in env_summary:
                env_summary[data_type] = []
            env_summary[data_type].append(float(data_point.value))
        
        # Calculate environmental averages
        env_overview = {}
        for data_type, values in env_summary.items():
            env_overview[data_type] = {
                'average_value': round(sum(values) / len(values), 2),
                'count': len(values),
                'unit': recent_env_data[0].unit if recent_env_data else 'unknown'
            }
        
        return {
            'zone': {
                'id': zone.id,
                'name': zone.name,
                'center_lat': float(zone.center_lat),
                'center_lon': float(zone.center_lon)
            },
            'current_status': {
                'mood_index': round(avg_mood, 2),
                'post_count': post_count,
                'dominant_emotion': dominant_emotion,
                'last_updated': now.isoformat()
            },
            'emotion_breakdown': {k: round(v, 4) for k, v in emotion_breakdown.items()},
            'environmental_data': env_overview,
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting zone details: {str(e)}")

@router.get("/{zone_id}/series")
async def get_zone_time_series(
    zone_id: int,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get time series data for a specific zone"""
    try:
        zone = db.query(CityZone).filter(CityZone.id == zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        
        # Calculate time range
        now = datetime.now(pytz.UTC)
        start_time = now - timedelta(hours=hours)
        
        # Get emotion analysis data over time
        emotion_data = db.query(EmotionAnalysis).filter(
            EmotionAnalysis.zone_id == zone_id,
            EmotionAnalysis.created_at >= start_time
        ).order_by(EmotionAnalysis.created_at).all()
        
        # Group by hour and calculate averages
        hourly_data = {}
        for emotion in emotion_data:
            hour_key = emotion.created_at.replace(minute=0, second=0, microsecond=0)
            if hour_key not in hourly_data:
                hourly_data[hour_key] = {
                    'mood_indices': [],
                    'emotion_counts': {'joy': 0, 'sadness': 0, 'anger': 0, 'fear': 0, 'surprise': 0, 'disgust': 0, 'neutral': 0},
                    'post_count': 0
                }
            
            hourly_data[hour_key]['mood_indices'].append(float(emotion.mood_index))
            hourly_data[hour_key]['emotion_counts'][emotion.dominant_emotion] += 1
            hourly_data[hour_key]['post_count'] += 1
        
        # Convert to time series format
        time_series = []
        for hour, data in sorted(hourly_data.items()):
            avg_mood = sum(data['mood_indices']) / len(data['mood_indices']) if data['mood_indices'] else 50.0
            dominant_emotion = max(data['emotion_counts'].items(), key=lambda x: x[1])[0] if any(data['emotion_counts'].values()) else 'neutral'
            
            time_series.append({
                'timestamp': hour.isoformat(),
                'mood_index': round(avg_mood, 2),
                'post_count': data['post_count'],
                'dominant_emotion': dominant_emotion,
                'emotion_breakdown': data['emotion_counts']
            })
        
        return {
            'zone_id': zone_id,
            'zone_name': zone.name,
            'time_series': time_series,
            'period_hours': hours,
            'data_points': len(time_series),
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting zone time series: {str(e)}")

@router.get("/{zone_id}/posts")
async def get_zone_posts(
    zone_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get recent social media posts for a specific zone"""
    try:
        zone = db.query(CityZone).filter(CityZone.id == zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        
        # Get recent posts with emotion analysis for this zone
        recent_posts = db.query(EmotionAnalysis).filter(
            EmotionAnalysis.zone_id == zone_id
        ).join(
            EmotionAnalysis.post
        ).order_by(
            desc(EmotionAnalysis.created_at)
        ).limit(limit).all()
        
        posts_data = []
        for analysis in recent_posts:
            post_data = {
                'id': analysis.post.id,
                'content': analysis.post.content,
                'source': analysis.post.source,
                'lat': float(analysis.post.lat) if analysis.post.lat else None,
                'lon': float(analysis.post.lon) if analysis.post.lon else None,
                'created_at': analysis.post.created_at.isoformat(),
                'emotion_analysis': {
                    'mood_index': float(analysis.mood_index),
                    'dominant_emotion': analysis.dominant_emotion,
                    'joy': float(analysis.joy),
                    'sadness': float(analysis.sadness),
                    'anger': float(analysis.anger),
                    'fear': float(analysis.fear),
                    'surprise': float(analysis.surprise),
                    'disgust': float(analysis.disgust),
                    'neutral': float(analysis.neutral)
                }
            }
            posts_data.append(post_data)
        
        return {
            'zone_id': zone_id,
            'zone_name': zone.name,
            'posts': posts_data,
            'count': len(posts_data),
            'timestamp': datetime.now(pytz.UTC).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting zone posts: {str(e)}")
