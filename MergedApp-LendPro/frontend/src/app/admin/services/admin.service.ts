import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

export interface DashboardMetrics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  deniedApplications: number;
  totalUsers: number;
  newUsersThisMonth: number;
  recentApplications: RecentApplication[];
  approvalRate: number;
}

export interface RecentApplication {
  id: number;
  status: string;
  loanAmount: number;
  userName: string;
  createdAt: string;
}

export interface LoanApplicationsResponse {
  applications: LoanApplication[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoanApplication {
  id: number;
  userId: number;
  userName: string;
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
}

export interface UsersResponse {
  users: AdminUser[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  loanApplicationsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDashboardMetrics(): Observable<DashboardMetrics> {
    const headers = this.getAuthHeaders();
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/admin/dashboard-metrics`, { headers });
  }

  getAllLoanApplications(page: number = 1, limit: number = 10, status: string = '', search: string = ''): Observable<LoanApplicationsResponse> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<LoanApplicationsResponse>(`${this.baseUrl}/loans`, { headers, params });
  }

  getLoanApplicationById(id: number): Observable<LoanApplication> {
    const headers = this.getAuthHeaders();
    return this.http.get<LoanApplication>(`${this.baseUrl}/loans/${id}`, { headers });
  }

  updateLoanApplicationStatus(id: number, status: string, notes?: string): Observable<LoanApplication> {
    const headers = this.getAuthHeaders();
    return this.http.put<LoanApplication>(`${this.baseUrl}/loans/${id}/status`, {
      status,
      notes
    }, { headers });
  }

  getAllUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<UsersResponse> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UsersResponse>(`${this.baseUrl}/admin/users`, { headers, params });
  }

  updateUserRole(id: number, role: string): Observable<AdminUser> {
    const headers = this.getAuthHeaders();
    return this.http.put<AdminUser>(`${this.baseUrl}/admin/users/${id}/role`, {
      role
    }, { headers });
  }
}