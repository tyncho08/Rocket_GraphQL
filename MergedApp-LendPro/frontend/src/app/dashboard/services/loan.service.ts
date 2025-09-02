import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoanApplication, CreateLoanApplication } from '../../shared/models/mortgage.model';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;
  private userLoansSubject = new BehaviorSubject<LoanApplication[]>([]);
  public userLoans$ = this.userLoansSubject.asObservable();
  
  private allLoansSubject = new BehaviorSubject<LoanApplication[]>([]);
  public allLoans$ = this.allLoansSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Create new loan application
  createLoanApplication(application: CreateLoanApplication): Observable<LoanApplication> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<LoanApplication>(this.apiUrl, application, { headers })
      .pipe(
        tap(() => this.loadUserLoanApplications())
      );
  }

  // Submit loan application (alias for createLoanApplication for form compatibility)
  submitApplication(applicationData: any): Observable<LoanApplication> {
    // Transform the form data to match the API format
    const transformedData: CreateLoanApplication = {
      propertyAddress: applicationData.loanInfo.propertyAddress,
      propertyValue: applicationData.loanInfo.propertyValue,
      loanAmount: applicationData.loanInfo.loanAmount,
      loanPurpose: applicationData.loanInfo.loanPurpose,
      propertyType: applicationData.loanInfo.propertyType,
      occupancyType: applicationData.loanInfo.occupancyType,
      downPayment: applicationData.loanInfo.downPayment,
      annualIncome: applicationData.employmentInfo.grossAnnualIncome,
      employmentStatus: applicationData.employmentInfo.employmentStatus,
      employerName: applicationData.employmentInfo.employerName,
      jobTitle: applicationData.employmentInfo.jobTitle,
      workStartDate: applicationData.employmentInfo.workStartDate,
      monthlyDebts: this.calculateTotalMonthlyDebts(applicationData.financialInfo.debts),
      creditScore: 750, // Default - would be obtained from credit check
      interestRate: 6.5, // Default - would be determined by lender
      loanTermYears: 30, // Default
      firstName: applicationData.personalInfo.firstName,
      lastName: applicationData.personalInfo.lastName,
      email: applicationData.personalInfo.email,
      phone: applicationData.personalInfo.phone,
      dateOfBirth: applicationData.personalInfo.dateOfBirth,
      ssn: applicationData.personalInfo.ssn,
      maritalStatus: applicationData.personalInfo.maritalStatus,
      references: applicationData.references,
      assets: applicationData.financialInfo.assets
    };

    return this.createLoanApplication(transformedData);
  }

  private calculateTotalMonthlyDebts(debts: any): number {
    return (debts.creditCards || 0) + 
           (debts.studentLoans || 0) + 
           (debts.autoLoans || 0) + 
           (debts.otherDebts || 0);
  }

  // Get specific loan application
  getLoanApplication(id: number): Observable<LoanApplication> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<LoanApplication>(`${this.apiUrl}/${id}`, { headers });
  }

  // Get current user's loan applications
  getUserLoanApplications(): Observable<LoanApplication[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/my`, { headers })
      .pipe(
        tap(loans => this.userLoansSubject.next(loans))
      );
  }

  // Get all loan applications (admin only)
  getAllLoanApplications(): Observable<LoanApplication[]> {
    if (!this.authService.isAdmin()) {
      throw new Error('Admin access required');
    }
    
    const headers = this.authService.getAuthHeaders();
    return this.http.get<LoanApplication[]>(this.apiUrl, { headers })
      .pipe(
        tap(loans => this.allLoansSubject.next(loans))
      );
  }

  // Update loan application status (admin only)
  updateLoanApplicationStatus(id: number, status: string, notes?: string): Observable<LoanApplication> {
    if (!this.authService.isAdmin()) {
      throw new Error('Admin access required');
    }

    const headers = this.authService.getAuthHeaders();
    const updateData = { status, notes };
    
    return this.http.put<LoanApplication>(`${this.apiUrl}/${id}/status`, updateData, { headers })
      .pipe(
        tap(() => {
          this.loadAllLoanApplications();
          this.loadUserLoanApplications();
        })
      );
  }

  // Upload document for loan application
  uploadDocument(loanId: number, file: File, documentType: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    return this.http.post(`${this.apiUrl}/${loanId}/documents`, formData, { headers });
  }

  // Get documents for loan application
  getDocuments(loanId: number): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/${loanId}/documents`, { headers });
  }

  // Delete document
  deleteDocument(loanId: number, documentId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${loanId}/documents/${documentId}`, { headers });
  }

  // Load methods for updating local state
  private loadUserLoanApplications(): void {
    if (this.authService.isAuthenticated()) {
      this.getUserLoanApplications().subscribe({
        next: (loans) => {
          // Successfully loaded user loans
        },
        error: (error) => {
          console.error('Error loading user loan applications:', error);
          // Silently handle error - this is a background operation
        }
      });
    }
  }

  private loadAllLoanApplications(): void {
    if (this.authService.isAdmin() && this.authService.isAuthenticated()) {
      this.getAllLoanApplications().subscribe({
        next: (loans) => {
          // Successfully loaded loans
        },
        error: (error) => {
          console.error('Error loading all loan applications:', error);
          // Silently handle error - this is a background operation
        }
      });
    }
  }

  // Utility methods
  getLoanStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return '#28a745';
      case 'rejected': case 'denied': return '#dc3545';
      case 'pending': return '#ffc107';
      case 'under review': return '#17a2b8';
      case 'processing': return '#6f42c1';
      default: return '#6c757d';
    }
  }

  getLoanStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return '✅';
      case 'rejected': case 'denied': return '❌';
      case 'pending': return '⏳';
      case 'under review': return '🔍';
      case 'processing': return '⚙️';
      default: return '📄';
    }
  }

  // Calculate loan metrics
  calculateLoanMetrics(loan: LoanApplication) {
    const ltvRatio = (loan.loanAmount / loan.propertyValue) * 100;
    const debtToIncomeRatio = this.calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears) * 12 / loan.annualIncome * 100;
    
    return {
      ltvRatio: Math.round(ltvRatio * 100) / 100,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      monthlyPayment: this.calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears)
    };
  }

  private calculateMonthlyPayment(loanAmount: number, interestRate: number, loanTermYears: number): number {
    if (interestRate === 0) {
      return loanAmount / (loanTermYears * 12);
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // Get loan application statistics (for admin dashboard)
  getLoanStatistics(): Observable<any> {
    if (!this.authService.isAdmin()) {
      throw new Error('Admin access required');
    }

    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/statistics`, { headers });
  }

  // Export loan data
  exportLoanData(loanId: number, format: 'pdf' | 'excel'): Observable<Blob> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/${loanId}/export/${format}`, {
      headers,
      responseType: 'blob'
    });
  }
}