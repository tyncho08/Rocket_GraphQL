#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to clean up processes on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up ports and processes...${NC}"
    
    # Kill processes by port
    echo -e "${BLUE}📋 Killing processes on port 4300 (frontend)...${NC}"
    lsof -ti:4300 | xargs kill -9 2>/dev/null || true
    
    echo -e "${BLUE}📋 Killing processes on port 5005 (backend)...${NC}"
    lsof -ti:5005 | xargs kill -9 2>/dev/null || true
    
    # Also kill any dotnet or pnpm processes related to our app
    pkill -f "dotnet run" 2>/dev/null || true
    pkill -f "pnpm start" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    echo -e "${GREEN}👋 Application closed successfully${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🚀 Starting LendPro GraphQL Platform...${NC}"

# Kill existing processes first
echo -e "${YELLOW}🧹 Cleaning existing processes...${NC}"
lsof -ti:4300 | xargs kill -9 2>/dev/null || true
lsof -ti:5005 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo -e "${BLUE}🔧 Starting GraphQL backend...${NC}"
cd backend-graphql/MortgagePlatform.API
dotnet restore > /dev/null 2>&1

# Start backend in background but keep track of its PID
dotnet run > ../../backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5005/graphql > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ready at http://localhost:5005${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Error: Backend could not start after 60 seconds${NC}"
        cleanup
        exit 1
    fi
    sleep 2
done

# Start frontend
echo -e "${BLUE}🎨 Starting Angular frontend...${NC}"
cd frontend
pnpm install --frozen-lockfile > /dev/null 2>&1

# Start frontend in background but keep track of its PID  
pnpm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
echo -e "${YELLOW}⏳ Waiting for frontend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:4300 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend ready at http://localhost:4300${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Warning: Frontend taking longer than expected${NC}"
        break
    fi
    sleep 2
done

# Display service information
echo ""
echo -e "${GREEN}🎉 LendPro GraphQL Platform started successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 Angular Frontend:${NC}  http://localhost:4300"
echo -e "${GREEN}🔗 GraphQL Playground:${NC} http://localhost:5005/graphql"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}👤 Test credentials:${NC}"
echo -e "   Admin: admin@mortgageplatform.com / admin123"
echo -e "   User: john.doe@email.com / user123"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}⚡ Application is running...${NC}"
echo -e "${YELLOW}🔴 Press Ctrl+C to stop all services${NC}"
echo ""

# Keep the script running and wait for user to press Ctrl+C
# Monitor the processes to make sure they're still running
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend closed unexpectedly${NC}"
        cleanup
        exit 1
    fi
    
    # Check if frontend is still running  
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend closed unexpectedly${NC}"
        cleanup
        exit 1
    fi
    
    # Check if ports are still occupied
    if ! lsof -i:5005 > /dev/null 2>&1; then
        echo -e "${RED}❌ Port 5005 (backend) is no longer in use${NC}"
        cleanup  
        exit 1
    fi
    
    sleep 5
done