# LendPro - Complete Mortgage Platform

LendPro is a unified mortgage platform that combines consumer-facing property search and mortgage tools with administrative loan management capabilities. This platform is the result of merging RocketFind (consumer app) and RocketAdmin (admin app) into a single, role-based application.

## Features

### For All Users
- **Property Search**: Browse thousands of properties with advanced filtering
- **Mortgage Calculators**: Calculate payments, refinancing options, and rent vs buy comparisons
- **Market Trends**: Analyze real estate market data and price trends

### For Authenticated Users
- **User Dashboard**: Track loan applications and manage profile
- **Loan Applications**: Apply for mortgages directly through the platform
- **Favorite Properties**: Save and track properties of interest

### For Admin Users
- **Admin Dashboard**: Overview of system metrics and recent activity
- **Loan Management**: Review, approve, and manage all loan applications
- **User Management**: Manage user accounts and permissions
- **Dual Dashboard Access**: Admin users can access both admin and regular user dashboards

## Architecture

```
MergedApp-LendPro/
├── backend/                    # .NET Core 3.1 API (port 5001)
├── frontend/                   # Angular 19.2 (port 4001)
├── database/                   # PostgreSQL initialization scripts
├── start.sh                    # Unified startup script
├── stop.sh                     # Clean shutdown script
└── README.md                   # This file
```

## Prerequisites

- Node.js 18+ 
- .NET Core SDK 3.1
- PostgreSQL 13+ (or Docker for containerized database)
- pnpm (will be auto-installed if missing)

## Quick Start

1. **Clone and navigate to the project**:
   ```bash
   cd MergedApp-LendPro
   ```

2. **Start the application**:
   ```bash
   ./start.sh
   ```

   The startup script will:
   - Check and install dependencies
   - Free up required ports (4001, 5001)
   - Start PostgreSQL database (if using Docker)
   - Initialize the database schema
   - Start the backend API
   - Start the frontend application

3. **Access the application**:
   - Frontend: http://localhost:4001
   - Backend API: http://localhost:5001/api

4. **Login with test accounts**:
   - **Regular User**: 
     - Email: `john.doe@email.com`
     - Password: `user123`
   - **Admin User**: 
     - Email: `admin@mortgageplatform.com`
     - Password: `admin123`

## Navigation Structure

### Header Navigation
- **Always Visible**: Home Search, Mortgage Tools
- **Authenticated Users**: Dashboard
- **Admin Users**: Admin Dashboard + User Dashboard
- **Auth Links**: Login/Logout

### Home Page Features
- **Public Access**: Home Search, Mortgage Tools, Market Trends
- **Authenticated Users**: Loan Application
- **Admin Users**: Loan Management, User Management

## Development

### Frontend Development
```bash
cd frontend
pnpm install
pnpm start         # Development server on port 4001
pnpm build         # Production build
pnpm test          # Run tests
pnpm lint          # Run linter
pnpm typecheck     # TypeScript type checking
```

### Backend Development
```bash
cd backend/MortgagePlatform.API
dotnet restore     # Restore dependencies
dotnet run         # Run on port 5001
dotnet build       # Build the project
dotnet test        # Run tests (if available)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Properties (Public + Auth)
- `GET /api/properties/search` - Search properties
- `GET /api/properties/{id}` - Get property details
- `POST /api/properties/{id}/favorite` - Toggle favorite (auth required)
- `GET /api/properties/favorites` - Get user favorites (auth required)

### Loans (Auth Required)
- `POST /api/loans` - Create loan application
- `GET /api/loans/my` - Get user's applications
- `GET /api/loans/{id}` - Get specific loan (owner or admin)
- `GET /api/loans` - Get all loans with pagination (admin only)
- `PUT /api/loans/{id}/status` - Update loan status (admin only)

### Admin (Admin Role Required)
- `GET /api/admin/dashboard-metrics` - Get dashboard metrics
- `GET /api/admin/users` - Get all users with pagination
- `PUT /api/admin/users/{id}/role` - Update user role

### Mortgage Tools (Public)
- `POST /api/mortgage/calculate` - Calculate mortgage payments
- `POST /api/mortgage/preapproval` - Check pre-approval eligibility

## Configuration

### Frontend Configuration
- Port: 4001 (configured in `angular.json`)
- API URL: `http://localhost:5001/api` (in `environment.ts`)
- App Name: "LendPro - Complete Mortgage Platform"

### Backend Configuration
- Port: 5001 (configured in `launchSettings.json`)
- CORS: Allows `http://localhost:4001`
- Database: PostgreSQL connection in `appsettings.json`
- JWT Authentication: Configured in `Startup.cs`

## Stopping the Application

To stop all services:
```bash
./stop.sh
```

This will:
- Stop the frontend server
- Stop the backend API
- Stop the PostgreSQL container (if using Docker)
- Clean up any remaining processes
- Remove empty log files

## Troubleshooting

### Port Already in Use
The start script automatically attempts to free ports 4001 and 5001. If issues persist:
```bash
# Manually kill processes on ports
lsof -ti :4001 | xargs kill -9
lsof -ti :5001 | xargs kill -9
```

### Database Connection Issues
1. Ensure PostgreSQL is running on port 5432
2. Check credentials in `backend/MortgagePlatform.API/appsettings.json`
3. Verify database name is "MortgagePlatform"

### Dependency Issues
- Frontend: Delete `node_modules` and run `pnpm install`
- Backend: Delete `bin` and `obj` folders, then run `dotnet restore`

### Log Files
- Backend logs: `backend/backend.log`
- Frontend logs: `frontend/frontend.log`

## Security Notes

- Passwords are hashed using BCrypt
- JWT tokens for authentication
- Role-based access control (User/Admin)
- CORS configured for frontend origin only
- Session timeout: 1 hour

## License

This project is proprietary software. All rights reserved.