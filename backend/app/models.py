from sqlalchemy import Column, Integer, String, Text, DECIMAL, DateTime, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TIMESTAMP
from datetime import datetime
import pytz

Base = declarative_base()

class CityZone(Base):
    __tablename__ = 'city_zones'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    geometry = Column(Text, nullable=False)  # Store as WKT text
    center_lat = Column(DECIMAL(10, 8), nullable=False)
    center_lon = Column(DECIMAL(11, 8), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(pytz.UTC))
    
    # Relationships
    social_posts = relationship("SocialPost", back_populates="zone")
    emotion_analyses = relationship("EmotionAnalysis", back_populates="zone")
    environmental_data = relationship("EnvironmentalData", back_populates="zone")
    mood_aggregations = relationship("ZoneMoodAggregation", back_populates="zone")

class SocialPost(Base):
    __tablename__ = 'social_posts'
    
    id = Column(Integer, primary_key=True)
    zone_id = Column(Integer, ForeignKey('city_zones.id'))
    content = Column(Text, nullable=False)
    source = Column(String(50), nullable=False)
    lat = Column(DECIMAL(10, 8))
    lon = Column(DECIMAL(11, 8))
    location = Column(Text)  # Store as WKT text
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(pytz.UTC))
    
    # Relationships
    zone = relationship("CityZone", back_populates="social_posts")
    emotion_analysis = relationship("EmotionAnalysis", back_populates="post", uselist=False)

class EmotionAnalysis(Base):
    __tablename__ = 'emotion_analysis'
    
    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey('social_posts.id'))
    zone_id = Column(Integer, ForeignKey('city_zones.id'))
    joy = Column(DECIMAL(5, 4), nullable=False)
    sadness = Column(DECIMAL(5, 4), nullable=False)
    anger = Column(DECIMAL(5, 4), nullable=False)
    fear = Column(DECIMAL(5, 4), nullable=False)
    surprise = Column(DECIMAL(5, 4), nullable=False)
    disgust = Column(DECIMAL(5, 4), nullable=False)
    neutral = Column(DECIMAL(5, 4), nullable=False)
    dominant_emotion = Column(String(20), nullable=False)
    mood_index = Column(DECIMAL(5, 2), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(pytz.UTC))
    
    # Relationships
    post = relationship("SocialPost", back_populates="emotion_analysis")
    zone = relationship("CityZone", back_populates="emotion_analyses")

class EnvironmentalData(Base):
    __tablename__ = 'environmental_data'
    
    id = Column(Integer, primary_key=True)
    zone_id = Column(Integer, ForeignKey('city_zones.id'))
    data_type = Column(String(50), nullable=False)
    value = Column(DECIMAL(10, 4), nullable=False)
    unit = Column(String(20), nullable=False)
    source = Column(String(50), nullable=False)
    lat = Column(DECIMAL(10, 8))
    lon = Column(DECIMAL(11, 8))
    location = Column(Text)  # Store as WKT text
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(pytz.UTC))
    
    # Relationships
    zone = relationship("CityZone", back_populates="environmental_data")

class ZoneMoodAggregation(Base):
    __tablename__ = 'zone_mood_aggregations'
    
    id = Column(Integer, primary_key=True)
    zone_id = Column(Integer, ForeignKey('city_zones.id'))
    mood_index_avg = Column(DECIMAL(5, 2), nullable=False)
    mood_index_std = Column(DECIMAL(5, 2))
    post_count = Column(Integer, nullable=False)
    joy_avg = Column(DECIMAL(5, 4), nullable=False)
    sadness_avg = Column(DECIMAL(5, 4), nullable=False)
    anger_avg = Column(DECIMAL(5, 4), nullable=False)
    fear_avg = Column(DECIMAL(5, 4), nullable=False)
    surprise_avg = Column(DECIMAL(5, 4), nullable=False)
    disgust_avg = Column(DECIMAL(5, 4), nullable=False)
    neutral_avg = Column(DECIMAL(5, 4), nullable=False)
    aggregation_period = Column(String(20), nullable=False)
    period_start = Column(TIMESTAMP(timezone=True), nullable=False)
    period_end = Column(TIMESTAMP(timezone=True), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(pytz.UTC))
    
    # Relationships
    zone = relationship("CityZone", back_populates="mood_aggregations")

# Create indexes
Index('idx_social_posts_location', SocialPost.location)
Index('idx_social_posts_zone_id', SocialPost.zone_id)
Index('idx_social_posts_created_at', SocialPost.created_at)

Index('idx_emotion_analysis_zone_id', EmotionAnalysis.zone_id)
Index('idx_emotion_analysis_created_at', EmotionAnalysis.created_at)
Index('idx_emotion_analysis_mood_index', EmotionAnalysis.mood_index)

Index('idx_environmental_data_zone_id', EnvironmentalData.zone_id)
Index('idx_environmental_data_created_at', EnvironmentalData.created_at)
Index('idx_environmental_data_type', EnvironmentalData.data_type)

Index('idx_zone_mood_aggregations_zone_id', ZoneMoodAggregation.zone_id)
Index('idx_zone_mood_aggregations_period', ZoneMoodAggregation.aggregation_period)
Index('idx_zone_mood_aggregations_period_start', ZoneMoodAggregation.period_start)
