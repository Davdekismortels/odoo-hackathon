#!/bin/bash

# Traveloop — One-Click Startup Script 🚀

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}====================================================${NC}"
echo -e "${BLUE}${BOLD}          TRAVELOOP — STARTUP SEQUENCE              ${NC}"
echo -e "${BLUE}${BOLD}====================================================${NC}"

# 1. Environment Check
if [ ! -f .env ]; then
    echo -e "⚠️  No .env file found. Creating from template..."
    if [ -f apps/api/.env.example ]; then
        cp apps/api/.env.example .env
        echo -e "${GREEN}✅ .env created. Please check values if DB connection fails.${NC}"
    else
        echo -e "❌ apps/api/.env.example not found. Manual setup required."
    fi
fi

# 2. Dependency Check
if [ ! -d "node_modules" ]; then
    echo -e "📦 Installing dependencies (first run)..."
    npm install
fi

# 3. Database Sync
echo -e "🗄️  Syncing database schema..."
npm run db:migrate

# 4. Shared Package Build
echo -e "🔨 Building shared packages..."
npm run build --workspace=packages/shared

# 5. Launch
echo -e "${GREEN}${BOLD}🚀 All systems ready! Launching API and Web...${NC}"
echo -e "📡 API: http://localhost:4000"
echo -e "🌐 Web: http://localhost:5173"
echo -e "${BLUE}----------------------------------------------------${NC}"

npm run dev
