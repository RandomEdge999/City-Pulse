"""
Background service manager for City Pulse application
Manages data collection, processing, and maintenance tasks
"""

import asyncio
import logging
import threading
from typing import List, Optional
from datetime import datetime, timedelta
import pytz

from app.ingestion.social_collector import social_collector
from app.ingestion.env_collector import env_collector

logger = logging.getLogger(__name__)

class BackgroundServiceManager:
    """Manages background services for data collection and processing"""
    
    def __init__(self):
        self.services = []
        self.running = False
        self.threads = []
        
    def add_service(self, service_func, interval_seconds: int, name: str):
        """Add a background service"""
        service = {
            'func': service_func,
            'interval': interval_seconds,
            'name': name,
            'last_run': None,
            'next_run': datetime.now(pytz.UTC)
        }
        self.services.append(service)
        logger.info(f"Added background service: {name} (interval: {interval_seconds}s)")
    
    def start_services(self):
        """Start all background services"""
        if self.running:
            logger.warning("Background services already running")
            return
        
        self.running = True
        logger.info("Starting background services...")
        
        # Start services in separate threads
        for service in self.services:
            thread = threading.Thread(
                target=self._run_service_loop,
                args=(service,),
                daemon=True,
                name=f"bg-service-{service['name']}"
            )
            thread.start()
            self.threads.append(thread)
            logger.info(f"Started background service: {service['name']}")
    
    def stop_services(self):
        """Stop all background services"""
        if not self.running:
            return
        
        logger.info("Stopping background services...")
        self.running = False
        
        # Wait for threads to finish
        for thread in self.threads:
            thread.join(timeout=5.0)
            if thread.is_alive():
                logger.warning(f"Background service thread {thread.name} did not stop gracefully")
        
        self.threads.clear()
        logger.info("Background services stopped")
    
    def _run_service_loop(self, service):
        """Run a single service in a loop"""
        service_name = service['name']
        logger.info(f"Background service {service_name} started")
        
        while self.running:
            try:
                now = datetime.now(pytz.UTC)
                
                # Check if it's time to run the service
                if service['next_run'] <= now:
                    logger.debug(f"Running background service: {service_name}")
                    
                    # Run the service
                    start_time = datetime.now(pytz.UTC)
                    try:
                        # Handle both async and sync functions
                        if asyncio.iscoroutinefunction(service['func']):
                            # Create new event loop for async function
                            loop = asyncio.new_event_loop()
                            asyncio.set_event_loop(loop)
                            try:
                                loop.run_until_complete(service['func']())
                            finally:
                                loop.close()
                        else:
                            service['func']()
                        
                        # Update service timing
                        service['last_run'] = now
                        service['next_run'] = now + timedelta(seconds=service['interval'])
                        
                        execution_time = (datetime.now(pytz.UTC) - start_time).total_seconds()
                        logger.debug(f"Background service {service_name} completed in {execution_time:.2f}s")
                        
                    except Exception as e:
                        logger.error(f"Error in background service {service_name}: {e}")
                        # Schedule retry in 1 minute
                        service['next_run'] = now + timedelta(minutes=1)
                
                # Sleep for a short interval
                import time
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Critical error in background service {service_name}: {e}")
                import time
                time.sleep(5)  # Wait before retrying
        
        logger.info(f"Background service {service_name} stopped")
    
    def get_service_status(self) -> List[dict]:
        """Get status of all background services"""
        status = []
        for service in self.services:
            status.append({
                'name': service['name'],
                'interval_seconds': service['interval'],
                'last_run': service['last_run'].isoformat() if service['last_run'] else None,
                'next_run': service['next_run'].isoformat() if service['next_run'] else None,
                'running': self.running
            })
        return status
    
    def health_check(self) -> dict:
        """Perform health check on background services"""
        now = datetime.now(pytz.UTC)
        healthy = True
        issues = []
        
        for service in self.services:
            # Check if service is running regularly
            if service['last_run']:
                time_since_last_run = (now - service['last_run']).total_seconds()
                max_expected_interval = service['interval'] * 2  # Allow 2x interval
                
                if time_since_last_run > max_expected_interval:
                    healthy = False
                    issues.append(f"Service {service['name']} hasn't run in {time_since_last_run:.0f}s")
            else:
                # Service hasn't run yet
                if self.running:
                    issues.append(f"Service {service['name']} hasn't run yet")
        
        return {
            'healthy': healthy,
            'running': self.running,
            'active_services': len(self.services),
            'issues': issues,
            'timestamp': now.isoformat()
        }

# Global background service manager instance
background_manager = BackgroundServiceManager()

def initialize_background_services():
    """Initialize and start background services"""
    try:
        # Add social media collection service
        background_manager.add_service(
            social_collector.run_collection_cycle,
            interval_seconds=10,
            name="social_collector"
        )
        
        # Add environmental data collection service
        background_manager.add_service(
            env_collector.run_collection_cycle,
            interval_seconds=300,  # 5 minutes
            name="env_collector"
        )
        
        # Don't start services immediately - wait for database to be ready
        logger.info("Background services configured but not started yet")
        logger.info("Services will start after database initialization")
        
    except Exception as e:
        logger.error(f"Failed to initialize background services: {e}")
        raise

def start_background_services():
    """Start background services after database is ready"""
    try:
        background_manager.start_services()
        logger.info("Background services started successfully")
    except Exception as e:
        logger.error(f"Failed to start background services: {e}")
        raise

def shutdown_background_services():
    """Shutdown background services gracefully"""
    try:
        background_manager.stop_services()
        logger.info("Background services shutdown completed")
    except Exception as e:
        logger.error(f"Error during background services shutdown: {e}")
