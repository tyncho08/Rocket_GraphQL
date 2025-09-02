#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log files
BACKEND_LOG="backend/backend.log"
FRONTEND_LOG="frontend/frontend.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting LendPro Platform${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}Port $port is in use. Attempting to free it...${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null
        sleep 2
        if check_port $port; then
            echo -e "${RED}Failed to free port $port. Please manually stop the process.${NC}"
            return 1
        else
            echo -e "${GREEN}Successfully freed port $port${NC}"
        fi
    fi
    return 0
}

# Check and kill processes on required ports
echo -e "${BLUE}Checking ports...${NC}"
if ! kill_port 4001; then
    echo -e "${RED}Cannot start frontend - port 4001 is occupied${NC}"
    exit 1
fi
if ! kill_port 5001; then
    echo -e "${RED}Cannot start backend - port 5001 is occupied${NC}"
    exit 1
fi

# Check for required dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node --version | cut -d. -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version 18+ is required. Current version: $(node --version)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check for .NET
if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}.NET SDK is not installed. Please install .NET Core 3.1 from https://dotnet.microsoft.com${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .NET SDK found${NC}"

# Check for pnpm or install it
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found. Installing pnpm...${NC}"
    npm install -g pnpm
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}Failed to install pnpm. Please install manually: npm install -g pnpm${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ pnpm installed successfully${NC}"
else
    echo -e "${GREEN}✓ pnpm $(pnpm --version)${NC}"
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}Warning: PostgreSQL client not found. Make sure PostgreSQL is running.${NC}"
else
    echo -e "${GREEN}✓ PostgreSQL client found${NC}"
fi

# Create log files if they don't exist
mkdir -p backend
mkdir -p frontend
touch $BACKEND_LOG
touch $FRONTEND_LOG

# Start PostgreSQL database (if docker is available)
if command -v docker &> /dev/null; then
    echo -e "${BLUE}Checking PostgreSQL database...${NC}"
    if ! docker ps | grep -q "postgres-lendpro"; then
        echo -e "${YELLOW}Starting PostgreSQL database...${NC}"
        docker run -d \
            --name postgres-lendpro \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=password \
            -e POSTGRES_DB=MortgagePlatform \
            -p 5432:5432 \
            postgres:13 > /dev/null 2>&1
        
        sleep 5
        
        # Initialize database if needed
        if [ -f "database/init.sql" ]; then
            echo -e "${BLUE}Initializing database...${NC}"
            docker exec -i postgres-lendpro psql -U postgres -d MortgagePlatform < database/init.sql > /dev/null 2>&1
            echo -e "${GREEN}✓ Database initialized${NC}"
        fi
    else
        echo -e "${GREEN}✓ PostgreSQL database already running${NC}"
    fi
fi

# Start Backend
echo -e "${BLUE}Starting Backend API...${NC}"
cd backend/MortgagePlatform.API

# Restore dependencies
echo -e "${YELLOW}Restoring backend dependencies...${NC}"
dotnet restore > /dev/null 2>&1

# Start the backend
nohup dotnet run --urls "http://localhost:5001" > ../../$BACKEND_LOG 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5001/api/auth/me > /dev/null; then
        echo -e "${GREEN}✓ Backend API started successfully on port 5001${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Backend failed to start. Check $BACKEND_LOG for errors${NC}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

# Start Frontend
echo -e "${BLUE}Starting Frontend...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    pnpm install --silent
fi

# Start the frontend
nohup pnpm start > ../$FRONTEND_LOG 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:4001 > /dev/null; then
        echo -e "${GREEN}✓ Frontend started successfully on port 4001${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Frontend failed to start. Check $FRONTEND_LOG for errors${NC}"
        kill $FRONTEND_PID 2>/dev/null
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    sleep 2
done

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ LendPro Platform Started Successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Frontend URL:${NC} http://localhost:4001"
echo -e "${GREEN}Backend API:${NC} http://localhost:5001/api"
echo ""
echo -e "${BLUE}Test Accounts:${NC}"
echo -e "Regular User: ${YELLOW}john.doe@email.com${NC} / ${YELLOW}user123${NC}"
echo -e "Admin User: ${YELLOW}admin@mortgageplatform.com${NC} / ${YELLOW}admin123${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "Backend: ${YELLOW}$BACKEND_LOG${NC}"
echo -e "Frontend: ${YELLOW}$FRONTEND_LOG${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Save PIDs for stop script
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Wait for user to stop
wait