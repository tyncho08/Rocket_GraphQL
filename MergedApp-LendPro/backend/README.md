# Mortgage Platform Backend

This is the backend API for the Mortgage Platform built with .NET Core 3.1.

## Prerequisites

- .NET Core 3.1 SDK
- PostgreSQL database server
- Visual Studio Code or Visual Studio (optional)

## Getting Started

### 1. Database Setup

First, ensure PostgreSQL is installed and running. Then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mortgage_platform;

# Exit psql
\q

# Run initialization script
psql -U postgres -d mortgage_platform -f ../database/init.sql
```

### 2. Configuration

Update the connection string in `appsettings.json` if needed:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=mortgage_platform;Username=postgres;Password=your_password"
  }
}
```

### 3. Install Dependencies

```bash
dotnet restore
```

### 4. Build the Application

```bash
dotnet build
```

### 5. Run the Application

```bash
dotnet run --project MortgagePlatform.API
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties/search` - Search properties
- `GET /api/properties/{id}` - Get property details
- `POST /api/properties/{id}/favorite` - Toggle favorite property
- `GET /api/properties/favorites` - Get user favorites

### Mortgage Tools
- `POST /api/mortgage/calculate` - Calculate mortgage payments
- `POST /api/mortgage/preapproval` - Check pre-approval eligibility

### Loan Applications
- `POST /api/loans` - Create loan application
- `GET /api/loans/{id}` - Get loan application
- `GET /api/loans/my` - Get user's loan applications
- `GET /api/loans` - Get all loan applications (Admin only)
- `PUT /api/loans/{id}/status` - Update loan status (Admin only)

## Environment Variables

You can override settings using environment variables:

- `ASPNETCORE_ENVIRONMENT` - Environment (Development, Production)
- `ConnectionStrings__DefaultConnection` - Database connection string
- `Jwt__Key` - JWT signing key
- `Jwt__Issuer` - JWT issuer
- `Jwt__Audience` - JWT audience

## Development

### Entity Framework Migrations

To create a new migration:

```bash
dotnet ef migrations add MigrationName --project MortgagePlatform.API
```

To update the database:

```bash
dotnet ef database update --project MortgagePlatform.API
```

### Running Tests

```bash
dotnet test
```

## Deployment

### Docker (Optional)

```bash
# Build image
docker build -t mortgage-platform-api .

# Run container
docker run -p 5000:80 mortgage-platform-api
```

### Production Considerations

1. Update connection strings for production database
2. Set strong JWT keys
3. Configure HTTPS certificates
4. Set up logging and monitoring
5. Configure CORS for production frontend URLs

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection string credentials
   - Ensure database exists

2. **JWT Token Issues**
   - Verify JWT configuration in appsettings.json
   - Check token expiration settings

3. **CORS Issues**
   - Update CORS policy in Startup.cs for production URLs

## Project Structure

```
MortgagePlatform.API/
├── Controllers/         # API controllers
├── Data/               # Entity Framework context
├── DTOs/               # Data transfer objects
├── Models/             # Entity models
├── Services/           # Business logic services
├── appsettings.json    # Configuration
└── Startup.cs          # Application startup
```