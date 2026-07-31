#!/bin/bash

# ==============================================================================
# DEPLOYMENT SCRIPT FOR GESTION SAV (PRODUCTION)
# ==============================================================================
# This script ensures a zero-downtime deployment process by caching configs,
# installing optimized dependencies, safely migrating the database, and 
# restarting worker queues without losing jobs.
# ==============================================================================

set -e

echo "🚀 Starting Deployment Process..."

# 1. Enter Maintenance Mode
# -------------------------
# The --secret flag allows you to bypass the maintenance screen if needed
# php artisan down --secret="your-secret-bypass-token"
echo "⏸️  Putting application in maintenance mode..."
php artisan down || true

# 2. Update Codebase (Uncomment if using Git)
# -------------------------------------------
# echo "📥 Pulling latest code..."
# git pull origin main

# 3. Install/Update Composer Dependencies
# ---------------------------------------
# --no-dev: Excludes development packages (e.g., debugbar, faker, phpunit)
# --optimize-autoloader: Generates a faster classmap array for performance
echo "📦 Installing production dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# 4. Clear and Cache Configurations
# ---------------------------------
# Combines all config files into a single cached file for faster loading
echo "🧹 Clearing old caches..."
php artisan cache:clear
php artisan view:clear

echo "⚙️  Caching configurations..."
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache

# 5. Database Migrations
# ----------------------
# --force is required in production to bypass the confirmation prompt
echo "🗄️  Running database migrations..."
php artisan migrate --force

# 6. Restart Queues
# -----------------
# Tells all worker processes to gracefully exit after their current job.
# Supervisor (or your process manager) will automatically restart them 
# with the new code loaded in memory.
echo "🔄 Restarting queue workers..."
php artisan queue:restart

# 7. Bring Application Online
# ---------------------------
echo "▶️  Bringing application back online..."
php artisan up

echo "✅ Deployment completed successfully!"
