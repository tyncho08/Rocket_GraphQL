import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { PropertyDetailComponent } from './property-detail.component';
import { PropertyService } from '../services/property.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Property, PropertySearchResult } from '../../shared/models/property.model';

describe('PropertyDetailComponent', () => {
  let component: PropertyDetailComponent;
  let fixture: ComponentFixture<PropertyDetailComponent>;
  let propertyService: jasmine.SpyObj<PropertyService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockProperty: Property = {
    id: 1,
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    propertyType: 'Single Family',
    imageUrl: 'test-image.jpg',
    isFavorite: false,
    description: 'Beautiful home with modern amenities',
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
  };

  const mockSimilarProperties: Property[] = [
    {
      ...mockProperty,
      id: 2,
      address: '456 Oak Ave',
      price: 425000,
      bedrooms: 2,
      bathrooms: 2
    },
    {
      ...mockProperty,
      id: 3,
      address: '789 Pine St',
      price: 475000,
      bedrooms: 4,
      bathrooms: 3
    }
  ];

  const mockSearchResult: PropertySearchResult = {
    properties: mockSimilarProperties,
    totalCount: 2,
    page: 1,
    pageSize: 3,
    totalPages: 1
  };

  beforeEach(async () => {
    const propertyServiceSpy = jasmine.createSpyObj('PropertyService', [
      'getPropertyById',
      'searchProperties',
      'toggleFavorite'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'error',
      'success',
      'info'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const paramsSubject = new BehaviorSubject({ id: '1' });
    mockActivatedRoute = {
      params: paramsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [
        PropertyDetailComponent,
        CommonModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PropertyService, useValue: propertyServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailComponent);
    component = fixture.componentInstance;
    propertyService = TestBed.inject(PropertyService) as jasmine.SpyObj<PropertyService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default service responses
    propertyService.getPropertyById.and.returnValue(of(mockProperty));
    propertyService.searchProperties.and.returnValue(of(mockSearchResult));
    propertyService.toggleFavorite.and.returnValue(of({ isFavorite: true }));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with null property and empty similar properties', () => {
      expect(component.property).toBeNull();
      expect(component.similarProperties).toEqual([]);
      expect(component.estimatedPayment).toBe(0);
    });

    it('should load property on route params change', () => {
      component.ngOnInit();
      expect(propertyService.getPropertyById).toHaveBeenCalledWith(1);
    });

    it('should handle invalid property ID from route', () => {
      mockActivatedRoute.params = of({ id: 'invalid' });
      component.ngOnInit();
      expect(propertyService.getPropertyById).not.toHaveBeenCalled();
    });

    it('should handle missing property ID from route', () => {
      mockActivatedRoute.params = of({});
      component.ngOnInit();
      expect(propertyService.getPropertyById).not.toHaveBeenCalled();
    });
  });

  describe('Property Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should load property successfully', () => {
      component.loadProperty(1);
      
      expect(propertyService.getPropertyById).toHaveBeenCalledWith(1);
      expect(component.property).toEqual(mockProperty);
      expect(component.estimatedPayment).toBeGreaterThan(0);
    });

    it('should load similar properties after loading main property', () => {
      component.loadProperty(1);
      
      expect(propertyService.searchProperties).toHaveBeenCalledWith({
        city: mockProperty.city,
        state: mockProperty.state,
        minPrice: mockProperty.price * 0.8,
        maxPrice: mockProperty.price * 1.2,
        propertyType: mockProperty.propertyType,
        page: 1,
        pageSize: 3,
        sortBy: 'Price',
        sortOrder: 'asc'
      });
    });

    it('should handle property load error', () => {
      const errorResponse = { message: 'Property not found' };
      propertyService.getPropertyById.and.returnValue(throwError(() => errorResponse));

      component.loadProperty(1);

      expect(notificationService.error).toHaveBeenCalledWith(
        'Error',
        'Unable to load property details'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/search']);
    });

    it('should filter out current property from similar properties', () => {
      const searchResultWithCurrentProperty: PropertySearchResult = {
        ...mockSearchResult,
        properties: [mockProperty, ...mockSimilarProperties]
      };
      propertyService.searchProperties.and.returnValue(of(searchResultWithCurrentProperty));

      component.loadProperty(1);

      expect(component.similarProperties).not.toContain(jasmine.objectContaining({ id: 1 }));
      expect(component.similarProperties.length).toBe(2);
    });

    it('should handle similar properties load error gracefully', () => {
      propertyService.searchProperties.and.returnValue(throwError(() => 'Network error'));

      component.loadProperty(1);

      expect(component.similarProperties).toEqual([]);
      expect(notificationService.error).not.toHaveBeenCalled(); // Should not show error for similar properties
    });

    it('should limit similar properties to 3', () => {
      const manyProperties = Array.from({ length: 10 }, (_, i) => ({
        ...mockProperty,
        id: i + 10,
        address: `${i + 10} Test St`
      }));
      const searchResult: PropertySearchResult = {
        ...mockSearchResult,
        properties: manyProperties
      };
      propertyService.searchProperties.and.returnValue(of(searchResult));

      component.loadProperty(1);

      expect(component.similarProperties.length).toBe(3);
    });
  });

  describe('Mortgage Calculation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.property = mockProperty;
    });

    it('should calculate estimated monthly payment correctly', () => {
      component.calculateEstimatedPayment();

      // Based on $450,000 property, 20% down, 6.5% APR, 30 years
      // Loan amount: $360,000
      const expectedPayment = 2274.04; // Approximate expected value
      expect(component.estimatedPayment).toBeCloseTo(expectedPayment, 0);
    });

    it('should not calculate payment when property is null', () => {
      component.property = null;
      component.estimatedPayment = 0;

      component.calculateEstimatedPayment();

      expect(component.estimatedPayment).toBe(0);
    });

    it('should use correct loan parameters for calculation', () => {
      const testProperty = { ...mockProperty, price: 500000 };
      component.property = testProperty;

      component.calculateEstimatedPayment();

      // Should be based on 80% of property price (20% down payment)
      // at 6.5% APR for 30 years
      expect(component.estimatedPayment).toBeGreaterThan(2000);
      expect(component.estimatedPayment).toBeLessThan(3000);
    });
  });

  describe('Favorite Toggle', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.property = mockProperty;
    });

    it('should toggle favorite successfully', () => {
      const toggleResponse = { isFavorite: true };
      propertyService.toggleFavorite.and.returnValue(of(toggleResponse));

      component.toggleFavorite();

      expect(propertyService.toggleFavorite).toHaveBeenCalledWith(mockProperty.id);
      expect(component.property!.isFavorite).toBe(true);
      expect(notificationService.success).toHaveBeenCalledWith(
        'Favorites Updated',
        'Property added to your favorites'
      );
    });

    it('should handle remove from favorites', () => {
      component.property!.isFavorite = true;
      const toggleResponse = { isFavorite: false };
      propertyService.toggleFavorite.and.returnValue(of(toggleResponse));

      component.toggleFavorite();

      expect(component.property!.isFavorite).toBe(false);
      expect(notificationService.success).toHaveBeenCalledWith(
        'Favorites Updated',
        'Property removed from your favorites'
      );
    });

    it('should handle favorite toggle error', () => {
      propertyService.toggleFavorite.and.returnValue(throwError(() => 'Auth error'));

      component.toggleFavorite();

      expect(notificationService.error).toHaveBeenCalledWith(
        'Error',
        'Please log in to manage favorites'
      );
    });

    it('should not toggle favorite when property is null', () => {
      component.property = null;

      component.toggleFavorite();

      expect(propertyService.toggleFavorite).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate back to search', () => {
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/search']);
    });

    it('should show contact agent info', () => {
      component.contactAgent();
      expect(notificationService.info).toHaveBeenCalledWith(
        'Contact Agent',
        'Agent contact feature coming soon!'
      );
    });
  });

  describe('Utility Functions', () => {
    it('should format currency correctly', () => {
      expect(component.formatCurrency(450000)).toBe('$450,000');
      expect(component.formatCurrency(1234567)).toBe('$1,234,567');
      expect(component.formatCurrency(999.99)).toBe('$1,000');
    });

    it('should format numbers correctly', () => {
      expect(component.formatNumber(1800)).toBe('1,800');
      expect(component.formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle image errors', () => {
      const mockEvent = {
        target: { src: 'original-image.jpg' }
      };

      component.onImageError(mockEvent);

      expect(mockEvent.target.src).toBe('/assets/images/property-placeholder.jpg');
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
      component.property = mockProperty;
      component.similarProperties = mockSimilarProperties;
      component.estimatedPayment = 2274;
      fixture.detectChanges();
    });

    it('should display property details when loaded', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('.property-price')?.textContent).toContain('$450,000');
      expect(compiled.querySelector('.property-address h1')?.textContent).toContain('123 Main St');
      expect(compiled.querySelector('.location')?.textContent).toContain('Austin, TX 78701');
    });

    it('should display property highlights', () => {
      const compiled = fixture.nativeElement;
      const highlights = compiled.querySelectorAll('.highlight-item');
      
      expect(highlights.length).toBe(4);
      expect(highlights[0].textContent).toContain('3'); // bedrooms
      expect(highlights[1].textContent).toContain('2'); // bathrooms
      expect(highlights[2].textContent).toContain('1,800'); // square feet
      expect(highlights[3].textContent).toContain('Single Family'); // property type
    });

    it('should display property description when available', () => {
      const compiled = fixture.nativeElement;
      const description = compiled.querySelector('.property-description');
      
      expect(description?.textContent).toContain('Beautiful home with modern amenities');
    });

    it('should display estimated mortgage payment', () => {
      const compiled = fixture.nativeElement;
      const paymentAmount = compiled.querySelector('.payment-amount');
      
      expect(paymentAmount?.textContent).toContain('$2,274');
    });

    it('should display similar properties', () => {
      const compiled = fixture.nativeElement;
      const similarCards = compiled.querySelectorAll('.similar-property-card');
      
      expect(similarCards.length).toBe(2);
    });

    it('should show loading template when property is null', () => {
      component.property = null;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingContainer = compiled.querySelector('.loading-container');
      const propertyContainer = compiled.querySelector('.property-detail-container');
      
      expect(loadingContainer).toBeTruthy();
      expect(propertyContainer).toBeFalsy();
    });

    it('should display favorite button with correct state', () => {
      const compiled = fixture.nativeElement;
      const favoriteBtn = compiled.querySelector('.favorite-btn');
      
      expect(favoriteBtn?.textContent).toContain('Add to Favorites');
      expect(favoriteBtn?.classList).not.toContain('active');
    });

    it('should display active favorite button when property is favorited', () => {
      component.property!.isFavorite = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const favoriteBtn = compiled.querySelector('.favorite-btn');
      
      expect(favoriteBtn?.textContent).toContain('Remove from Favorites');
      expect(favoriteBtn?.classList).toContain('active');
    });

    it('should calculate and display price per square foot', () => {
      const compiled = fixture.nativeElement;
      const detailRows = compiled.querySelectorAll('.detail-row');
      const pricePerSqFtRow = Array.from(detailRows).find(row => 
        row.textContent?.includes('Price per Sq Ft')
      );
      
      expect(pricePerSqFtRow?.textContent).toContain('$250'); // $450,000 / 1,800 sqft
    });

    it('should display mortgage calculation breakdown', () => {
      const compiled = fixture.nativeElement;
      const breakdown = compiled.querySelector('.payment-breakdown');
      
      expect(breakdown?.textContent).toContain('$360,000'); // Loan amount (80%)
      expect(breakdown?.textContent).toContain('$90,000'); // Down payment (20%)
    });
  });

  describe('Route Parameter Changes', () => {
    it('should reload property when route parameter changes', () => {
      component.ngOnInit();
      propertyService.getPropertyById.calls.reset();

      // Simulate route parameter change
      const paramsSubject = (mockActivatedRoute.params as any).source;
      paramsSubject.next({ id: '2' });

      expect(propertyService.getPropertyById).toHaveBeenCalledWith(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      propertyService.getPropertyById.and.returnValue(throwError(() => ({
        status: 500,
        message: 'Internal Server Error'
      })));

      component.loadProperty(1);

      expect(component.property).toBeNull();
      expect(notificationService.error).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/search']);
    });

    it('should handle 404 errors specifically', () => {
      propertyService.getPropertyById.and.returnValue(throwError(() => ({
        status: 404,
        message: 'Property not found'
      })));

      component.loadProperty(1);

      expect(notificationService.error).toHaveBeenCalledWith(
        'Error',
        'Unable to load property details'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/search']);
    });
  });
});