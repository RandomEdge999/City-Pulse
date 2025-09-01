import asyncio
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models import SocialPost, EmotionAnalysis, CityZone
from app.ml.emotion_service import emotion_service
from app.database import get_db
import pytz

logger = logging.getLogger(__name__)

class MockSocialCollector:
    def __init__(self):
        self.mock_posts = [
            "Just had the most amazing coffee at that new cafe downtown! ☕️",
            "Traffic is absolutely terrible today, been stuck for 30 minutes 😤",
            "Beautiful sunset over the city skyline tonight 🌅",
            "Can't believe how expensive parking has become in this area 😡",
            "Found the cutest little bookstore, perfect for a rainy day 📚",
            "The new restaurant on 5th Ave is incredible! Best meal I've had in months 🍽️",
            "Why do people always leave their trash everywhere? So frustrating 😠",
            "Just finished an amazing workout at the gym, feeling great! 💪",
            "The subway is running late again, typical Monday morning 😑",
            "Love walking through the park in the morning, so peaceful 🌳",
            "This weather is perfect for a picnic in the park! 🧺",
            "Can't wait for the weekend, need a break from work stress 😌",
            "The street performers in Times Square are always so talented! 🎭",
            "Why is it so hard to find a good pizza place around here? 🍕",
            "Just discovered a hidden gem of a coffee shop, amazing atmosphere ☕️",
            "The city looks so magical at night with all the lights ✨",
            "Finally got my package delivered after waiting all day 📦",
            "Love the energy of the farmers market on Saturdays 🥬",
            "The construction noise is driving me crazy this morning 😫",
            "Perfect day for a bike ride along the river 🚴‍♀️"
        ]
        
        self.sources = ["twitter", "instagram", "facebook", "reddit", "tiktok"]
        self.zones = None
        self._load_zones()
    
    def _load_zones(self):
        """Load city zones from database"""
        try:
            db = next(get_db())
            self.zones = db.query(CityZone).all()
            logger.info(f"Loaded {len(self.zones)} city zones")
        except Exception as e:
            logger.error(f"Failed to load zones: {e}")
            self.zones = []
    
    def generate_mock_post(self) -> Dict:
        """Generate a single mock social media post"""
        zone = random.choice(self.zones) if self.zones else None
        
        # Generate random coordinates within the zone bounds
        if zone:
            # Simple bounding box approximation
            lat = float(zone.center_lat) + random.uniform(-0.01, 0.01)
            lon = float(zone.center_lon) + random.uniform(-0.01, 0.01)
        else:
            # Default NYC coordinates if no zones
            lat = 40.7128 + random.uniform(-0.1, 0.1)
            lon = -74.0060 + random.uniform(-0.1, 0.1)
        
        return {
            'content': random.choice(self.mock_posts),
            'source': random.choice(self.sources),
            'zone_id': zone.id if zone else None,
            'lat': lat,
            'lon': lon,
            'created_at': datetime.now(pytz.UTC)
        }
    
    async def collect_and_process(self, batch_size: int = 5) -> List[Dict]:
        """Collect mock posts and process them through emotion analysis"""
        try:
            # Generate mock posts
            posts = [self.generate_mock_post() for _ in range(batch_size)]
            
            # Process emotions
            texts = [post['content'] for post in posts]
            emotion_results = emotion_service.batch_analyze_emotions(texts)
            
            # Combine posts with emotion results
            processed_posts = []
            for post, emotion in zip(posts, emotion_results):
                processed_post = {
                    'social_post': post,
                    'emotion_analysis': emotion
                }
                processed_posts.append(processed_post)
            
            logger.info(f"Processed {len(processed_posts)} mock social posts")
            return processed_posts
            
        except Exception as e:
            logger.error(f"Error in collect_and_process: {e}")
            return []
    
    async def store_to_database(self, processed_posts: List[Dict]) -> bool:
        """Store processed posts and emotion analysis to database"""
        try:
            db = next(get_db())
            
            for item in processed_posts:
                # Create social post
                social_post = SocialPost(
                    content=item['social_post']['content'],
                    source=item['social_post']['source'],
                    zone_id=item['social_post']['zone_id'],
                    lat=item['social_post']['lat'],
                    lon=item['social_post']['lon'],
                    created_at=item['social_post']['created_at']
                )
                
                # Add location geometry if coordinates exist
                if item['social_post']['lat'] and item['social_post']['lon']:
                    # PostGIS functions removed - using WKT text instead
                    social_post.location = f"POINT({item['social_post']['lon']} {item['social_post']['lat']})"
                
                db.add(social_post)
                db.flush()  # Get the ID
                
                # Create emotion analysis
                emotion_analysis = EmotionAnalysis(
                    post_id=social_post.id,
                    zone_id=item['social_post']['zone_id'],
                    joy=item['emotion_analysis']['joy'],
                    sadness=item['emotion_analysis']['sadness'],
                    anger=item['emotion_analysis']['anger'],
                    fear=item['emotion_analysis']['fear'],
                    surprise=item['emotion_analysis']['surprise'],
                    disgust=item['emotion_analysis']['disgust'],
                    neutral=item['emotion_analysis']['neutral'],
                    dominant_emotion=item['emotion_analysis']['dominant_emotion'],
                    mood_index=item['emotion_analysis']['mood_index'],
                    created_at=item['social_post']['created_at']
                )
                
                db.add(emotion_analysis)
            
            db.commit()
            logger.info(f"Stored {len(processed_posts)} posts to database")
            return True
            
        except Exception as e:
            logger.error(f"Error storing to database: {e}")
            db.rollback()
            return False
    
    async def run_collection_cycle(self, interval_seconds: int = 10):
        """Run continuous collection cycle"""
        logger.info(f"Starting social media collection cycle (interval: {interval_seconds}s)")
        
        while True:
            try:
                # Collect and process posts
                processed_posts = await self.collect_and_process()
                
                if processed_posts:
                    # Store to database
                    success = await self.store_to_database(processed_posts)
                    if success:
                        logger.info(f"Collection cycle completed successfully")
                    else:
                        logger.error("Collection cycle failed to store data")
                
                # Wait for next cycle
                await asyncio.sleep(interval_seconds)
                
            except Exception as e:
                logger.error(f"Error in collection cycle: {e}")
                await asyncio.sleep(interval_seconds)

# Global instance
social_collector = MockSocialCollector()
