from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables
from app.services.background_manager import initialize_background_services, start_background_services, shutdown_background_services
import logging
import os
from datetime import datetime
import pytz

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="City Pulse API",
    description="Real-time city emotional and environmental pulse monitoring",
    version="1.0.0"
)

# Add CORS middleware with configurable origins
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

# Add production origins if configured
if os.getenv("ENVIRONMENT") == "production":
    production_origins = os.getenv("CORS_ORIGINS", "").split(",")
    if production_origins and production_origins[0]:
        cors_origins.extend(production_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from api.routers import now, zone, forecast, alerts

# Include routers
app.include_router(now.router, prefix="/api", tags=["current"])
app.include_router(zone.router, prefix="/api/zone", tags=["zones"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["forecasting"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting City Pulse API...")
    try:
        # Create database tables
        create_tables()
        logger.info("Database tables created successfully")
        
        # Initialize background services (but don't start them yet)
        initialize_background_services()
        logger.info("Background services configured successfully")
        
        # Start background services after database is ready
        start_background_services()
        logger.info("Background services started successfully")
        
        logger.info("API startup completed successfully")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down City Pulse API...")
    try:
        shutdown_background_services()
        logger.info("API shutdown completed successfully")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "City Pulse API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.services.background_manager import background_manager
    from app.database import engine
    from sqlalchemy import text
    
    try:
        # Check database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Check background services
        bg_health = background_manager.health_check()
        
        return {
            "status": "healthy" if bg_health["healthy"] else "degraded",
            "database": "healthy",
            "background_services": bg_health,
            "timestamp": bg_health["timestamp"]
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now(pytz.UTC).isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
