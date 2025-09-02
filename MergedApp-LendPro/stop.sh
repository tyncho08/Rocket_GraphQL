#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Stopping LendPro Platform${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to stop a process
stop_process() {
    local name=$1
    local pid_file=$2
    local port=$3
    
    if [ -f "$pid_file" ]; then
        PID=$(cat $pid_file)
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}Stopping $name (PID: $PID)...${NC}"
            kill $PID 2>/dev/null
            sleep 2
            if kill -0 $PID 2>/dev/null; then
                echo -e "${YELLOW}Force stopping $name...${NC}"
                kill -9 $PID 2>/dev/null
            fi
            echo -e "${GREEN}✓ $name stopped${NC}"
        else
            echo -e "${YELLOW}$name process not found (PID: $PID)${NC}"
        fi
        rm -f $pid_file
    else
        echo -e "${YELLOW}$name PID file not found${NC}"
    fi
    
    # Also check if port is still in use
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}Port $port still in use, cleaning up...${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓ Port $port freed${NC}"
    fi
}

# Stop Frontend
stop_process "Frontend" ".frontend.pid" 4001

# Stop Backend
stop_process "Backend" ".backend.pid" 5001

# Stop PostgreSQL if running in Docker
if command -v docker &> /dev/null; then
    if docker ps | grep -q "postgres-lendpro"; then
        echo -e "${YELLOW}Stopping PostgreSQL database...${NC}"
        docker stop postgres-lendpro > /dev/null 2>&1
        docker rm postgres-lendpro > /dev/null 2>&1
        echo -e "${GREEN}✓ PostgreSQL database stopped${NC}"
    fi
fi

# Clean up any remaining Node.js processes on our ports
echo -e "${BLUE}Cleaning up any remaining processes...${NC}"
pkill -f "ng serve.*4001" 2>/dev/null
pkill -f "dotnet.*5001" 2>/dev/null

# Remove log files if they're empty
if [ -f "backend/backend.log" ] && [ ! -s "backend/backend.log" ]; then
    rm -f "backend/backend.log"
fi
if [ -f "frontend/frontend.log" ] && [ ! -s "frontend/frontend.log" ]; then
    rm -f "frontend/frontend.log"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ LendPro Platform Stopped Successfully${NC}"
echo -e "${BLUE}========================================${NC}"