# City Pulse - Real-Time Life Pulse of a City

A full-stack web application that visualizes the real-time emotional and environmental "pulse" of a city via a live-to-refresh dashboard using open-source models and free public data sources.

## 🎯 Features

- **Real-time Emotion Analysis**: Uses Hugging Face's `j-hartmann/emotion-english-distilroberta-base` model for emotion detection
- **City Zone Monitoring**: Tracks mood indices across different city zones with interactive maps
- **Environmental Data Integration**: Collects air quality, weather, and noise data
- **Anomaly Detection**: Identifies unusual patterns in mood and environmental data
- **Forecasting**: Predicts mood trends up to 24 hours ahead
- **Interactive Dashboard**: Real-time map visualization with ECharts integration

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL + TimescaleDB**: Time-series database with PostGIS for geospatial data
- **Redis**: Caching and real-time data streaming
- **SQLAlchemy**: Database ORM with GeoAlchemy2 for spatial operations
- **Hugging Face Transformers**: Emotion detection using DistilRoBERTa model
- **Scikit-learn**: Machine learning for forecasting and anomaly detection

### Frontend (Next.js)
- **Next.js 14**: React framework with TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **Mapbox GL**: Interactive maps with custom overlays
- **ECharts**: Data visualization and charts
- **Lucide React**: Beautiful icons

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Clone and Setup
```bash
git clone <repository-url>
cd pulse_city_visual
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
# Backend
DATABASE_URL=postgresql://city_pulse_user:city_pulse_password@localhost:5432/city_pulse
REDIS_URL=redis://localhost:6379

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Or start services individually
docker-compose up postgres redis -d
docker-compose up backend -d
docker-compose up frontend -d
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 Data Flow

1. **Data Collection**: Mock social media posts and environmental data are generated every 10 seconds and 5 minutes respectively
2. **Emotion Processing**: Text content is analyzed using the Hugging Face emotion detection model
3. **Data Storage**: Processed data is stored in TimescaleDB with spatial indexing
4. **Real-time Updates**: Frontend polls the API every 30 seconds for live updates
5. **Anomaly Detection**: ML models continuously monitor for unusual patterns
6. **Forecasting**: Linear regression models predict future mood trends

## 🗺️ City Zones

The application comes pre-configured with 5 NYC boroughs:
- Manhattan
- Brooklyn
- Queens
- Bronx
- Staten Island

Each zone has defined geographic boundaries and generates mock data for demonstration.

## 🔧 Configuration

### Backend Configuration
- **Emotion Model**: Configured to use `j-hartmann/emotion-english-distilroberta-base`
- **Data Collection Intervals**: Social posts (10s), Environmental data (5m)
- **Database**: TimescaleDB with PostGIS extensions
- **Caching**: Redis for model caching and session management

### Frontend Configuration
- **Map Provider**: Mapbox GL with OpenStreetMap tiles
- **Charts**: ECharts for data visualization
- **Styling**: Tailwind CSS with custom color schemes
- **Responsive Design**: Mobile-first approach

## 📈 API Endpoints

### Current Data
- `GET /api/now` - Current city pulse overview
- `GET /api/recent-posts` - Recent social media posts
- `GET /api/environmental-overview` - Environmental data summary

### Zone-specific
- `GET /api/zone/{id}` - Zone details and statistics
- `GET /api/zone/{id}/series` - Time series data for a zone
- `GET /api/zone/{id}/posts` - Posts from a specific zone

### Forecasting
- `GET /api/forecast/zone/{id}` - Zone mood forecast
- `GET /api/forecast/city` - City-wide forecast

### Alerts & Anomalies
- `GET /api/alerts/mood-anomalies` - Mood-related anomalies
- `GET /api/alerts/environmental-anomalies` - Environmental anomalies
- `GET /api/alerts/summary` - Alerts summary

## 🧪 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Management
```bash
# Connect to database
docker-compose exec postgres psql -U city_pulse_user -d city_pulse

# View tables
\dt

# Check TimescaleDB hypertables
SELECT * FROM timescaledb_information.hypertables;
```

## 🔍 Monitoring & Debugging

### Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs postgres
```

### Health Checks
- **Backend**: http://localhost:8000/health
- **Database**: Built-in health checks in docker-compose
- **Redis**: Built-in health checks in docker-compose

## 🚀 Production Deployment

### Environment Variables
- Set production database credentials
- Configure Redis connection strings
- Set appropriate CORS origins
- Configure Mapbox access token

### Scaling
- Use multiple backend instances behind a load balancer
- Implement Redis clustering for high availability
- Use TimescaleDB read replicas for analytics

### Security
- Enable HTTPS
- Implement API rate limiting
- Add authentication and authorization
- Secure database connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Hugging Face** for the emotion detection model
- **TimescaleDB** for time-series database capabilities
- **OpenStreetMap** for map data
- **ECharts** for data visualization

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the logs for debugging information

---

**Note**: This is a demonstration application using mock data. For production use, integrate with real social media APIs and environmental data sources.
