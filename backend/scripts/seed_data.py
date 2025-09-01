#!/usr/bin/env python3
"""
Data seeding script for City Pulse application
Populates the database with initial city zones and sample data
"""

import sys
import os
import asyncio
from datetime import datetime, timedelta
import random
import pytz

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, create_tables
from app.models import CityZone, SocialPost, EmotionAnalysis, EnvironmentalData
from app.ml.emotion_service import emotion_service
# PostGIS functions removed - using WKT text instead, ST_GeomFromText
from decimal import Decimal

def seed_city_zones(db):
    """Seed the database with NYC borough zones"""
    print("Seeding city zones...")
    
    # Check if zones already exist
    existing_zones = db.query(CityZone).count()
    if existing_zones > 0:
        print(f"Found {existing_zones} existing zones, skipping zone creation")
        return db.query(CityZone).all()
    
    # NYC boroughs with approximate boundaries
    zones_data = [
        {
            'name': 'Manhattan',
            'geometry': 'POLYGON((-74.019 40.700, -73.910 40.700, -73.910 40.880, -74.019 40.880, -74.019 40.700))',
            'center_lat': Decimal('40.7831'),
            'center_lon': Decimal('-73.9712')
        },
        {
            'name': 'Brooklyn',
            'geometry': 'POLYGON((-74.042 40.570, -73.856 40.570, -73.856 40.740, -74.042 40.740, -74.042 40.570))',
            'center_lat': Decimal('40.6782'),
            'center_lon': Decimal('-73.9442')
        },
        {
            'name': 'Queens',
            'geometry': 'POLYGON((-73.962 40.700, -73.700 40.700, -73.700 40.800, -73.962 40.800, -73.962 40.700))',
            'center_lat': Decimal('40.7282'),
            'center_lon': Decimal('-73.7949')
        },
        {
            'name': 'Bronx',
            'geometry': 'POLYGON((-73.933 40.800, -73.765 40.800, -73.765 40.920, -73.933 40.920, -73.933 40.800))',
            'center_lat': Decimal('40.8448'),
            'center_lon': Decimal('-73.8648')
        },
        {
            'name': 'Staten Island',
            'geometry': 'POLYGON((-74.259 40.500, -74.050 40.500, -74.050 40.650, -74.259 40.650, -74.259 40.500))',
            'center_lat': Decimal('40.5795'),
            'center_lon': Decimal('-74.1502')
        }
    ]
    
    zones = []
    for zone_data in zones_data:
        zone = CityZone(**zone_data)
        db.add(zone)
        zones.append(zone)
    
    db.commit()
    print(f"Created {len(zones)} city zones")
    return zones

