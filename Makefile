.PHONY: help start stop restart logs clean seed test build-prod deploy

# Default target
help:
	@echo "City Pulse - Development Commands"
	@echo "=================================="
	@echo ""
	@echo "Development:"
	@echo "  start      - Start all services"
	@echo "  stop       - Stop all services"
	@echo "  restart    - Restart all services"
	@echo "  logs       - View logs for all services"
	@echo "  logs-backend - View backend logs"
	@echo "  logs-frontend - View frontend logs"
	@echo "  logs-db    - View database logs"
	@echo ""
	@echo "Data Management:"
	@echo "  seed       - Seed database with sample data"
	@echo "  clean      - Remove all containers and volumes"
	@echo ""
	@echo "Production:"
	@echo "  build-prod - Build production images"
	@echo "  deploy     - Deploy production stack"
	@echo ""
	@echo "Utilities:"
	@echo "  status     - Check service status"
	@echo "  shell      - Open shell in backend container"
	@echo "  db-shell   - Open database shell"

# Development commands
start:
	@echo "🚀 Starting City Pulse services..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Services started! Frontend: http://localhost:3000, Backend: http://localhost:8000"

stop:
	@echo "🛑 Stopping City Pulse services..."
	docker-compose down

restart:
	@echo "🔄 Restarting City Pulse services..."
	docker-compose restart

logs:
	@echo "📊 Viewing logs for all services..."
	docker-compose logs -f

logs-backend:
	@echo "📊 Viewing backend logs..."
	docker-compose logs -f backend

logs-frontend:
	@echo "📊 Viewing frontend logs..."
	docker-compose logs -f frontend

logs-db:
	@echo "📊 Viewing database logs..."
	docker-compose logs -f postgres

# Data management
seed:
	@echo "🌱 Seeding database with sample data..."
	docker-compose exec backend python scripts/seed_data.py

clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Production commands
build-prod:
	@echo "🏗️ Building production images..."
	docker-compose -f docker-compose.prod.yml build

deploy:
	@echo "🚀 Deploying production stack..."
	docker-compose -f docker-compose.prod.yml up -d

# Utility commands
status:
	@echo "🏥 Checking service status..."
	@echo "Database:"
	docker-compose exec -T postgres pg_isready -U city_pulse_user -d city_pulse || echo "❌ Database not ready"
	@echo "Backend:"
	curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Backend healthy" || echo "❌ Backend not ready"
	@echo "Frontend:"
	curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend ready" || echo "❌ Frontend not ready"

shell:
	@echo "🐚 Opening shell in backend container..."
	docker-compose exec backend bash

db-shell:
	@echo "🗄️ Opening database shell..."
	docker-compose exec postgres psql -U city_pulse_user -d city_pulse

# Environment setup
setup:
	@echo "⚙️ Setting up development environment..."
	@if [ ! -f .env ]; then \
		if [ -f env.example ]; then \
			cp env.example .env; \
			echo "✅ Created .env file from env.example"; \
			echo "📝 Please edit .env file with your configuration"; \
		else \
			echo "❌ env.example file not found"; \
			exit 1; \
		fi; \
	else \
		echo "✅ .env file already exists"; \
	fi

# Quick development cycle
dev: setup start
	@echo "🎉 Development environment ready!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔌 Backend: http://localhost:8000"
	@echo "📚 API Docs: http://localhost:8000/docs"
