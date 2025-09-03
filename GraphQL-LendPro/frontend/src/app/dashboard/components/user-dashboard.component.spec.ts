import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { UserDashboardComponent, User, LoanApplication } from './user-dashboard.component';
import { NotificationService } from '../../shared/services/notification.service';
import { PropertyService } from '../../home-search/services/property.service';
import { MortgageService } from '../../mortgage-tools/services/mortgage.service';
import { LoanService } from '../services/loan.service';
import { Property } from '../../shared/models/property.model';
import { MortgageCalculationResult } from '../../shared/models/mortgage.model';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let propertyService: jasmine.SpyObj<PropertyService>;
  let mortgageService: jasmine.SpyObj<MortgageService>;
  let loanService: jasmine.SpyObj<LoanService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    joinDate: '2024-01-15T00:00:00Z'
  };

  const mockProperties: Property[] = [
    {
      id: 1,
      address: '123 Oak St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      propertyType: 'Single Family',
      imageUrl: 'test-image.jpg',
      isFavorite: true,
      description: 'Beautiful home',
      yearBuilt: 2020,
      lotSize: 0.25,
      listingAgent: 'John Doe',
      listingDate: '2024-01-01',
      daysOnMarket: 30,
      mlsNumber: 'MLS123',
      latitude: 30.2672,
      longitude: -97.7431,
      features: ['garage', 'pool'],
      virtualTourUrl: '',
      status: 'Active'
    },
    {
      id: 2,
      address: '456 Pine Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      price: 325000,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      propertyType: 'Condo',
      imageUrl: 'test-image-2.jpg',
      isFavorite: true,
      description: 'Modern condo',
      yearBuilt: 2021,
      lotSize: 0.1,
      listingAgent: 'Jane Smith',
      listingDate: '2024-01-10',
      daysOnMarket: 20,
      mlsNumber: 'MLS456',
      latitude: 30.2672,
      longitude: -97.7431,
      features: ['parking'],
      virtualTourUrl: '',
      status: 'Active'
    }
  ];

  const mockCalculations: MortgageCalculationResult[] = [
    {
      loanAmount: 360000,
      monthlyPayment: 2415.67,
      totalInterest: 509241.20,
      totalCost: 869241.20,
      calculatedAt: new Date('2024-01-20T10:00:00Z'),
      homePrice: 450000,
      downPayment: 90000,
      interestRate: 6.5,
      loanTermYears: 30,
      monthlyTaxes: 375,
      monthlyInsurance: 200,
      monthlyPMI: 0,
      monthlyHOA: 0,
      totalMonthlyPayment: 2990.67
    },
    {
      loanAmount: 260000,
      monthlyPayment: 1742.33,
      totalInterest: 367238.80,
      totalCost: 627238.80,
      calculatedAt: new Date('2024-01-18T14:30:00Z'),
      homePrice: 325000,
      downPayment: 65000,
      interestRate: 6.0,
      loanTermYears: 30,
      monthlyTaxes: 270,
      monthlyInsurance: 150,
      monthlyPMI: 0,
      monthlyHOA: 50,
      totalMonthlyPayment: 2212.33
    }
  ];

  const mockLoanApplications: LoanApplication[] = [
    {
      id: 1001,
      status: 'under_review',
      propertyAddress: '456 Oak Avenue, Austin, TX 78702',
      loanAmount: 320000,
      monthlyPayment: 2145.67,
      applicationDate: '2024-08-15T00:00:00Z',
      lastUpdated: '2024-08-18T00:00:00Z',
      nextStep: 'Provide income verification documents'
    },
    {
      id: 1002,
      status: 'draft',
      propertyAddress: '789 Pine Street, Austin, TX 78703',
      loanAmount: 275000,
      monthlyPayment: 1842.33,
      applicationDate: '2024-08-20T00:00:00Z',
      lastUpdated: '2024-08-20T00:00:00Z',
      nextStep: 'Complete application form'
    }
  ];

  beforeEach(async () => {
    const calculationHistorySubject = new BehaviorSubject(mockCalculations);

    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success', 'error', 'info'
    ]);
    const propertyServiceSpy = jasmine.createSpyObj('PropertyService', [
      'getFavoriteProperties', 'toggleFavorite'
    ]);
    const mortgageServiceSpy = jasmine.createSpyObj('MortgageService', [], {
      calculationHistory$: calculationHistorySubject.asObservable()
    });
    const loanServiceSpy = jasmine.createSpyObj('LoanService', []);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        UserDashboardComponent,
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'mortgage-tools', component: UserDashboardComponent },
          { path: 'search', component: UserDashboardComponent },
          { path: 'loan-application', component: UserDashboardComponent },
          { path: 'properties/:id', component: UserDashboardComponent }
        ])
      ],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: PropertyService, useValue: propertyServiceSpy },
        { provide: MortgageService, useValue: mortgageServiceSpy },
        { provide: LoanService, useValue: loanServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    propertyService = TestBed.inject(PropertyService) as jasmine.SpyObj<PropertyService>;
    mortgageService = TestBed.inject(MortgageService) as jasmine.SpyObj<MortgageService>;
    loanService = TestBed.inject(LoanService) as jasmine.SpyObj<LoanService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default service responses
    propertyService.getFavoriteProperties.and.returnValue(of(mockProperties));
    propertyService.toggleFavorite.and.returnValue(of({ isFavorite: false }));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.user).toBeNull();
      expect(component.loanApplications).toEqual([]);
      expect(component.favoriteProperties).toEqual([]);
      expect(component.calculationHistory).toEqual([]);
      expect(component.editingProfile).toBe(false);
    });

    it('should initialize profile form with validation', () => {
      expect(component.profileForm).toBeDefined();
      expect(component.profileForm.get('firstName')?.hasError('required')).toBe(true);
      expect(component.profileForm.get('lastName')?.hasError('required')).toBe(true);
      expect(component.profileForm.get('email')?.hasError('required')).toBe(true);
    });

    it('should load dashboard data on init', () => {
      spyOn(component, 'loadDashboardData');
      component.ngOnInit();
      expect(component.loadDashboardData).toHaveBeenCalled();
    });

    it('should load user profile data', () => {
      component.loadUserProfile();
      expect(component.user).toEqual(mockUser);
    });

    it('should load loan applications data', () => {
      component.loadLoanApplications();
      expect(component.loanApplications).toEqual(mockLoanApplications);
    });
  });

  describe('Dashboard Data Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load favorite properties successfully', () => {
      component.loadFavoriteProperties();
      expect(propertyService.getFavoriteProperties).toHaveBeenCalled();
      expect(component.favoriteProperties).toEqual(mockProperties);
    });

    it('should handle favorite properties loading error', () => {
      propertyService.getFavoriteProperties.and.returnValue(throwError(() => 'Error'));
      component.loadFavoriteProperties();
      expect(component.favoriteProperties).toEqual([]);
    });

    it('should load calculation history from service', () => {
      component.loadCalculationHistory();
      expect(component.calculationHistory).toEqual(mockCalculations);
    });

    it('should load all dashboard data', () => {
      spyOn(component, 'loadUserProfile');
      spyOn(component, 'loadFavoriteProperties');
      spyOn(component, 'loadCalculationHistory');
      spyOn(component, 'loadLoanApplications');

      component.loadDashboardData();

      expect(component.loadUserProfile).toHaveBeenCalled();
      expect(component.loadFavoriteProperties).toHaveBeenCalled();
      expect(component.loadCalculationHistory).toHaveBeenCalled();
      expect(component.loadLoanApplications).toHaveBeenCalled();
    });
  });

  describe('Profile Management', () => {
    beforeEach(() => {
      component.user = mockUser;
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      component.editProfile();
      expect(component.editingProfile).toBe(true);
      expect(component.profileForm.value).toEqual(jasmine.objectContaining({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email
      }));
    });

    it('should save profile successfully', () => {
      component.profileForm.patchValue({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '(555) 987-6543'
      });
      component.editingProfile = true;

      component.saveProfile();

      expect(component.editingProfile).toBe(false);
      expect(component.user?.firstName).toBe('Jane');
      expect(component.user?.lastName).toBe('Smith');
      expect(notificationService.success).toHaveBeenCalledWith(
        'Profile Updated',
        'Your profile information has been saved successfully'
      );
    });

    it('should not save invalid profile', () => {
      component.profileForm.patchValue({
        firstName: '',
        lastName: '',
        email: 'invalid-email'
      });
      const originalUser = { ...component.user! };

      component.saveProfile();

      expect(component.user).toEqual(originalUser);
      expect(notificationService.success).not.toHaveBeenCalled();
    });

    it('should cancel edit mode', () => {
      component.editingProfile = true;
      component.profileForm.patchValue({ firstName: 'Changed' });

      component.cancelEdit();

      expect(component.editingProfile).toBe(false);
      expect(component.profileForm.get('firstName')?.value).toBeNull();
    });

    it('should not edit profile when user is null', () => {
      component.user = null;
      component.editProfile();
      expect(component.editingProfile).toBe(false);
    });
  });

  describe('Favorite Properties Management', () => {
    beforeEach(() => {
      component.favoriteProperties = [...mockProperties];
      fixture.detectChanges();
    });

    it('should remove favorite property successfully', () => {
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.removeFavorite(mockProperties[0], mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(propertyService.toggleFavorite).toHaveBeenCalledWith(mockProperties[0].id);
      expect(component.favoriteProperties).not.toContain(mockProperties[0]);
      expect(notificationService.success).toHaveBeenCalledWith(
        'Removed from Favorites',
        'Property removed from your favorites'
      );
    });

    it('should handle remove favorite error', () => {
      propertyService.toggleFavorite.and.returnValue(throwError(() => 'Error'));
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.removeFavorite(mockProperties[0], mockEvent);

      expect(notificationService.error).toHaveBeenCalledWith(
        'Error',
        'Unable to remove property from favorites'
      );
    });
  });

  describe('Calculation Management', () => {
    beforeEach(() => {
      component.calculationHistory = [...mockCalculations];
      fixture.detectChanges();
    });

    it('should load calculation', () => {
      const calculation = mockCalculations[0];
      component.loadCalculation(calculation);

      expect(router.navigate).toHaveBeenCalledWith(['/mortgage-tools'], {
        queryParams: { loadCalculation: JSON.stringify(calculation) }
      });
    });

    it('should navigate to view all calculations', () => {
      component.viewAllCalculations();
      expect(router.navigate).toHaveBeenCalledWith(['/mortgage-tools']);
    });

    it('should get loan term', () => {
      const term = component.getLoanTerm(mockCalculations[0]);
      expect(term).toBe(30);
    });
  });

  describe('Application Management', () => {
    beforeEach(() => {
      component.loanApplications = [...mockLoanApplications];
      fixture.detectChanges();
    });

    it('should get active application', () => {
      const activeApp = component.getActiveApplication();
      expect(activeApp).toEqual(mockLoanApplications[0]);
    });

    it('should return undefined when no active application', () => {
      component.loanApplications = mockLoanApplications.filter(app => 
        app.status === 'draft' || app.status === 'approved'
      );
      const activeApp = component.getActiveApplication();
      expect(activeApp).toBeUndefined();
    });
  });

  describe('Utility Functions', () => {
    it('should format currency correctly', () => {
      expect(component.formatCurrency(450000)).toBe('$450,000');
      expect(component.formatCurrency(1234567)).toBe('$1,234,567');
    });

    it('should format numbers correctly', () => {
      expect(component.formatNumber(1800)).toBe('1,800');
      expect(component.formatNumber(1234567)).toBe('1,234,567');
    });

    it('should format dates correctly', () => {
      const formatted = component.formatDate('2024-01-15T00:00:00Z');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle null date', () => {
      expect(component.formatDate(undefined)).toBe('N/A');
      expect(component.formatDate('')).toBe('N/A');
    });

    it('should get relative time correctly', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      expect(component.getRelativeTime(today.toISOString())).toBe('Today');
      expect(component.getRelativeTime(yesterday.toISOString())).toBe('Yesterday');
      expect(component.getRelativeTime(weekAgo.toISOString())).toContain('week');
    });

    it('should handle image errors', () => {
      const mockEvent = {
        target: { src: 'original-image.jpg' }
      };

      component.onImageError(mockEvent);

      expect(mockEvent.target.src).toBe('/assets/images/property-placeholder.jpg');
    });
  });

  describe('Quick Actions', () => {
    it('should contact support', () => {
      component.contactSupport();
      expect(notificationService.info).toHaveBeenCalledWith(
        'Contact Support',
        'Support feature coming soon! Call (555) 123-LOAN for immediate assistance.'
      );
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['subscriptions'], 'unsubscribe');
      component.ngOnDestroy();
      expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
    });
  });

  describe('DOM Rendering', () => {
    beforeEach(() => {
      component.user = mockUser;
      component.favoriteProperties = mockProperties;
      component.calculationHistory = mockCalculations;
      component.loanApplications = mockLoanApplications;
      fixture.detectChanges();
    });

    it('should display user stats', () => {
      const compiled = fixture.nativeElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      
      expect(statCards.length).toBeGreaterThan(2);
      expect(statCards[0].textContent).toContain('2'); // Saved properties
      expect(statCards[1].textContent).toContain('2'); // Loan applications
      expect(statCards[2].textContent).toContain('2'); // Calculations
    });

    it('should display user profile information', () => {
      const compiled = fixture.nativeElement;
      const profileSection = compiled.querySelector('.profile-section');
      
      expect(profileSection.textContent).toContain('John Doe');
      expect(profileSection.textContent).toContain('john.doe@example.com');
      expect(profileSection.textContent).toContain('(555) 123-4567');
    });

    it('should display favorite properties', () => {
      const compiled = fixture.nativeElement;
      const favoriteCards = compiled.querySelectorAll('.favorite-card');
      
      expect(favoriteCards.length).toBe(2);
      expect(favoriteCards[0].textContent).toContain('$450,000');
      expect(favoriteCards[1].textContent).toContain('$325,000');
    });

    it('should display loan applications', () => {
      const compiled = fixture.nativeElement;
      const applicationCards = compiled.querySelectorAll('.application-card');
      
      expect(applicationCards.length).toBe(2);
      expect(applicationCards[0].textContent).toContain('under_review');
      expect(applicationCards[1].textContent).toContain('draft');
    });

    it('should display calculation history', () => {
      const compiled = fixture.nativeElement;
      const calculationCards = compiled.querySelectorAll('.calculation-card');
      
      expect(calculationCards.length).toBe(2);
      expect(calculationCards[0].textContent).toContain('$2,416');
      expect(calculationCards[1].textContent).toContain('$1,742');
    });

    it('should show empty states when no data', () => {
      component.favoriteProperties = [];
      component.loanApplications = [];
      component.calculationHistory = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const emptyStates = compiled.querySelectorAll('.empty-state');
      
      expect(emptyStates.length).toBe(3); // One for each section
    });

    it('should show edit profile form when editing', () => {
      component.editingProfile = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const profileForm = compiled.querySelector('.profile-form');
      const profileContent = compiled.querySelector('.profile-content');
      
      expect(profileForm).toBeTruthy();
      expect(profileContent).toBeFalsy();
    });

    it('should display quick actions', () => {
      const compiled = fixture.nativeElement;
      const actionButtons = compiled.querySelectorAll('.action-btn');
      
      expect(actionButtons.length).toBe(4);
      expect(actionButtons[0].textContent).toContain('Search Properties');
      expect(actionButtons[1].textContent).toContain('Calculate Payments');
      expect(actionButtons[2].textContent).toContain('Apply for Loan');
      expect(actionButtons[3].textContent).toContain('Contact Support');
    });

    it('should show limited favorite properties', () => {
      // Add more properties to test the slice(0, 6) functionality
      const manyProperties = Array.from({ length: 10 }, (_, i) => ({
        ...mockProperties[0],
        id: i + 10,
        address: `${i + 10} Test St`
      }));
      component.favoriteProperties = manyProperties;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const favoriteCards = compiled.querySelectorAll('.favorite-card');
      
      expect(favoriteCards.length).toBe(6); // Should be limited to 6
    });

    it('should show limited calculation history', () => {
      // Add more calculations to test the slice(0, 5) functionality
      const manyCalculations = Array.from({ length: 10 }, (_, i) => ({
        ...mockCalculations[0],
        loanAmount: 100000 + (i * 10000),
        calculatedAt: new Date()
      }));
      component.calculationHistory = manyCalculations;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const calculationCards = compiled.querySelectorAll('.calculation-card');
      
      expect(calculationCards.length).toBe(5); // Should be limited to 5
    });
  });

  describe('Navigation and Links', () => {
    beforeEach(() => {
      component.user = mockUser;
      component.favoriteProperties = mockProperties;
      component.loanApplications = mockLoanApplications;
      fixture.detectChanges();
    });

    it('should have correct router links', () => {
      const compiled = fixture.nativeElement;
      const routerLinks = compiled.querySelectorAll('[routerLink]');
      
      const linkPaths = Array.from(routerLinks).map(el => el.getAttribute('ng-reflect-router-link'));
      expect(linkPaths).toContain('/loan-application');
      expect(linkPaths).toContain('/search');
      expect(linkPaths).toContain('/mortgage-tools');
    });

    it('should navigate to property details', () => {
      const compiled = fixture.nativeElement;
      const propertyLinks = compiled.querySelectorAll('.favorite-card');
      
      expect(propertyLinks[0].getAttribute('ng-reflect-router-link')).toContain('/properties,1');
      expect(propertyLinks[1].getAttribute('ng-reflect-router-link')).toContain('/properties,2');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      component.profileForm.patchValue({
        firstName: '',
        lastName: '',
        email: ''
      });

      expect(component.profileForm.invalid).toBe(true);
      expect(component.profileForm.get('firstName')?.hasError('required')).toBe(true);
      expect(component.profileForm.get('lastName')?.hasError('required')).toBe(true);
      expect(component.profileForm.get('email')?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      component.profileForm.patchValue({
        email: 'invalid-email'
      });

      expect(component.profileForm.get('email')?.hasError('email')).toBe(true);
    });

    it('should be valid with correct data', () => {
      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      });

      expect(component.profileForm.valid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle favorite properties loading error gracefully', () => {
      propertyService.getFavoriteProperties.and.returnValue(throwError(() => 'Network error'));
      
      component.loadFavoriteProperties();
      
      expect(component.favoriteProperties).toEqual([]);
    });

    it('should handle remove favorite error gracefully', () => {
      propertyService.toggleFavorite.and.returnValue(throwError(() => 'Server error'));
      const mockEvent = new Event('click');
      spyOn(mockEvent, 'preventDefault');
      spyOn(mockEvent, 'stopPropagation');

      component.removeFavorite(mockProperties[0], mockEvent);

      expect(notificationService.error).toHaveBeenCalledWith(
        'Error',
        'Unable to remove property from favorites'
      );
    });
  });
});