"""
Environmental data collector for City Pulse application
Collects and processes environmental data from various sources
"""

import asyncio
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models import EnvironmentalData, CityZone
from app.database import get_db
# PostGIS functions removed - using WKT text instead
from decimal import Decimal
import pytz

logger = logging.getLogger(__name__)

class MockEnvironmentalCollector:
    def __init__(self):
        self.env_types = [
            {'type': 'air_quality', 'unit': 'AQI', 'min': 0, 'max': 500, 'normal_range': (0, 150)},
            {'type': 'temperature', 'unit': '°C', 'min': -10, 'max': 40, 'normal_range': (15, 30)},
            {'type': 'humidity', 'unit': '%', 'min': 20, 'max': 100, 'normal_range': (40, 70)},
            {'type': 'noise_level', 'unit': 'dB', 'min': 30, 'max': 100, 'normal_range': (40, 70)},
            {'type': 'wind_speed', 'unit': 'm/s', 'min': 0, 'max': 20, 'normal_range': (0, 10)},
            {'type': 'precipitation', 'unit': 'mm/h', 'min': 0, 'max': 50, 'normal_range': (0, 5)},
            {'type': 'uv_index', 'unit': 'index', 'min': 0, 'max': 11, 'normal_range': (0, 7)},
            {'type': 'pressure', 'unit': 'hPa', 'min': 980, 'max': 1030, 'normal_range': (1000, 1020)}
        ]
        
        self.sources = ["weather_station", "air_monitor", "noise_sensor", "satellite", "mobile_sensor"]
        self.zones = None
        self._load_zones()
    
    def _load_zones(self):
        """Load city zones from database"""
        try:
            db = next(get_db())
            self.zones = db.query(CityZone).all()
            logger.info(f"Loaded {len(self.zones)} city zones for environmental monitoring")
        except Exception as e:
            logger.error(f"Failed to load zones: {e}")
            self.zones = []
    
    def generate_mock_environmental_data(self) -> Dict:
        """Generate a single mock environmental data point"""
        if not self.zones:
            logger.warning("No zones available for environmental data generation")
            return None
        
        zone = random.choice(self.zones)
        env_type = random.choice(self.env_types)
        
        # Generate realistic values based on time of day and season
        now = datetime.now(pytz.UTC)
        hour = now.hour
        
        # Adjust values based on time of day
        if env_type['type'] == 'temperature':
            # Colder at night, warmer during day
            if 6 <= hour <= 18:  # Daytime
                base_value = random.uniform(20, 30)
            else:  # Nighttime
                base_value = random.uniform(10, 20)
        elif env_type['type'] == 'noise_level':
            # Higher noise during day
            if 7 <= hour <= 19:  # Daytime
                base_value = random.uniform(50, 80)
            else:  # Nighttime
                base_value = random.uniform(30, 60)
        elif env_type['type'] == 'air_quality':
            # Worse during rush hours
            if (7 <= hour <= 9) or (17 <= hour <= 19):  # Rush hours
                base_value = random.uniform(100, 300)
            else:
                base_value = random.uniform(20, 100)
        else:
            # Other environmental factors
            base_value = random.uniform(env_type['min'], env_type['max'])
        
        # Add some randomness
        value = base_value + random.uniform(-5, 5)
        value = max(env_type['min'], min(env_type['max'], value))
        
        # Generate random coordinates within the zone bounds
        lat = float(zone.center_lat) + random.uniform(-0.01, 0.01)
        lon = float(zone.center_lon) + random.uniform(-0.01, 0.01)
        
        return {
            'zone_id': zone.id,
            'data_type': env_type['type'],
            'value': value,
            'unit': env_type['unit'],
            'source': random.choice(self.sources),
            'lat': lat,
            'lon': lon,
            'created_at': now
        }
    
    async def collect_and_process(self, batch_size: int = 3) -> List[Dict]:
        """Collect mock environmental data"""
        try:
            # Generate mock data points
            data_points = []
            for _ in range(batch_size):
                data_point = self.generate_mock_environmental_data()
                if data_point:
                    data_points.append(data_point)
            
            logger.info(f"Generated {len(data_points)} environmental data points")
            return data_points
            
        except Exception as e:
            logger.error(f"Error in collect_and_process: {e}")
            return []
    
    async def store_to_database(self, data_points: List[Dict]) -> bool:
        """Store environmental data to database"""
        try:
            db = next(get_db())
            
            for data_point in data_points:
                # Create environmental data record
                env_data = EnvironmentalData(
                    zone_id=data_point['zone_id'],
                    data_type=data_point['data_type'],
                    value=Decimal(str(round(data_point['value'], 2))),
                    unit=data_point['unit'],
                    source=data_point['source'],
                    lat=Decimal(str(data_point['lat'])),
                    lon=Decimal(str(data_point['lon'])),
                    location=f"POINT({data_point['lon']} {data_point['lat']})",
                    created_at=data_point['created_at']
                )
                
                db.add(env_data)
            
            db.commit()
            logger.info(f"Stored {len(data_points)} environmental data points to database")
            return True
            
        except Exception as e:
            logger.error(f"Error storing to database: {e}")
            db.rollback()
            return False
    
    async def run_collection_cycle(self, interval_seconds: int = 300):
        """Run continuous environmental data collection cycle"""
        logger.info(f"Starting environmental data collection cycle (interval: {interval_seconds}s)")
        
        while True:
            try:
                # Collect environmental data
                data_points = await self.collect_and_process()
                
                if data_points:
                    # Store to database
                    success = await self.store_to_database(data_points)
                    if success:
                        logger.info(f"Environmental collection cycle completed successfully")
                    else:
                        logger.error("Environmental collection cycle failed to store data")
                
                # Wait for next cycle
                await asyncio.sleep(interval_seconds)
                
            except Exception as e:
                logger.error(f"Error in environmental collection cycle: {e}")
                await asyncio.sleep(interval_seconds)
    
    def get_collector_info(self) -> Dict:
        """Get information about the environmental collector"""
        return {
            'collector_type': 'mock_environmental',
            'environmental_types': [env['type'] for env in self.env_types],
            'sources': self.sources,
            'zones_monitored': len(self.zones) if self.zones else 0,
            'active': True
        }

# Global instance
env_collector = MockEnvironmentalCollector()
