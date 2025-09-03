import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AdminService, LoanApplication, LoanApplicationsResponse } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="loan-management-container">
      <div class="page-header">
        <h1>Loan Management</h1>
        <p>Review and manage all loan applications</p>
        <a routerLink="/admin" class="back-btn">← Back to Dashboard</a>
      </div>

      <!-- Filters and Search -->
      <div class="section-content">
        <div class="section-header">
          <h2>Search & Filter Applications</h2>
        </div>
        <div class="filters-container">
          <div class="filters-grid">
            <div class="form-group">
              <label for="search">Search Applications</label>
              <input 
                id="search"
                type="text" 
                placeholder="Search by user name or email..."
                [(ngModel)]="searchTerm"
                (input)="onSearchChange($event)"
                class="form-control">
            </div>
            
            <div class="form-group">
              <label for="status-filter">Filter by Status</label>
              <select id="status-filter" [(ngModel)]="selectedStatus" (change)="onFilterChange()" class="form-control">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
          </div>

          <div class="results-info" *ngIf="applicationsResponse">
            <strong>Results:</strong> Showing {{((applicationsResponse.page - 1) * applicationsResponse.limit) + 1}} to 
            {{Math.min(applicationsResponse.page * applicationsResponse.limit, applicationsResponse.totalCount)}} 
            of {{applicationsResponse.totalCount}} applications
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Loading loan applications...</p>
      </div>

      <!-- Applications Table -->
      <div class="section-content" *ngIf="!loading && applicationsResponse">
        <div class="section-header">
          <h2>Loan Applications</h2>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant</th>
                <th>Loan Amount</th>
                <th>Property Value</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let application of applicationsResponse.applications">
                <td>
                  <span class="app-id">#{{application.id}}</span>
                </td>
                <td>
                  <div class="applicant-info">
                    <div class="applicant-name">{{application.userName}}</div>
                    <div class="applicant-details">\${{application.annualIncome | number:'1.0-0'}} annually</div>
                  </div>
                </td>
                <td>
                  <div class="loan-details">
                    <div class="amount">\${{application.loanAmount | number:'1.0-0'}}</div>
                    <div class="term">{{application.loanTermYears}} years at {{application.interestRate}}%</div>
                  </div>
                </td>
                <td>
                  <div class="property-details">
                    <div class="value">\${{application.propertyValue | number:'1.0-0'}}</div>
                    <div class="down-payment">Down: \${{application.downPayment | number:'1.0-0'}}</div>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class]="'status-' + application.status.toLowerCase().replace(' ', '-')">
                    {{application.status}}
                  </span>
                </td>
                <td class="date-cell">{{formatDate(application.createdAt)}}</td>
                <td>
                  <div class="button-group-vertical">
                    <a routerLink="/admin/loans/{{application.id}}" class="btn btn-primary btn-sm">Review</a>
                    <button 
                      *ngIf="application.status === 'Pending'" 
                      (click)="quickApprove(application.id)"
                      class="btn btn-success btn-sm"
                      [disabled]="updating === application.id">
                      {{updating === application.id ? 'Updating...' : 'Quick Approve'}}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Applications Message -->
        <div class="empty-state" *ngIf="applicationsResponse.applications.length === 0">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
              <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
            </svg>
          </div>
          <h3>No Applications Found</h3>
          <p>No loan applications match your current filters.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" *ngIf="applicationsResponse && applicationsResponse.totalPages > 1">
        <div class="pagination">
          <button 
            (click)="changePage(applicationsResponse.page - 1)"
            [disabled]="applicationsResponse.page === 1 || loading"
            class="btn btn-outline btn-sm">
            ← Previous
          </button>
          
          <span class="pagination-info">
            Page {{applicationsResponse.page}} of {{applicationsResponse.totalPages}}
          </span>
          
          <button 
            (click)="changePage(applicationsResponse.page + 1)"
            [disabled]="applicationsResponse.page === applicationsResponse.totalPages || loading"
            class="btn btn-outline btn-sm">
            Next →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loan-management-container {
      min-height: 100vh;
      background: var(--background-secondary);
      padding: var(--space-lg);
    }

    .page-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
      position: relative;
    }

    .page-header h1 {
      font-size: var(--text-3xl);
      margin-bottom: var(--space-xs);
      color: var(--primary-dark);
      font-weight: 600;
    }

    .page-header p {
      font-size: var(--text-lg);
      color: var(--text-secondary);
      margin-bottom: var(--space-lg);
    }

    .back-btn {
      position: absolute;
      left: 0;
      top: 0;
      color: var(--primary-dark);
      text-decoration: none;
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      background: var(--background-primary);
      transition: all 0.2s ease;
      font-weight: 500;
      font-size: var(--text-sm);
    }

    .back-btn:hover {
      background: var(--background-tertiary);
      border-color: var(--primary-dark);
      color: var(--primary-dark);
      text-decoration: none;
      transform: translateY(-1px);
    }

    /* Filters Section */
    .filters-container {
      margin-bottom: var(--space-lg);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
      margin-bottom: var(--space-md);
    }

    .results-info {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      padding: var(--space-md);
      background: var(--background-tertiary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    /* Table Styling */
    .table-container {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }

    .data-table th {
      background: var(--background-secondary);
      color: var(--text-primary);
      font-weight: 600;
      text-align: left;
      padding: var(--space-md);
      border-bottom: 2px solid var(--border-medium);
      white-space: nowrap;
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .data-table td {
      padding: var(--space-md);
      border-bottom: 1px solid var(--border-light);
      vertical-align: top;
      min-width: 120px;
    }

    .data-table td:nth-child(5) {
      min-width: 140px;
      text-align: center;
    }

    .data-table tr:hover {
      background: var(--background-secondary);
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .app-id {
      font-weight: 600;
      color: var(--primary-dark);
      font-size: var(--text-sm);
    }

    .applicant-info .applicant-name {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-xs);
      font-size: var(--text-sm);
    }

    .applicant-info .applicant-details {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .loan-details .amount {
      font-weight: 600;
      color: var(--accent-success);
      font-size: var(--text-base);
      margin-bottom: var(--space-xs);
    }

    .loan-details .term {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .property-details .value {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-xs);
      font-size: var(--text-sm);
    }

    .property-details .down-payment {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .status-badge {
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-xl);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid;
      white-space: nowrap;
      display: inline-block;
      min-width: fit-content;
      text-align: center;
    }

    .status-pending {
      background: rgba(214, 158, 46, 0.1);
      color: var(--accent-warning);
      border-color: var(--accent-warning);
    }

    .status-approved {
      background: rgba(56, 161, 105, 0.1);
      color: var(--accent-success);
      border-color: var(--accent-success);
    }

    .status-denied {
      background: rgba(229, 62, 62, 0.1);
      color: var(--accent-danger);
      border-color: var(--accent-danger);
    }

    .status-under-review {
      background: rgba(49, 130, 206, 0.1);
      color: var(--primary-dark);
      border-color: var(--primary-dark);
    }

    .date-cell {
      color: var(--text-secondary);
      font-size: var(--text-xs);
    }

    .button-group-vertical {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      align-items: stretch;
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: var(--space-xl);
      margin-bottom: var(--space-lg);
    }

    .pagination-info {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: var(--text-sm);
      display: flex;
      align-items: center;
      margin: 0 var(--space-md);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .loan-management-container {
        padding: var(--space-sm);
      }

      .page-header {
        margin-bottom: var(--space-xl);
      }

      .page-header h1 {
        font-size: var(--text-2xl);
      }

      .back-btn {
        position: relative;
        display: block;
        width: fit-content;
        margin: 0 auto var(--space-lg);
      }

      .filters-grid {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .table-container {
        overflow-x: auto;
      }

      .data-table {
        min-width: 800px;
      }

      .data-table th,
      .data-table td {
        padding: var(--space-sm);
        font-size: var(--text-xs);
      }

      .button-group-vertical {
        align-items: center;
      }

      .button-group-vertical .btn {
        min-width: 100px;
        text-align: center;
        font-size: var(--text-xs);
        padding: var(--space-xs) var(--space-sm);
      }
    }

    @media (max-width: 480px) {
      .loan-management-container {
        padding: var(--space-xs);
      }
      
      .page-header h1 {
        font-size: var(--text-xl);
      }
    }
  `]
})
export class LoanManagementComponent implements OnInit, OnDestroy {
  applicationsResponse: LoanApplicationsResponse | null = null;
  loading = true;
  updating: number | null = null;
  
  searchTerm = '';
  selectedStatus = '';
  currentPage = 1;
  pageSize = 10;

  private subscription = new Subscription();
  private searchSubject = new Subject<string>();
  
  // Expose Math to template
  Math = Math;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadApplications();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.searchSubject.complete();
  }

  setupSearchDebounce() {
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.currentPage = 1;
        this.loadApplications();
      })
    );
  }

  loadApplications() {
    this.loading = true;
    this.subscription.add(
      this.adminService.getAllLoanApplications(
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.applicationsResponse = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.notificationService.loadError('loan applications');
          this.loading = false;
        }
      })
    );
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadApplications();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadApplications();
  }

  quickApprove(applicationId: number) {
    this.updating = applicationId;
    this.subscription.add(
      this.adminService.updateLoanApplicationStatus(applicationId, 'Approved', 'Quick approved by admin').subscribe({
        next: () => {
          this.notificationService.success('Approved', 'Application approved successfully');
          this.updating = null;
          this.loadApplications();
        },
        error: (error) => {
          console.error('Error approving application:', error);
          this.notificationService.saveError('application approval');
          this.updating = null;
        }
      })
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}