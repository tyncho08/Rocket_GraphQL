import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService, DashboardMetrics, RecentApplication } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockRecentApplications: RecentApplication[] = [
    {
      id: 1,
      status: 'Pending',
      loanAmount: 450000,
      userName: 'John Doe',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      status: 'Approved',
      loanAmount: 325000,
      userName: 'Jane Smith',
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: 3,
      status: 'Denied',
      loanAmount: 275000,
      userName: 'Bob Johnson',
      createdAt: '2024-01-13T09:15:00Z'
    }
  ];

  const mockDashboardMetrics: DashboardMetrics = {
    totalApplications: 150,
    pendingApplications: 25,
    approvedApplications: 100,
    deniedApplications: 25,
    totalUsers: 500,
    newUsersThisMonth: 50,
    recentApplications: mockRecentApplications,
    approvalRate: 66.7
  };

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'getDashboardMetrics'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'loadError',
      'info'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AdminDashboardComponent,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'admin/loans', component: AdminDashboardComponent },
          { path: 'admin/users', component: AdminDashboardComponent },
          { path: 'admin/loans/:id', component: AdminDashboardComponent }
        ])
      ],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Setup default service response
    adminService.getDashboardMetrics.and.returnValue(of(mockDashboardMetrics));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
      expect(component.loading).toBe(true);
      expect(component.metrics).toBeNull();
    });

    it('should load dashboard metrics on init', () => {
      component.ngOnInit();
      expect(adminService.getDashboardMetrics).toHaveBeenCalled();
    });

    it('should set metrics and stop loading on successful load', () => {
      component.ngOnInit();
      
      expect(component.metrics).toEqual(mockDashboardMetrics);
      expect(component.loading).toBe(false);
    });
  });

  describe('Dashboard Metrics Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load dashboard metrics successfully', () => {
      component.loadDashboardMetrics();
      
      expect(adminService.getDashboardMetrics).toHaveBeenCalled();
      expect(component.metrics).toEqual(mockDashboardMetrics);
      expect(component.loading).toBe(false);
    });

    it('should handle metrics loading error', () => {
      const errorResponse = { message: 'Server error' };
      adminService.getDashboardMetrics.and.returnValue(throwError(() => errorResponse));

      component.loadDashboardMetrics();

      expect(notificationService.loadError).toHaveBeenCalledWith('dashboard metrics');
      expect(component.loading).toBe(false);
      expect(component.metrics).toBeNull();
    });

    it('should set loading state during metrics fetch', () => {
      // Start with loaded state
      component.loading = false;
      component.metrics = mockDashboardMetrics;

      component.loadDashboardMetrics();

      expect(component.loading).toBe(true);
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should refresh data and show notification', () => {
      adminService.getDashboardMetrics.calls.reset();
      
      component.refreshData();

      expect(notificationService.info).toHaveBeenCalledWith(
        'Refreshing',
        'Refreshing dashboard data...'
      );
      expect(adminService.getDashboardMetrics).toHaveBeenCalled();
    });

    it('should reload metrics when refreshing', () => {
      const newMetrics = { ...mockDashboardMetrics, totalApplications: 200 };
      adminService.getDashboardMetrics.and.returnValue(of(newMetrics));

      component.refreshData();

      expect(component.metrics).toEqual(newMetrics);
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formattedDate = component.formatDate(dateString);
      
      // The exact format will depend on locale, but should contain date and time
      expect(formattedDate).toContain('at');
      expect(formattedDate.length).toBeGreaterThan(10);
    });

    it('should handle different date formats', () => {
      const isoDate = '2024-01-15T14:30:00.000Z';
      const formatted = component.formatDate(isoDate);
      
      expect(formatted).toBeDefined();
      expect(formatted).toContain('at');
    });

    it('should format time in 24-hour format', () => {
      const dateString = '2024-01-15T14:30:00Z';
      const formatted = component.formatDate(dateString);
      
      // Should contain time portion
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['subscription'], 'unsubscribe');
      component.ngOnDestroy();
      expect(component['subscription'].unsubscribe).toHaveBeenCalled();
    });

    it('should manage subscription properly', () => {
      expect(component['subscription']).toBeDefined();
      expect(component['subscription'].closed).toBe(false);
      
      component.ngOnDestroy();
      expect(component['subscription'].closed).toBe(true);
    });
  });

  describe('Metrics Display', () => {
    beforeEach(() => {
      component.metrics = mockDashboardMetrics;
      component.loading = false;
      fixture.detectChanges();
    });

    it('should display total applications', () => {
      const compiled = fixture.nativeElement;
      const metricCards = compiled.querySelectorAll('.metric-card');
      
      expect(metricCards[0].textContent).toContain('150');
      expect(metricCards[0].textContent).toContain('Total Applications');
    });

    it('should display pending applications with correct styling', () => {
      const compiled = fixture.nativeElement;
      const pendingCard = compiled.querySelector('.metric-card.pending');
      
      expect(pendingCard.textContent).toContain('25');
      expect(pendingCard.textContent).toContain('Pending Review');
    });

    it('should display approved applications with correct styling', () => {
      const compiled = fixture.nativeElement;
      const approvedCard = compiled.querySelector('.metric-card.approved');
      
      expect(approvedCard.textContent).toContain('100');
      expect(approvedCard.textContent).toContain('Approved');
    });

    it('should display denied applications with correct styling', () => {
      const compiled = fixture.nativeElement;
      const deniedCard = compiled.querySelector('.metric-card.denied');
      
      expect(deniedCard.textContent).toContain('25');
      expect(deniedCard.textContent).toContain('Denied');
    });

    it('should display total users', () => {
      const compiled = fixture.nativeElement;
      const metricCards = compiled.querySelectorAll('.metric-card');
      const usersCard = metricCards[4]; // Fifth card is total users
      
      expect(usersCard.textContent).toContain('500');
      expect(usersCard.textContent).toContain('Total Users');
    });

    it('should display approval rate with decimal', () => {
      const compiled = fixture.nativeElement;
      const metricCards = compiled.querySelectorAll('.metric-card');
      const approvalRateCard = metricCards[5]; // Sixth card is approval rate
      
      expect(approvalRateCard.textContent).toContain('66.7%');
      expect(approvalRateCard.textContent).toContain('Approval Rate');
    });
  });

  describe('Recent Applications Display', () => {
    beforeEach(() => {
      component.metrics = mockDashboardMetrics;
      component.loading = false;
      fixture.detectChanges();
    });

    it('should display recent applications', () => {
      const compiled = fixture.nativeElement;
      const applicationItems = compiled.querySelectorAll('.application-item');
      
      expect(applicationItems.length).toBe(3);
    });

    it('should display application details correctly', () => {
      const compiled = fixture.nativeElement;
      const firstApp = compiled.querySelector('.application-item');
      
      expect(firstApp.textContent).toContain('#1');
      expect(firstApp.textContent).toContain('John Doe');
      expect(firstApp.textContent).toContain('$450,000');
      expect(firstApp.textContent).toContain('Pending');
    });

    it('should show status badges with correct styling', () => {
      const compiled = fixture.nativeElement;
      const statusElements = compiled.querySelectorAll('.app-status');
      
      expect(statusElements[0].classList).toContain('status-pending');
      expect(statusElements[1].classList).toContain('status-approved');
      expect(statusElements[2].classList).toContain('status-denied');
    });

    it('should display formatted dates', () => {
      const compiled = fixture.nativeElement;
      const dateElements = compiled.querySelectorAll('.app-date');
      
      expect(dateElements[0].textContent).toContain('at');
      expect(dateElements.length).toBe(3);
    });

    it('should show review links for each application', () => {
      const compiled = fixture.nativeElement;
      const reviewButtons = compiled.querySelectorAll('.review-btn');
      
      expect(reviewButtons.length).toBe(3);
      expect(reviewButtons[0].getAttribute('href')).toContain('/admin/loans/1');
      expect(reviewButtons[1].getAttribute('href')).toContain('/admin/loans/2');
      expect(reviewButtons[2].getAttribute('href')).toContain('/admin/loans/3');
    });

    it('should show no applications message when list is empty', () => {
      component.metrics = {
        ...mockDashboardMetrics,
        recentApplications: []
      };
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const noAppsMessage = compiled.querySelector('.no-applications');
      
      expect(noAppsMessage).toBeTruthy();
      expect(noAppsMessage.textContent).toContain('No recent applications found');
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      component.metrics = mockDashboardMetrics;
      component.loading = false;
      fixture.detectChanges();
    });

    it('should display action cards', () => {
      const compiled = fixture.nativeElement;
      const actionCards = compiled.querySelectorAll('.action-card');
      
      expect(actionCards.length).toBe(3);
    });

    it('should have correct navigation links', () => {
      const compiled = fixture.nativeElement;
      const actionLinks = compiled.querySelectorAll('a.action-card');
      
      expect(actionLinks[0].getAttribute('href')).toContain('/admin/loans');
      expect(actionLinks[1].getAttribute('href')).toContain('/admin/users');
    });

    it('should display action titles and descriptions', () => {
      const compiled = fixture.nativeElement;
      const actionCards = compiled.querySelectorAll('.action-card');
      
      expect(actionCards[0].textContent).toContain('Manage Loans');
      expect(actionCards[0].textContent).toContain('Review and process loan applications');
      
      expect(actionCards[1].textContent).toContain('Manage Users');
      expect(actionCards[1].textContent).toContain('View and manage user accounts');
      
      expect(actionCards[2].textContent).toContain('Refresh Data');
      expect(actionCards[2].textContent).toContain('Update dashboard metrics');
    });

    it('should trigger refresh when refresh action is clicked', () => {
      spyOn(component, 'refreshData');
      const compiled = fixture.nativeElement;
      const refreshCard = compiled.querySelectorAll('.action-card')[2];
      
      refreshCard.click();
      
      expect(component.refreshData).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      component.loading = true;
      component.metrics = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading');
      const spinnerElement = compiled.querySelector('.spinner');
      
      expect(loadingElement).toBeTruthy();
      expect(spinnerElement).toBeTruthy();
      expect(loadingElement.textContent).toContain('Loading dashboard metrics...');
    });

    it('should hide loading spinner when data is loaded', () => {
      component.loading = false;
      component.metrics = mockDashboardMetrics;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingElement = compiled.querySelector('.loading');
      const contentElement = compiled.querySelector('.dashboard-content');
      
      expect(loadingElement).toBeFalsy();
      expect(contentElement).toBeTruthy();
    });

    it('should not show content when loading', () => {
      component.loading = true;
      component.metrics = mockDashboardMetrics;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const contentElement = compiled.querySelector('.dashboard-content');
      
      expect(contentElement).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const networkError = new Error('Network failure');
      adminService.getDashboardMetrics.and.returnValue(throwError(() => networkError));

      component.loadDashboardMetrics();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading dashboard metrics:', networkError);
      expect(notificationService.loadError).toHaveBeenCalledWith('dashboard metrics');
      expect(component.loading).toBe(false);
    });

    it('should handle HTTP errors', () => {
      const httpError = {
        status: 500,
        message: 'Internal Server Error'
      };
      adminService.getDashboardMetrics.and.returnValue(throwError(() => httpError));

      component.loadDashboardMetrics();

      expect(notificationService.loadError).toHaveBeenCalledWith('dashboard metrics');
      expect(component.metrics).toBeNull();
    });

    it('should handle timeout errors', () => {
      const timeoutError = { name: 'TimeoutError', message: 'Request timeout' };
      adminService.getDashboardMetrics.and.returnValue(throwError(() => timeoutError));

      component.loadDashboardMetrics();

      expect(component.loading).toBe(false);
      expect(notificationService.loadError).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      component.metrics = mockDashboardMetrics;
      component.loading = false;
      fixture.detectChanges();
    });

    it('should have responsive grid classes', () => {
      const compiled = fixture.nativeElement;
      const metricsGrid = compiled.querySelector('.metrics-grid');
      const actionCards = compiled.querySelector('.action-cards');
      
      expect(metricsGrid).toBeTruthy();
      expect(actionCards).toBeTruthy();
    });

    it('should maintain proper structure for mobile', () => {
      const compiled = fixture.nativeElement;
      const container = compiled.querySelector('.admin-dashboard-container');
      
      expect(container).toBeTruthy();
      expect(container.classList).toContain('admin-dashboard-container');
    });
  });
});