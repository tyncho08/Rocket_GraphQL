import { gql } from '@apollo/client/core';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user {
        id
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
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
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
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      role
      fullName
    }
  }
`;

export const SEARCH_PROPERTIES_QUERY = gql`
  query SearchProperties($search: PropertySearchInput, $first: Int, $after: String) {
    properties(search: $search, first: $first, after: $after) {
      edges {
        node {
          id
          address
          city
          state
          zipCode
          price
          bedrooms
          bathrooms
          squareFeet
          propertyType
          description
          imageUrl
          listedDate
          isFavorite
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_PROPERTY_QUERY = gql`
  query GetProperty($id: Int!) {
    property(id: $id) {
      id
      address
      city
      state
      zipCode
      price
      bedrooms
      bathrooms
      squareFeet
      propertyType
      description
      imageUrl
      listedDate
      isFavorite
    }
  }
`;

export const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavorite($propertyId: Int!) {
    toggleFavoriteProperty(propertyId: $propertyId) {
      property {
        id
        isFavorite
      }
      isFavorite
      errors {
        message
        code
      }
    }
  }
`;

export const GET_LOCATIONS_QUERY = gql`
  query GetLocations {
    locations {
      states
      cities
    }
  }
`;

export const CALCULATE_MORTGAGE_QUERY = gql`
  query CalculateMortgage($input: MortgageCalculationInput!) {
    calculateMortgage(input: $input) {
      monthlyPayment
      totalInterest
      totalPayment
      loanAmount
      amortizationSchedule {
        paymentNumber
        paymentAmount
        principalAmount
        interestAmount
        remainingBalance
      }
    }
  }
`;

export const CHECK_PREAPPROVAL_QUERY = gql`
  query CheckPreApproval($input: PreApprovalCheckInput!) {
    checkPreApproval(input: $input) {
      isEligible
    }
  }
`;

export const CREATE_LOAN_APPLICATION_MUTATION = gql`
  mutation CreateLoanApplication($input: CreateLoanApplicationInput!) {
    createLoanApplication(input: $input) {
      loanApplication {
        id
        loanAmount
        status
        createdAt
      }
      errors {
        message
        code
      }
    }
  }
`;

export const GET_MY_LOAN_APPLICATIONS_QUERY = gql`
  query GetMyLoanApplications($first: Int, $after: String) {
    myLoanApplications(first: $first, after: $after) {
      edges {
        node {
          id
          loanAmount
          propertyValue
          downPayment
          interestRate
          loanTermYears
          monthlyPayment
          status
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_LOAN_APPLICATION_QUERY = gql`
  query GetLoanApplication($id: Int!) {
    loanApplication(id: $id) {
      id
      loanAmount
      propertyValue
      downPayment
      interestRate
      loanTermYears
      monthlyPayment
      annualIncome
      employmentStatus
      employer
      status
      notes
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_FAVORITE_PROPERTIES_QUERY = gql`
  query GetFavoriteProperties($first: Int, $after: String) {
    favoriteProperties(first: $first, after: $after) {
      edges {
        node {
          id
          address
          city
          state
          price
          bedrooms
          bathrooms
          propertyType
          imageUrl
          listedDate
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// Admin Queries
export const GET_ALL_USERS_QUERY = gql`
  query GetAllUsers($search: AdminSearchInput, $first: Int, $after: String) {
    allUsers(search: $search, first: $first, after: $after) {
      edges {
        node {
          id
          firstName
          lastName
          email
          role
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_ALL_LOAN_APPLICATIONS_QUERY = gql`
  query GetAllLoanApplications($search: AdminSearchInput, $first: Int, $after: String) {
    allLoanApplications(search: $search, first: $first, after: $after) {
      edges {
        node {
          id
          loanAmount
          status
          createdAt
          user {
            firstName
            lastName
            email
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const UPDATE_LOAN_STATUS_MUTATION = gql`
  mutation UpdateLoanStatus($input: UpdateLoanStatusInput!) {
    updateLoanApplicationStatus(input: $input) {
      loanApplication {
        id
        status
        notes
        updatedAt
      }
      errors {
        message
        code
      }
    }
  }
`;

export const GET_DASHBOARD_METRICS_QUERY = gql`
  query GetDashboardMetrics {
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
`;