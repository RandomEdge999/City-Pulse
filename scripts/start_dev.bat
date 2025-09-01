@echo off
REM Development startup script for City Pulse (Windows)
echo 🚀 Starting City Pulse in development mode...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found. Creating from example...
    if exist env.example (
        copy env.example .env >nul
        echo ✅ Created .env file from env.example
        echo 📝 Please edit .env file with your configuration before continuing
        echo    - Set your Mapbox token: NEXT_PUBLIC_MAPBOX_TOKEN
        echo    - Adjust database credentials if needed
        pause
    ) else (
        echo ❌ env.example file not found. Please create a .env file manually.
        pause
        exit /b 1
    )
)

echo 🔧 Starting services with Docker Compose...

REM Start services
docker-compose up -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo 🏥 Checking service health...

REM Check database
docker-compose exec -T postgres pg_isready -U city_pulse_user -d city_pulse >nul 2>&1
if errorlevel 1 (
    echo ❌ Database is not ready
    docker-compose logs postgres
    pause
    exit /b 1
) else (
    echo ✅ Database is ready
)

REM Check Redis
docker-compose exec -T redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ❌ Redis is not ready
    docker-compose logs redis
    pause
    exit /b 1
) else (
    echo ✅ Redis is ready
)

REM Check backend
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend API is not ready
    docker-compose logs backend
    pause
    exit /b 1
) else (
    echo ✅ Backend API is ready
)

REM Check frontend
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend is not ready
    docker-compose logs frontend
    pause
    exit /b 1
) else (
    echo ✅ Frontend is ready
)

echo.
echo 🎉 City Pulse is now running!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo 🗄️  Database: localhost:5432
echo 🔴 Redis: localhost:6379
echo.
echo 📊 To view logs: docker-compose logs -f [service_name]
echo 🛑 To stop: docker-compose down
echo 🔄 To restart: docker-compose restart
echo.
echo 🌱 To seed initial data, run: docker-compose exec backend python scripts/seed_data.py
pause
