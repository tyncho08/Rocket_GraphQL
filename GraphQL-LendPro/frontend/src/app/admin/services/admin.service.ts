import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { 
  GET_DASHBOARD_METRICS_QUERY,
  GET_ALL_USERS_QUERY,
  GET_ALL_LOAN_APPLICATIONS_QUERY,
  UPDATE_LOAN_STATUS_MUTATION
} from '../../graphql/queries';

export interface DashboardMetrics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalUsers: number;
  newUsersThisMonth: number;
  recentApplications: RecentApplication[];
  approvalRate: number;
}

export interface RecentApplication {
  id: number;
  userName: string;
  loanAmount: number;
  status: string;
  createdAt: string;
}

export interface LoanApplication {
  id: number;
  userId: number;
  userName?: string;
  loanAmount: number;
  propertyValue: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  annualIncome: number;
  employmentStatus: string;
  employer: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
}

export interface LoanApplicationsResponse {
  applications: LoanApplication[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  loanApplicationsCount?: number;
}

export interface UsersResponse {
  users: AdminUser[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private apollo: Apollo) {}

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.apollo.query({
      query: GET_DASHBOARD_METRICS_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => (result.data as any).dashboardMetrics)
    );
  }

  getAllUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<UsersResponse> {
    // Calculate cursor from page (simplified pagination)
    const first = limit;
    
    return this.apollo.query({
      query: GET_ALL_USERS_QUERY,
      variables: {
        search: search ? { search } : null,
        first,
        after: null // For simplicity, not implementing cursor pagination here
      }
    }).pipe(
      map(result => {
        const data = result.data as any;
        const totalCount = data.allUsers.edges.length; // Note: Real implementation would need totalCount from server
        return {
          users: data.allUsers.edges.map((e: any) => e.node),
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: data.allUsers.pageInfo.hasNextPage
        };
      })
    );
  }

  getAllLoanApplications(page: number = 1, limit: number = 10, status: string = '', search: string = ''): Observable<LoanApplicationsResponse> {
    const first = limit;
    
    return this.apollo.query({
      query: GET_ALL_LOAN_APPLICATIONS_QUERY,
      variables: {
        search: (status || search) ? { status: status || null, search: search || null } : null,
        first,
        after: null // For simplicity, not implementing cursor pagination here
      },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        const data = result.data as any;
        const totalCount = data.allLoanApplications.edges.length; // Note: Real implementation would need totalCount from server
        return {
          applications: data.allLoanApplications.edges.map((e: any) => ({
            ...e.node,
            userName: `${e.node.user.firstName} ${e.node.user.lastName}`
          })),
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: data.allLoanApplications.pageInfo.hasNextPage
        };
      })
    );
  }

  updateLoanApplicationStatus(loanApplicationId: number, status: string, notes?: string): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_LOAN_STATUS_MUTATION,
      variables: {
        input: {
          loanApplicationId,
          status,
          notes: notes || null
        }
      }
    } as any).pipe(
      map(result => (result.data as any)?.updateLoanApplicationStatus)
    );
  }

  // Helper methods for dashboard
  getApplicationStatuses(): string[] {
    return ['Pending', 'Approved', 'Rejected', 'Under Review'];
  }

  getUserRoles(): string[] {
    return ['User', 'Admin'];
  }

  getLoanApplicationById(id: number): Observable<LoanApplication> {
    // For simplicity, we'll get the application from the list of all applications
    return this.getAllLoanApplications().pipe(
      map(response => response.applications.find(app => app.id === id)!)
    );
  }

  updateUserRole(userId: number, newRole: string): Observable<any> {
    // This would need to be implemented with a GraphQL mutation
    // For now, return a mock response
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ id: userId, role: newRole });
        observer.complete();
      }, 500);
    });
  }
}