#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping LendPro GraphQL Platform...${NC}"

# Kill processes by port
echo -e "${BLUE}📋 Killing processes on port 4300 (frontend)...${NC}"
FRONTEND_PIDS=$(lsof -ti:4300 2>/dev/null)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "$FRONTEND_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}   ✅ Frontend stopped${NC}"
else
    echo -e "${YELLOW}   ⚠️  No processes running on port 4300${NC}"
fi

echo -e "${BLUE}📋 Killing processes on port 5005 (backend)...${NC}"
BACKEND_PIDS=$(lsof -ti:5005 2>/dev/null)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "$BACKEND_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}   ✅ Backend stopped${NC}"
else
    echo -e "${YELLOW}   ⚠️  No processes running on port 5005${NC}"
fi

# Also kill any dotnet or pnpm processes related to our app
echo -e "${BLUE}📋 Cleaning dotnet and pnpm processes...${NC}"
DOTNET_PIDS=$(pgrep -f "dotnet run" 2>/dev/null)
if [ ! -z "$DOTNET_PIDS" ]; then
    echo "$DOTNET_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}   ✅ Dotnet processes stopped${NC}"
fi

PNPM_PIDS=$(pgrep -f "pnpm start" 2>/dev/null)
if [ ! -z "$PNPM_PIDS" ]; then
    echo "$PNPM_PIDS" | xargs kill -9 2>/dev/null
    echo -e "${GREEN}   ✅ Pnpm processes stopped${NC}"
fi

# Wait a moment and verify ports are free
sleep 2

echo -e "${BLUE}🔍 Verifying that ports are free...${NC}"
if lsof -i:4300 > /dev/null 2>&1; then
    echo -e "${RED}   ❌ Port 4300 is still in use${NC}"
else
    echo -e "${GREEN}   ✅ Port 4300 is free${NC}"
fi

if lsof -i:5005 > /dev/null 2>&1; then
    echo -e "${RED}   ❌ Port 5005 is still in use${NC}"
else
    echo -e "${GREEN}   ✅ Port 5005 is free${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Application stopped successfully!${NC}"
echo -e "${BLUE}💡 To start again, run: ./run-app.sh${NC}"