def seed_sample_posts(db, zones):
    """Seed the database with sample social media posts"""
    print("Seeding sample social media posts...")
    
    # Check if posts already exist
    existing_posts = db.query(SocialPost).count()
    if existing_posts > 0:
        print(f"Found {existing_posts} existing posts, skipping post creation")
        return
    
    # Sample social media posts
    sample_posts = [
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
    
    sources = ["twitter", "instagram", "facebook", "reddit", "tiktok"]
    
    # Generate posts for the last 24 hours
    now = datetime.now(pytz.UTC)
    posts_created = 0
    
    for i in range(100):  # Create 100 sample posts
        # Random time within last 24 hours
        post_time = now - timedelta(
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59)
        )
        
        # Random zone
        zone = random.choice(zones)
        
        # Random coordinates within zone bounds
        lat = float(zone.center_lat) + random.uniform(-0.01, 0.01)
        lon = float(zone.center_lon) + random.uniform(-0.01, 0.01)
        
        # Create social post
        post = SocialPost(
            content=random.choice(sample_posts),
            source=random.choice(sources),
            zone_id=zone.id,
            lat=Decimal(str(lat)),
            lon=Decimal(str(lon)),
            location=f'POINT({lon} {lat})',
            created_at=post_time
        )
        
        db.add(post)
        db.flush()  # Get the ID
        
        # Analyze emotion
        try:
            emotion_result = emotion_service.analyze_emotion(post.content)
            
            # Create emotion analysis
            emotion_analysis = EmotionAnalysis(
                post_id=post.id,
                zone_id=zone.id,
                joy=emotion_result['joy'],
                sadness=emotion_result['sadness'],
                anger=emotion_result['anger'],
                fear=emotion_result['fear'],
                surprise=emotion_result['surprise'],
                disgust=emotion_result['disgust'],
                neutral=emotion_result['neutral'],
                dominant_emotion=emotion_result['dominant_emotion'],
                mood_index=emotion_result['mood_index'],
                created_at=post_time
            )
            
            db.add(emotion_analysis)
            posts_created += 1
            
        except Exception as e:
            print(f"Error analyzing emotion for post {post.id}: {e}")
            # Create neutral emotion analysis as fallback
            emotion_analysis = EmotionAnalysis(
                post_id=post.id,
                zone_id=zone.id,
                joy=Decimal('0.0'),
                sadness=Decimal('0.0'),
                anger=Decimal('0.0'),
                fear=Decimal('0.0'),
                surprise=Decimal('0.0'),
                disgust=Decimal('0.0'),
                neutral=Decimal('1.0'),
                dominant_emotion='neutral',
                mood_index=Decimal('50.0'),
                created_at=post_time
            )
            db.add(emotion_analysis)
            posts_created += 1
    
    db.commit()
    print(f"Created {posts_created} sample posts with emotion analysis")

def seed_environmental_data(db, zones):
    """Seed the database with sample environmental data"""
    print("Seeding sample environmental data...")
    
    # Check if environmental data already exists
    existing_data = db.query(EnvironmentalData).count()
    if existing_data > 0:
        print(f"Found {existing_data} existing environmental data points, skipping creation")
        return
    
    # Sample environmental data types
    env_types = [
        {'type': 'air_quality', 'unit': 'AQI', 'min': 0, 'max': 500},
        {'type': 'temperature', 'unit': '°C', 'min': -10, 'max': 40},
        {'type': 'humidity', 'unit': '%', 'min': 20, 'max': 100},
        {'type': 'noise_level', 'unit': 'dB', 'min': 30, 'max': 100},
        {'type': 'wind_speed', 'unit': 'm/s', 'min': 0, 'max': 20}
    ]
    
    sources = ["weather_station", "air_monitor", "noise_sensor", "satellite"]
    
    # Generate environmental data for the last 24 hours
    now = datetime.now(pytz.UTC)
    data_created = 0
    
    for i in range(200):  # Create 200 sample data points
        # Random time within last 24 hours
        data_time = now - timedelta(
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59)
        )
        
        # Random zone
        zone = random.choice(zones)
        
        # Random environmental data type
        env_type = random.choice(env_types)
        
        # Random coordinates within zone bounds
        lat = float(zone.center_lat) + random.uniform(-0.01, 0.01)
        lon = float(zone.center_lon) + random.uniform(-0.01, 0.01)
        
        # Random value within range
        value = random.uniform(env_type['min'], env_type['max'])
        
        # Create environmental data point
        env_data = EnvironmentalData(
            zone_id=zone.id,
            data_type=env_type['type'],
            value=Decimal(str(round(value, 2))),
            unit=env_type['unit'],
            source=random.choice(sources),
            lat=Decimal(str(lat)),
            lon=Decimal(str(lon)),
            location=f'POINT({lon} {lat})',
            created_at=data_time
        )
        
        db.add(env_data)
        data_created += 1
    
    db.commit()
    print(f"Created {data_created} sample environmental data points")

def main():
    """Main seeding function"""
    print("Starting data seeding process...")
    
    try:
        # Create database tables
        create_tables()
        print("Database tables created/verified")
        
        # Get database session
        db = SessionLocal()
        
        try:
            # Seed city zones
            zones = seed_city_zones(db)
            
            # Seed sample posts
            seed_sample_posts(db, zones)
            
            # Seed environmental data
            seed_environmental_data(db, zones)
            
            print("Data seeding completed successfully!")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error during data seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
