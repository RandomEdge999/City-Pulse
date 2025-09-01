#!/usr/bin/env python3
"""
Database initialization script for City Pulse application
Creates tables and seeds initial data
"""

import sys
import os
import time

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import create_tables, engine
from app.models import Base
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_database():
    """Wait for database to be ready"""
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                logger.info("Database connection successful")
                return True
        except Exception as e:
            attempt += 1
            logger.info(f"Database not ready (attempt {attempt}/{max_attempts}): {e}")
            time.sleep(2)
    
    logger.error("Database failed to become ready after maximum attempts")
    return False

def create_database_tables():
    """Create all database tables"""
    try:
        logger.info("Creating database tables...")
        create_tables()
        logger.info("Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        return False

def main():
    """Main initialization function"""
    logger.info("Starting database initialization...")
    
    # Wait for database to be ready
    if not wait_for_database():
        logger.error("Database initialization failed")
        sys.exit(1)
    
    # Create tables
    if not create_database_tables():
        logger.error("Table creation failed")
        sys.exit(1)
    
    logger.info("Database initialization completed successfully!")
    logger.info("You can now run the data seeding script: python scripts/seed_data.py")

if __name__ == "__main__":
    main()
