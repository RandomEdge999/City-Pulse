@echo off
echo 🌆 City Pulse Site Restart Script
echo =================================
echo.

echo 🔄 Starting City Pulse restart process...
echo.

echo 🛑 Step 1: Stopping all services...
docker-compose down
echo ✅ All services stopped
echo.

echo 🚀 Step 2: Starting all services...
docker-compose up -d
echo ✅ All services started
echo.

echo ⏳ Step 3: Waiting for services to be ready...
echo Waiting 30 seconds for services to start...
timeout /t 30 /nobreak >nul

echo.
echo 🎉 City Pulse Site Restart Complete!
echo =====================================
echo.

echo 📊 Service Status:
docker-compose ps

echo.
echo 🌐 Access your site at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs

echo.
echo ✅ Your City Pulse site is now running!
pause
