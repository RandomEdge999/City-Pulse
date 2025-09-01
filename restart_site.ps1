# City Pulse Site Restart Script
# Run this script to completely restart your City Pulse application

Write-Host "🌆 City Pulse Site Restart Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$MaxAttempts = 30
    )
    
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Service not ready yet
        }
        
        Write-Host "  Attempt $i/$MaxAttempts - Waiting..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ $ServiceName failed to start after $MaxAttempts attempts" -ForegroundColor Red
    return $false
}

# Main restart process
Write-Host "🔄 Starting City Pulse restart process..." -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
if (-not (Test-DockerRunning)) {
    Write-Host "❌ Docker is not running! Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Step 1: Stop all services
Write-Host "🛑 Step 1: Stopping all services..." -ForegroundColor Yellow
docker-compose down
Write-Host "✅ All services stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Clean up Docker (optional - uncomment if you want a completely fresh start)
$cleanup = Read-Host "🧹 Do you want to clean up Docker images and volumes? (y/N)"
if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    Write-Host "🧹 Cleaning up Docker images and volumes..." -ForegroundColor Yellow
    docker system prune -a -f --volumes
    Write-Host "✅ Docker cleanup completed" -ForegroundColor Green
    Write-Host ""
}

# Step 3: Start all services
Write-Host "🚀 Step 2: Starting all services..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ All services started" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for services to be ready
Write-Host "⏳ Step 3: Waiting for services to be ready..." -ForegroundColor Yellow
Write-Host ""

# Wait for PostgreSQL
if (-not (Wait-ForService -ServiceName "PostgreSQL" -Url "http://localhost:5432")) {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}

# Wait for Redis
if (-not (Wait-ForService -ServiceName "Redis" -Url "http://localhost:6379")) {
    Write-Host "❌ Redis failed to start" -ForegroundColor Red
    exit 1
}

# Wait for Backend API
if (-not (Wait-ForService -ServiceName "Backend API" -Url "http://localhost:8000/api/health")) {
    Write-Host "❌ Backend API failed to start" -ForegroundColor Red
    exit 1
}

# Wait for Frontend
if (-not (Wait-ForService -ServiceName "Frontend" -Url "http://localhost:3000")) {
    Write-Host "❌ Frontend failed to start" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 City Pulse Site Restart Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Display service status
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🌐 Access your site at:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White

Write-Host ""
Write-Host "🔍 To check logs, run:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f [service_name]" -ForegroundColor Gray
Write-Host "   Example: docker-compose logs -f frontend" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Your City Pulse site is now running!" -ForegroundColor Green
Read-Host "Press Enter to exit"
