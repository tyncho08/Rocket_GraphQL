import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { LoanManagementComponent } from './loan-management.component';
import { AdminService, LoanApplication, LoanApplicationsResponse } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

describe('LoanManagementComponent', () => {
  let component: LoanManagementComponent;
  let fixture: ComponentFixture<LoanManagementComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockLoanApplications: LoanApplication[] = [
    {
      id: 1,
      userId: 101,
      userName: 'John Doe',
      loanAmount: 450000,
      propertyValue: 500000,
      downPayment: 50000,
      interestRate: 6.5,
      loanTermYears: 30,
      annualIncome: 80000,
      employmentStatus: 'Full-time',
      employer: 'Tech Corp',
      status: 'Pending',
      notes: 'Initial application',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      userId: 102,
      userName: 'Jane Smith',
      loanAmount: 325000,
      propertyValue: 400000,
      downPayment: 75000,
      interestRate: 6.0,
      loanTermYears: 25,
      annualIncome: 75000,
      employmentStatus: 'Full-time',
      employer: 'Healthcare Inc',
      status: 'Approved',
      notes: 'Good credit score',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-16T09:15:00Z'
    },
    {
      id: 3,
      userId: 103,
      userName: 'Bob Johnson',
      loanAmount: 275000,
      propertyValue: 350000,
      downPayment: 75000,
      interestRate: 7.0,
      loanTermYears: 30,
      annualIncome: 55000,
      employmentStatus: 'Part-time',
      employer: 'Retail Store',
      status: 'Denied',
      notes: 'Insufficient income',
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-17T11:45:00Z'
    }
  ];

  const mockApplicationsResponse: LoanApplicationsResponse = {
    applications: mockLoanApplications,
    totalCount: 25,
    page: 1,
    limit: 10,
    totalPages: 3
  };

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'getAllLoanApplications',
      'updateLoanApplicationStatus'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'loadError',
      'saveError',
      'success'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LoanManagementComponent,
        CommonModule,
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: 'admin', component: LoanManagementComponent },
          { path: 'admin/loans/:id', component: LoanManagementComponent }
        ])
      ],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanManagementComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Setup default service responses
    adminService.getAllLoanApplications.and.returnValue(of(mockApplicationsResponse));
    adminService.updateLoanApplicationStatus.and.returnValue(of({}));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading).toBe(true);
      expect(component.applicationsResponse).toBeNull();
      expect(component.updating).toBeNull();
      expect(component.searchTerm).toBe('');
      expect(component.selectedStatus).toBe('');
      expect(component.currentPage).toBe(1);
      expect(component.pageSize).toBe(10);
    });

    it('should setup search debounce and load applications on init', () => {
      spyOn(component, 'setupSearchDebounce');
      spyOn(component, 'loadApplications');
      
      component.ngOnInit();
      
      expect(component.setupSearchDebounce).toHaveBeenCalled();
      expect(component.loadApplications).toHaveBeenCalled();
    });

    it('should expose Math to template', () => {
      expect(component.Math).toBe(Math);
    });
  });

  describe('Applications Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load applications successfully', () => {
      component.loadApplications();
      
      expect(adminService.getAllLoanApplications).toHaveBeenCalledWith(
        component.currentPage,
        component.pageSize,
        component.selectedStatus,
        component.searchTerm
      );
      expect(component.applicationsResponse).toEqual(mockApplicationsResponse);
      expect(component.loading).toBe(false);
    });

    it('should handle applications loading error', () => {
      const errorResponse = { message: 'Server error' };
      adminService.getAllLoanApplications.and.returnValue(throwError(() => errorResponse));

      component.loadApplications();

      expect(notificationService.loadError).toHaveBeenCalledWith('loan applications');
      expect(component.loading).toBe(false);
      expect(component.applicationsResponse).toBeNull();
    });

    it('should set loading state during fetch', () => {
      component.loading = false;
      component.applicationsResponse = mockApplicationsResponse;

      component.loadApplications();

      expect(component.loading).toBe(true);
    });

    it('should pass filters to service call', () => {
      component.searchTerm = 'John';
      component.selectedStatus = 'Pending';
      component.currentPage = 2;

      component.loadApplications();

      expect(adminService.getAllLoanApplications).toHaveBeenCalledWith(
        2, 10, 'Pending', 'John'
      );
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should setup search debounce correctly', () => {
      spyOn(component, 'loadApplications');
      component.setupSearchDebounce();

      // Simulate search input
      component['searchSubject'].next('test');

      expect(component.loadApplications).not.toHaveBeenCalled(); // Should be debounced
    });

    it('should debounce search input', fakeAsync(() => {
      spyOn(component, 'loadApplications');
      component.setupSearchDebounce();

      component['searchSubject'].next('test');
      tick(200); // Less than debounce time
      expect(component.loadApplications).not.toHaveBeenCalled();

      tick(150); // Complete debounce time (300ms total)
      expect(component.loadApplications).toHaveBeenCalled();
    }));

    it('should handle search change event', () => {
      spyOn(component['searchSubject'], 'next');
      const mockEvent = { target: { value: 'John Doe' } };

      component.onSearchChange(mockEvent);

      expect(component.searchTerm).toBe('John Doe');
      expect(component['searchSubject'].next).toHaveBeenCalledWith('John Doe');
    });

    it('should reset page to 1 when searching', fakeAsync(() => {
      component.currentPage = 3;
      component.setupSearchDebounce();

      component['searchSubject'].next('search term');
      tick(300);

      expect(component.currentPage).toBe(1);
    }));

    it('should avoid duplicate search calls', fakeAsync(() => {
      spyOn(component, 'loadApplications');
      component.setupSearchDebounce();

      component['searchSubject'].next('test');
      component['searchSubject'].next('test');
      tick(300);

      expect(component.loadApplications).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter by status', () => {
      spyOn(component, 'loadApplications');
      component.currentPage = 3;
      component.selectedStatus = 'Approved';

      component.onFilterChange();

      expect(component.currentPage).toBe(1);
      expect(component.loadApplications).toHaveBeenCalled();
    });

    it('should reset page when filter changes', () => {
      component.currentPage = 5;
      spyOn(component, 'loadApplications');

      component.onFilterChange();

      expect(component.currentPage).toBe(1);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.applicationsResponse = mockApplicationsResponse;
    });

    it('should change page and reload applications', () => {
      spyOn(component, 'loadApplications');

      component.changePage(2);

      expect(component.currentPage).toBe(2);
      expect(component.loadApplications).toHaveBeenCalled();
    });

    it('should handle page boundary conditions', () => {
      component.currentPage = 1;
      spyOn(component, 'loadApplications');

      component.changePage(0); // Invalid page
      expect(component.currentPage).toBe(0);
      expect(component.loadApplications).toHaveBeenCalled();

      component.changePage(10); // High page number
      expect(component.currentPage).toBe(10);
    });
  });

  describe('Quick Approval', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.applicationsResponse = mockApplicationsResponse;
    });

    it('should approve application successfully', () => {
      spyOn(component, 'loadApplications');
      
      component.quickApprove(1);

      expect(component.updating).toBe(1);
      expect(adminService.updateLoanApplicationStatus).toHaveBeenCalledWith(
        1, 'Approved', 'Quick approved by admin'
      );
      expect(notificationService.success).toHaveBeenCalledWith(
        'Approved', 'Application approved successfully'
      );
      expect(component.updating).toBeNull();
      expect(component.loadApplications).toHaveBeenCalled();
    });

    it('should handle approval error', () => {
      const errorResponse = { message: 'Approval failed' };
      adminService.updateLoanApplicationStatus.and.returnValue(throwError(() => errorResponse));

      component.quickApprove(1);

      expect(notificationService.saveError).toHaveBeenCalledWith('application approval');
      expect(component.updating).toBeNull();
    });

    it('should set updating state during approval', () => {
      // Create a delayed observable to test updating state
      const delayedObservable = new Subject();
      adminService.updateLoanApplicationStatus.and.returnValue(delayedObservable);

      component.quickApprove(1);

      expect(component.updating).toBe(1);

      delayedObservable.next({});
      delayedObservable.complete();

      expect(component.updating).toBeNull();
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formattedDate = component.formatDate(dateString);
      
      expect(formattedDate).toBeDefined();
      expect(formattedDate.length).toBeGreaterThan(5);
    });

    it('should handle different date formats', () => {
      const isoDate = '2024-01-15T14:30:00.000Z';
      const formatted = component.formatDate(isoDate);
      
      expect(formatted).toBeDefined();
    });

    it('should format date consistently', () => {
      const date1 = component.formatDate('2024-01-15T10:30:00Z');
      const date2 = component.formatDate('2024-01-15T14:30:00Z');
      
      // Same date, different times should format to same date
      expect(date1).toBe(date2);
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe and complete subject on destroy', () => {
      spyOn(component['subscription'], 'unsubscribe');
      spyOn(component['searchSubject'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['subscription'].unsubscribe).toHaveBeenCalled();
      expect(component['searchSubject'].complete).toHaveBeenCalled();
    });

    it('should manage subscriptions properly', () => {
      expect(component['subscription']).toBeDefined();
      expect(component['subscription'].closed).toBe(false);
      
      component.ngOnDestroy();
      expect(component['subscription'].closed).toBe(true);
    });
  });

  describe('DOM Rendering', () => {
    beforeEach(() => {
      component.applicationsResponse = mockApplicationsResponse;
      component.loading = false;
      fixture.detectChanges();
    });

    it('should display applications table when loaded', () => {
      const compiled = fixture.nativeElement;
      const table = compiled.querySelector('.applications-grid');
      
      expect(table).toBeTruthy();
    });

    it('should display application rows', () => {
      const compiled = fixture.nativeElement;
      const rows = compiled.querySelectorAll('.application-row');
      
      expect(rows.length).toBe(3);
    });

    it('should display application details correctly', () => {
      const compiled = fixture.nativeElement;
      const firstRow = compiled.querySelector('.application-row');
      
      expect(firstRow.textContent).toContain('#1');
      expect(firstRow.textContent).toContain('John Doe');
      expect(firstRow.textContent).toContain('$450,000');
      expect(firstRow.textContent).toContain('$500,000');
      expect(firstRow.textContent).toContain('Pending');
    });

    it('should show status badges with correct styling', () => {
      const compiled = fixture.nativeElement;
      const statusBadges = compiled.querySelectorAll('.status-badge');
      
      expect(statusBadges[0].classList).toContain('status-pending');
      expect(statusBadges[1].classList).toContain('status-approved');
      expect(statusBadges[2].classList).toContain('status-denied');
    });

    it('should display quick approve button only for pending applications', () => {
      const compiled = fixture.nativeElement;
      const quickApproveButtons = compiled.querySelectorAll('.quick-approve-btn');
      
      expect(quickApproveButtons.length).toBe(1); // Only one pending application
    });

    it('should show review links for all applications', () => {
      const compiled = fixture.nativeElement;
      const reviewButtons = compiled.querySelectorAll('.review-btn');
      
      expect(reviewButtons.length).toBe(3);
      expect(reviewButtons[0].getAttribute('href')).toContain('/admin/loans/1');
      expect(reviewButtons[1].getAttribute('href')).toContain('/admin/loans/2');
      expect(reviewButtons[2].getAttribute('href')).toContain('/admin/loans/3');
    });

    it('should display pagination when multiple pages exist', () => {
      const compiled = fixture.nativeElement;
      const pagination = compiled.querySelector('.pagination');
      
      expect(pagination).toBeTruthy();
      expect(pagination.textContent).toContain('Page 1 of 3');
    });

    it('should show results info', () => {
      const compiled = fixture.nativeElement;
      const resultsInfo = compiled.querySelector('.results-info');
      
      expect(resultsInfo.textContent).toContain('Showing 1 to 10 of 25 applications');
    });

    it('should show no applications message when list is empty', () => {
      component.applicationsResponse = {
        ...mockApplicationsResponse,
        applications: [],
        totalCount: 0
      };
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const noAppsMessage = compiled.querySelector('.no-applications');
      
      expect(noAppsMessage).toBeTruthy();
      expect(noAppsMessage.textContent).toContain('No Applications Found');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      component.loading = true;
      component.applicationsResponse = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading');
      const spinnerElement = compiled.querySelector('.spinner');
      
      expect(loadingElement).toBeTruthy();
      expect(spinnerElement).toBeTruthy();
      expect(loadingElement.textContent).toContain('Loading loan applications...');
    });

    it('should hide loading spinner when data is loaded', () => {
      component.loading = false;
      component.applicationsResponse = mockApplicationsResponse;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading');
      const tableElement = compiled.querySelector('.applications-table');
      
      expect(loadingElement).toBeFalsy();
      expect(tableElement).toBeTruthy();
    });

    it('should disable buttons when updating', () => {
      component.updating = 1;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const quickApproveBtn = compiled.querySelector('.quick-approve-btn');
      
      expect(quickApproveBtn.disabled).toBe(true);
      expect(quickApproveBtn.textContent).toContain('Updating...');
    });
  });

  describe('Filter Inputs', () => {
    beforeEach(() => {
      component.loading = false;
      fixture.detectChanges();
    });

    it('should bind search input correctly', () => {
      const compiled = fixture.nativeElement;
      const searchInput = compiled.querySelector('.search-input');
      
      searchInput.value = 'John Doe';
      searchInput.dispatchEvent(new Event('input'));
      
      expect(component.searchTerm).toBe('John Doe');
    });

    it('should bind status filter correctly', () => {
      const compiled = fixture.nativeElement;
      const statusSelect = compiled.querySelector('.filter-select');
      
      statusSelect.value = 'Approved';
      statusSelect.dispatchEvent(new Event('change'));
      
      expect(component.selectedStatus).toBe('Approved');
    });

    it('should display filter options correctly', () => {
      const compiled = fixture.nativeElement;
      const statusOptions = compiled.querySelectorAll('.filter-select option');
      
      expect(statusOptions.length).toBe(5); // All Status + 4 specific statuses
      expect(statusOptions[0].textContent).toContain('All Status');
      expect(statusOptions[1].textContent).toContain('Pending');
      expect(statusOptions[2].textContent).toContain('Approved');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const networkError = new Error('Network failure');
      adminService.getAllLoanApplications.and.returnValue(throwError(() => networkError));

      component.loadApplications();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading applications:', networkError);
      expect(notificationService.loadError).toHaveBeenCalledWith('loan applications');
      expect(component.loading).toBe(false);
    });

    it('should handle quick approval errors', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const approvalError = new Error('Approval failed');
      adminService.updateLoanApplicationStatus.and.returnValue(throwError(() => approvalError));

      component.quickApprove(1);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error approving application:', approvalError);
      expect(notificationService.saveError).toHaveBeenCalledWith('application approval');
      expect(component.updating).toBeNull();
    });
  });
});