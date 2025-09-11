.PHONY: help up down restart logs clean migrate seed reset-db dev build lint format test pgadmin

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Docker commands
up: ## Start PostgreSQL database
	@echo "🚀 Starting database..."
	@docker-compose up -d postgres
	@echo "✅ Database is running on port 5432"
	@echo "   Connection: postgresql://postgres:postgres@localhost:5432/miguelsoro"

down: ## Stop all services
	@echo "⏹️  Stopping services..."
	@docker-compose down
	@echo "✅ Services stopped"

restart: ## Restart all services
	@echo "🔄 Restarting services..."
	@docker-compose restart
	@echo "✅ Services restarted"

logs: ## Show database logs
	@docker-compose logs -f postgres

clean: ## Remove containers and volumes (WARNING: This will delete all data)
	@echo "⚠️  This will delete all database data. Are you sure? (y/N)" && read ans && [ $${ans:-N} = y ]
	@docker-compose down -v
	@docker system prune -f
	@echo "✅ Cleanup completed"

# Database commands
migrate: ## Run database migrations
	@echo "🔄 Running migrations..."
	@npx prisma migrate dev
	@echo "✅ Migrations completed"

seed: ## Seed the database with initial data
	@echo "🌱 Seeding database..."
	@npx prisma db seed
	@echo "✅ Database seeded"

reset-db: ## Reset database (migrate + seed)
	@echo "🔄 Resetting database..."
	@npx prisma migrate reset --force
	@echo "✅ Database reset completed"

# Development commands
dev: up ## Start development server with database
	@echo "🚀 Starting development server..."
	@npm run dev

build: ## Build the application
	@echo "🏗️  Building application..."
	@npm run build
	@echo "✅ Build completed"

lint: ## Run linter
	@echo "🔍 Running linter..."
	@npm run lint
	@echo "✅ Linting completed"

format: ## Format code
	@echo "💅 Formatting code..."
	@npm run format
	@echo "✅ Code formatted"

# Optional services
pgadmin: ## Start pgAdmin (database management UI)
	@echo "🚀 Starting pgAdmin..."
	@docker-compose --profile pgadmin up -d
	@echo "✅ pgAdmin is running on http://localhost:5050"
	@echo "   Email: admin@miguelsoro.com"
	@echo "   Password: admin123"
	@echo ""
	@echo "Admin user credentials (from .env.local):"
	@echo "   Email: $$(grep ADMIN_EMAIL .env.local | cut -d'=' -f2)"
	@echo "   Password: $$(grep ADMIN_PASSWORD .env.local | cut -d'=' -f2)"

# Quick setup for new developers
setup: ## Complete setup for new developers
	@echo "🚀 Setting up development environment..."
	@echo "1. Installing dependencies..."
	@npm install
	@echo "2. Starting database..."
	@make up
	@echo "3. Waiting for database to be ready..."
	@sleep 5
	@echo "4. Generating Prisma client..."
	@npx prisma generate
	@echo "5. Running migrations..."
	@make migrate
	@echo "6. Seeding database..."
	@make seed
	@echo "✅ Setup completed! Run 'make dev' to start development server"

# Status check
status: ## Check services status
	@echo "📊 Services status:"
	@docker-compose ps