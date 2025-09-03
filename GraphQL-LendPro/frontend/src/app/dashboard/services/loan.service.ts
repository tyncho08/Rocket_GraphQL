import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { 
  CREATE_LOAN_APPLICATION_MUTATION,
  GET_MY_LOAN_APPLICATIONS_QUERY,
  GET_LOAN_APPLICATION_QUERY
} from '../../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private userLoansSubject = new BehaviorSubject<any[]>([]);
  public userLoans$ = this.userLoansSubject.asObservable();
  
  constructor(private apollo: Apollo) {}

  // Create new loan application
  createLoanApplication(application: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_LOAN_APPLICATION_MUTATION,
      variables: {
        input: {
          loanAmount: application.loanAmount,
          propertyValue: application.propertyValue,
          downPayment: application.downPayment,
          interestRate: application.interestRate,
          loanTermYears: application.loanTermYears,
          annualIncome: application.annualIncome,
          employmentStatus: application.employmentStatus,
          employer: application.employer,
          notes: application.notes
        }
      }
    } as any).pipe(
      map(result => (result.data as any)?.createLoanApplication),
      tap(() => this.loadUserLoanApplications())
    );
  }

  // Submit loan application (alias for createLoanApplication for form compatibility)
  submitApplication(applicationData: any): Observable<any> {
    // Transform the form data to match the GraphQL input format
    const transformedData = {
      loanAmount: applicationData.loanInfo?.loanAmount || 0,
      propertyValue: applicationData.loanInfo?.propertyValue || 0,
      downPayment: applicationData.loanInfo?.downPayment || 0,
      interestRate: applicationData.loanInfo?.interestRate || 3.5,
      loanTermYears: applicationData.loanInfo?.loanTermYears || 30,
      annualIncome: applicationData.employmentInfo?.grossAnnualIncome || 0,
      employmentStatus: applicationData.employmentInfo?.employmentStatus || '',
      employer: applicationData.employmentInfo?.employerName || '',
      notes: applicationData.additionalInfo?.notes || ''
    };

    return this.createLoanApplication(transformedData);
  }

  // Get user's loan applications
  getUserLoanApplications(): Observable<any[]> {
    return this.apollo.query({
      query: GET_MY_LOAN_APPLICATIONS_QUERY,
      variables: { first: 50 }
    }).pipe(
      map(result => {
        const data = result.data as any;
        const applications = data.myLoanApplications.edges.map((e: any) => e.node);
        this.userLoansSubject.next(applications);
        return applications;
      })
    );
  }

  private loadUserLoanApplications(): void {
    this.getUserLoanApplications().subscribe();
  }

  // Get loan application by ID
  getLoanApplicationById(id: number): Observable<any> {
    return this.apollo.query({
      query: GET_LOAN_APPLICATION_QUERY,
      variables: { id }
    }).pipe(
      map(result => (result.data as any).loanApplication)
    );
  }

  // Get current user loans (cached)
  getCurrentUserLoans(): any[] {
    return this.userLoansSubject.value;
  }

  // Calculate loan metrics
  calculateLoanMetrics(applications: any[]): any {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'Pending').length;
    const approved = applications.filter(app => app.status === 'Approved').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;
    
    const totalLoanAmount = applications.reduce((sum, app) => sum + (app.loanAmount || 0), 0);
    const avgLoanAmount = total > 0 ? totalLoanAmount / total : 0;

    return {
      totalApplications: total,
      pendingApplications: pending,
      approvedApplications: approved,
      rejectedApplications: rejected,
      totalLoanAmount,
      averageLoanAmount: avgLoanAmount,
      approvalRate: total > 0 ? (approved / total) * 100 : 0
    };
  }

  // Initialize service - load user loans
  initialize(): void {
    this.loadUserLoanApplications();
  }
}