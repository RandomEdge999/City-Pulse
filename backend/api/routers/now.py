from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CityZone, EmotionAnalysis, EnvironmentalData
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import pytz
from typing import List, Dict, Any

router = APIRouter()

@router.get("/now")
async def get_current_city_pulse(db: Session = Depends(get_db)):
    """Get current city pulse overview"""
    try:
        # Get current timestamp
        now = datetime.now(pytz.UTC)
        one_hour_ago = now - timedelta(hours=1)
        
        # Get current mood index for each zone
        zone_moods = []
        zones = db.query(CityZone).all()
        
        for zone in zones:
            # Get recent emotion analysis for this zone
            recent_emotions = db.query(EmotionAnalysis).filter(
                EmotionAnalysis.zone_id == zone.id,
                EmotionAnalysis.created_at >= one_hour_ago
            ).all()
            
            if recent_emotions:
                # Calculate average mood index
                avg_mood = sum(float(e.mood_index) for e in recent_emotions) / len(recent_emotions)
                post_count = len(recent_emotions)
                
                # Get dominant emotions
                emotion_counts = {}
                for emotion in recent_emotions:
                    dominant = emotion.dominant_emotion
                    emotion_counts[dominant] = emotion_counts.get(dominant, 0) + 1
                
                dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else 'neutral'
                
                zone_moods.append({
                    'zone_id': zone.id,
                    'zone_name': zone.name,
                    'center_lat': float(zone.center_lat),
                    'center_lon': float(zone.center_lon),
                    'current_mood_index': round(avg_mood, 2),
                    'post_count': post_count,
                    'dominant_emotion': dominant_emotion,
                    'last_updated': now.isoformat()
                })
            else:
                # No recent data, use neutral values
                zone_moods.append({
                    'zone_id': zone.id,
                    'zone_name': zone.name,
                    'center_lat': float(zone.center_lat),
                    'center_lon': float(zone.center_lon),
                    'current_mood_index': 50.0,
                    'post_count': 0,
                    'dominant_emotion': 'neutral',
                    'last_updated': now.isoformat()
                })
        
        # Calculate city-wide mood index
        total_mood = sum(zone['current_mood_index'] for zone in zone_moods)
        city_mood_index = total_mood / len(zone_moods) if zone_moods else 50.0
        
        return {
            'city_mood_index': round(city_mood_index, 2),
            'total_zones': len(zones),
            'zones': zone_moods,
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting city pulse: {str(e)}")

@router.get("/recent-posts")
async def get_recent_social_posts(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get recent social media posts with emotion analysis"""
    try:
        # Get recent posts with emotion analysis
        recent_posts = db.query(EmotionAnalysis).join(
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
                'zone_id': analysis.zone_id,
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
            'posts': posts_data,
            'count': len(posts_data),
            'timestamp': datetime.now(pytz.UTC).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recent posts: {str(e)}")

@router.get("/environmental-overview")
async def get_environmental_overview(db: Session = Depends(get_db)):
    """Get current environmental data overview"""
    try:
        now = datetime.now(pytz.UTC)
        one_hour_ago = now - timedelta(hours=1)
        
        # Get recent environmental data
        recent_env_data = db.query(EnvironmentalData).filter(
            EnvironmentalData.created_at >= one_hour_ago
        ).all()
        
        # Group by data type and calculate averages
        env_summary = {}
        for data_point in recent_env_data:
            data_type = data_point.data_type
            if data_type not in env_summary:
                env_summary[data_type] = []
            env_summary[data_type].append(float(data_point.value))
        
        # Calculate averages
        env_overview = {}
        for data_type, values in env_summary.items():
            env_overview[data_type] = {
                'average_value': round(sum(values) / len(values), 2),
                'count': len(values),
                'last_updated': now.isoformat()
            }
        
        return {
            'environmental_data': env_overview,
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting environmental overview: {str(e)}")
