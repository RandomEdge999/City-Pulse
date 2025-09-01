-- Enable required extensions (TimescaleDB first)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- For now, we'll use basic PostgreSQL without PostGIS
-- The geometry fields will be stored as text and converted in the application

-- City zones table
CREATE TABLE city_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    geometry TEXT NOT NULL, -- Store as WKT text instead of PostGIS geometry
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lon DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on zones (no spatial index without PostGIS)
CREATE INDEX idx_city_zones_geometry ON city_zones (geometry);

-- Social media posts table
CREATE TABLE social_posts (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES city_zones(id),
    content TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    location TEXT, -- Store as WKT text instead of PostGIS geometry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on posts (no spatial index without PostGIS)
CREATE INDEX idx_social_posts_location ON social_posts (location);
CREATE INDEX idx_social_posts_zone_id ON social_posts(zone_id);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at);

-- Emotion analysis results table
CREATE TABLE emotion_analysis (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES social_posts(id),
    zone_id INTEGER REFERENCES city_zones(id),
    joy DECIMAL(5,4) NOT NULL,
    sadness DECIMAL(5,4) NOT NULL,
    anger DECIMAL(5,4) NOT NULL,
    fear DECIMAL(5,4) NOT NULL,
    surprise DECIMAL(5,4) NOT NULL,
    disgust DECIMAL(5,4) NOT NULL,
    neutral DECIMAL(5,4) NOT NULL,
    dominant_emotion VARCHAR(20) NOT NULL,
    mood_index DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on emotion analysis
CREATE INDEX idx_emotion_analysis_zone_id ON emotion_analysis(zone_id);
CREATE INDEX idx_emotion_analysis_created_at ON emotion_analysis(created_at);
CREATE INDEX idx_emotion_analysis_mood_index ON emotion_analysis(mood_index);

-- Environmental data table
CREATE TABLE environmental_data (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES city_zones(id),
    data_type VARCHAR(50) NOT NULL, -- 'air_quality', 'weather', 'noise'
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    location TEXT, -- Store as WKT text instead of PostGIS geometry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on environmental data
CREATE INDEX idx_environmental_data_zone_id ON environmental_data(zone_id);
CREATE INDEX idx_environmental_data_created_at ON environmental_data(created_at);
CREATE INDEX idx_environmental_data_type ON environmental_data(data_type);

-- Zone mood aggregations table (for caching)
CREATE TABLE zone_mood_aggregations (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES city_zones(id),
    mood_index_avg DECIMAL(5,2) NOT NULL,
    mood_index_std DECIMAL(5,2),
    post_count INTEGER NOT NULL,
    joy_avg DECIMAL(5,4) NOT NULL,
    sadness_avg DECIMAL(5,4) NOT NULL,
    anger_avg DECIMAL(5,4) NOT NULL,
    fear_avg DECIMAL(5,4) NOT NULL,
    surprise_avg DECIMAL(5,4) NOT NULL,
    disgust_avg DECIMAL(5,4) NOT NULL,
    neutral_avg DECIMAL(5,4) NOT NULL,
    aggregation_period VARCHAR(20) NOT NULL, -- 'hourly', 'daily'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on aggregations
CREATE INDEX idx_zone_mood_aggregations_zone_id ON zone_mood_aggregations(zone_id);
CREATE INDEX idx_zone_mood_aggregations_period ON zone_mood_aggregations(aggregation_period);
CREATE INDEX idx_zone_mood_aggregations_period_start ON zone_mood_aggregations(period_start);

-- Convert to TimescaleDB hypertables (simplified approach)
SELECT create_hypertable('emotion_analysis', 'created_at', if_not_exists => TRUE);
SELECT create_hypertable('environmental_data', 'created_at', if_not_exists => TRUE);
SELECT create_hypertable('zone_mood_aggregations', 'created_at', if_not_exists => TRUE);

-- Insert sample city zones (New York City boroughs as example)
INSERT INTO city_zones (name, geometry, center_lat, center_lon) VALUES
('Manhattan', 'POLYGON((-74.019 40.700, -73.910 40.700, -73.910 40.880, -74.019 40.880, -74.019 40.700))', 40.7831, -73.9712),
('Brooklyn', 'POLYGON((-74.042 40.570, -73.856 40.570, -73.856 40.740, -74.042 40.740, -74.042 40.570))', 40.6782, -73.9442),
('Queens', 'POLYGON((-73.962 40.700, -73.700 40.700, -73.700 40.800, -73.962 40.800, -73.962 40.700))', 40.7282, -73.7949),
('Bronx', 'POLYGON((-73.933 40.800, -73.765 40.800, -73.765 40.920, -73.933 40.920, -73.933 40.800))', 40.8448, -73.8648),
('Staten Island', 'POLYGON((-74.259 40.500, -74.050 40.500, -74.050 40.650, -74.259 40.650, -74.259 40.500))', 40.5795, -74.1502);
