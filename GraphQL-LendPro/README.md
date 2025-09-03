# LendPro GraphQL Migration

Complete REST to GraphQL migration of the enterprise mortgage lending platform.

## Quick Start

```bash
./run-app.sh
```

## URLs

- **Frontend**: http://localhost:4300
- **GraphQL Playground**: http://localhost:5005/graphql

## Test Accounts

- **User**: `john.doe@email.com` / `user123`  
- **Admin**: `admin@mortgageplatform.com` / `admin123`

## Sample GraphQL Queries

### Authentication

```graphql
# Login
mutation { 
  login(input: { email: "john.doe@email.com", password: "user123" }) { 
    token 
    user { 
      firstName 
      lastName 
      email
      role
    }
    errors {
      message
      code
    }
  } 
}
```

### Properties

```graphql
# Search Properties
query { 
  properties(first: 5) { 
    edges { 
      node { 
        id 
        address 
        city 
        price 
        bedrooms 
        bathrooms
        isFavorite
      } 
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  } 
}

# Get Locations
query { 
  locations { 
    states 
    cities 
  } 
}
```

### Mortgage Calculations

```graphql
# Calculate Mortgage
query {
  calculateMortgage(input: {
    propertyPrice: 450000
    downPayment: 90000
    interestRate: 3.5
    loanTermYears: 30
  }) {
    monthlyPayment
    totalInterest
    totalPayment
    loanAmount
  }
}

# Check Pre-approval
query {
  checkPreApproval(input: {
    annualIncome: 80000
    loanAmount: 360000
    monthlyDebts: 1500
  }) {
    isEligible
  }
}
```

### Loan Applications

```graphql
# Create Loan Application
mutation {
  createLoanApplication(input: {
    loanAmount: 360000
    propertyValue: 450000
    downPayment: 90000
    interestRate: 3.5
    loanTermYears: 30
    annualIncome: 80000
    employmentStatus: "Full-time"
    employer: "Tech Company"
    notes: "First-time home buyer"
  }) {
    loanApplication {
      id
      status
      createdAt
    }
    errors {
      message
      code
    }
  }
}
```

### Admin Queries

```graphql
# Dashboard Metrics (Admin only)
query {
  dashboardMetrics {
    totalApplications
    pendingApplications
    approvedApplications
    rejectedApplications
    approvalRate
    totalUsers
    newUsersThisMonth
    recentApplications {
      id
      userName
      loanAmount
      status
      createdAt
    }
  }
}

# Update Loan Status (Admin only)
mutation {
  updateLoanApplicationStatus(input: {
    loanApplicationId: 1
    status: "Approved"
    notes: "Application approved after verification"
  }) {
    loanApplication {
      id
      status
      notes
    }
    errors {
      message
      code
    }
  }
}
```

## Tech Stack

### Backend
- **.NET 8** - Latest LTS version with minimal APIs
- **HotChocolate 13.9** - GraphQL server implementation  
- **Entity Framework Core 8** - ORM with PostgreSQL
- **PostgreSQL** - Primary database
- **JWT Authentication** - Secure token-based auth
- **Serilog** - Structured logging

### Frontend  
- **Angular 19** - Latest version with standalone components
- **Apollo Client** - GraphQL client with caching
- **Angular Material** - UI component library
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming

## Key Features

✅ **Complete GraphQL API** - All REST endpoints migrated to GraphQL  
✅ **Real-time Authentication** - JWT-based with role authorization  
✅ **Advanced Property Search** - Filtering, sorting, pagination  
✅ **Mortgage Calculations** - Real-time calculations with amortization  
✅ **Loan Application Management** - Full CRUD with status tracking  
✅ **Admin Dashboard** - Metrics, user management, application review  
✅ **Favorites System** - Property bookmarking for authenticated users  
✅ **Pre-approval Checks** - Automated eligibility verification  

## Database Schema

- **Users** - Authentication and profile data
- **Properties** - Real estate listings with search metadata
- **LoanApplications** - Complete mortgage application data
- **FavoriteProperties** - User property bookmarks
- **Documents** - File attachments for applications
- **Payments** - Payment schedules and history

## API Architecture

- **Query Root** - All read operations (properties, loans, users)
- **Mutation Root** - All write operations (auth, applications, updates)  
- **Type System** - Strongly typed schema with input validation
- **Authorization** - Role-based access control (User/Admin)
- **Pagination** - Cursor-based pagination for large datasets
- **Caching** - Apollo Client cache with smart invalidation

## Development

### Backend Development
```bash
cd backend-graphql/MortgagePlatform.API
dotnet restore
dotnet run
```

### Frontend Development
```bash
cd frontend  
pnpm install
pnpm start
```

### Database
- PostgreSQL connection string in appsettings.json
- Auto-migration and seeding on startup
- Sample data includes test users and properties

## Migration Notes

This project represents a complete migration from REST API to GraphQL:

- ✅ **Preserved Functionality** - All original features maintained
- ✅ **Enhanced Type Safety** - GraphQL schema provides compile-time guarantees
- ✅ **Improved Performance** - Single requests replace multiple REST calls
- ✅ **Better Developer Experience** - IntelliSense and auto-completion
- ✅ **Future-Proof Architecture** - Modern stack ready for scaling

**Migration completed successfully** 🚀