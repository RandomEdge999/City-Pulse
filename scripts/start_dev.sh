#!/bin/bash

# Development startup script for City Pulse
echo "🚀 Starting City Pulse in development mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from example..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ Created .env file from env.example"
        echo "📝 Please edit .env file with your configuration before continuing"
        echo "   - Set your Mapbox token: NEXT_PUBLIC_MAPBOX_TOKEN"
        echo "   - Adjust database credentials if needed"
        read -p "Press Enter to continue after editing .env file..."
    else
        echo "❌ env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

# Load environment variables
source .env

# Check if Mapbox token is set
if [ "$NEXT_PUBLIC_MAPBOX_TOKEN" = "your_mapbox_token_here" ] || [ -z "$NEXT_PUBLIC_MAPBOX_TOKEN" ]; then
    echo "⚠️  Mapbox token not set. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env file"
    echo "   Get a free token from: https://account.mapbox.com/access-tokens/"
    exit 1
fi

echo "🔧 Starting services with Docker Compose..."

# Start services
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check database
if docker-compose exec -T postgres pg_isready -U city_pulse_user -d city_pulse > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready"
    docker-compose logs postgres
    exit 1
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
    docker-compose logs redis
    exit 1
fi

# Check backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is ready"
else
    echo "❌ Backend API is not ready"
    docker-compose logs backend
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend is not ready"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 City Pulse is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🗄️  Database: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📊 To view logs: docker-compose logs -f [service_name]"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo ""
echo "🌱 To seed initial data, run: docker-compose exec backend python scripts/seed_data.py"
