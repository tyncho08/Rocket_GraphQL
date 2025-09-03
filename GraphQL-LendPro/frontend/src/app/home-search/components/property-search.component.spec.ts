import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { PropertySearchComponent } from './property-search.component';
import { PropertyService } from '../services/property.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Property, PropertySearchResult, PropertySearchFilters } from '../../shared/models/property.model';

describe('PropertySearchComponent', () => {
  let component: PropertySearchComponent;
  let fixture: ComponentFixture<PropertySearchComponent>;
  let propertyService: jasmine.SpyObj<PropertyService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockSearchResult: PropertySearchResult = {
    properties: [
      {
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
        address: '456 Oak Ave',
        city: 'Austin',
        state: 'TX',
        zipCode: '78702',
        price: 525000,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2200,
        propertyType: 'Townhouse',
        imageUrl: 'test-image-2.jpg',
        isFavorite: true,
        description: 'Modern townhouse',
        yearBuilt: 2021,
        lotSize: 0.15,
        listingAgent: 'Jane Smith',
        listingDate: '2024-01-15',
        daysOnMarket: 15,
        mlsNumber: 'MLS456',
        latitude: 30.2672,
        longitude: -97.7431,
        features: ['garage'],
        virtualTourUrl: '',
        status: 'Active'
      }
    ],
    totalCount: 25,
    page: 1,
    pageSize: 12,
    totalPages: 3
  };

  beforeEach(async () => {
    const propertyServiceSpy = jasmine.createSpyObj('PropertyService', [
      'searchProperties',
      'toggleFavorite'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'error',
      'success',
      'info'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PropertySearchComponent,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PropertyService, useValue: propertyServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertySearchComponent);
    component = fixture.componentInstance;
    propertyService = TestBed.inject(PropertyService) as jasmine.SpyObj<PropertyService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;

    // Setup default service response
    propertyService.searchProperties.and.returnValue(of(mockSearchResult));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize search form with empty values', () => {
      expect(component.searchForm.get('city')?.value).toBe('');
      expect(component.searchForm.get('state')?.value).toBe('');
      expect(component.searchForm.get('propertyType')?.value).toBe('');
      expect(component.searchForm.get('minPrice')?.value).toBeNull();
      expect(component.searchForm.get('maxPrice')?.value).toBeNull();
      expect(component.searchForm.get('minBedrooms')?.value).toBeNull();
      expect(component.searchForm.get('minBathrooms')?.value).toBeNull();
    });

    it('should initialize bedroom and bathroom options', () => {
      expect(component.bedroomOptions).toEqual([1, 2, 3, 4, 5]);
      expect(component.bathroomOptions).toEqual([1, 2, 3, 4]);
    });

    it('should initialize current sort settings', () => {
      expect(component.currentSort).toEqual({
        sortBy: 'ListedDate',
        sortOrder: 'desc'
      });
    });

    it('should perform initial search on ngOnInit', () => {
      component.ngOnInit();
      expect(propertyService.searchProperties).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should search properties with correct filters', () => {
      const expectedFilters: PropertySearchFilters = {
        city: '',
        state: '',
        propertyType: '',
        minPrice: null,
        maxPrice: null,
        minBedrooms: null,
        maxBedrooms: null,
        minBathrooms: null,
        maxBathrooms: null,
        page: 1,
        pageSize: 12,
        sortBy: 'ListedDate',
        sortOrder: 'desc'
      };

      component.searchProperties();

      expect(propertyService.searchProperties).toHaveBeenCalledWith(expectedFilters);
    });

    it('should set loading state during search', () => {
      component.searchProperties();
      expect(component.loading).toBe(true);

      // After observable completes
      expect(component.loading).toBe(false);
    });

    it('should update search results on successful search', () => {
      component.searchProperties();
      expect(component.searchResults).toEqual(mockSearchResult);
    });

    it('should handle search errors', () => {
      const errorResponse = { message: 'Network error' };
      propertyService.searchProperties.and.returnValue(throwError(() => errorResponse));

      component.searchProperties();

      expect(notificationService.error).toHaveBeenCalledWith(
        'Search Failed',
        'Unable to load properties'
      );
      expect(component.loading).toBe(false);
    });

    it('should auto-search when form values change with debounce', fakeAsync(() => {
      component.ngOnInit();
      propertyService.searchProperties.calls.reset();

      component.searchForm.patchValue({ city: 'Austin' });
      tick(300); // Less than debounce time
      expect(propertyService.searchProperties).not.toHaveBeenCalled();

      tick(300); // Complete debounce time (500ms total)
      expect(propertyService.searchProperties).toHaveBeenCalled();
    }));

    it('should not auto-search when no search criteria', fakeAsync(() => {
      spyOn(component, 'hasSearchCriteria').and.returnValue(false);
      component.ngOnInit();
      propertyService.searchProperties.calls.reset();

      component.searchForm.patchValue({ city: '' });
      tick(500);
      expect(propertyService.searchProperties).not.toHaveBeenCalled();
    }));
  });

  describe('Filter Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set minimum bedrooms', () => {
      component.setMinBedrooms(3);
      expect(component.searchForm.get('minBedrooms')?.value).toBe(3);
    });

    it('should toggle minimum bedrooms when clicked again', () => {
      component.setMinBedrooms(3);
      expect(component.searchForm.get('minBedrooms')?.value).toBe(3);
      
      component.setMinBedrooms(3);
      expect(component.searchForm.get('minBedrooms')?.value).toBeNull();
    });

    it('should set minimum bathrooms', () => {
      component.setMinBathrooms(2);
      expect(component.searchForm.get('minBathrooms')?.value).toBe(2);
    });

    it('should toggle minimum bathrooms when clicked again', () => {
      component.setMinBathrooms(2);
      expect(component.searchForm.get('minBathrooms')?.value).toBe(2);
      
      component.setMinBathrooms(2);
      expect(component.searchForm.get('minBathrooms')?.value).toBeNull();
    });

    it('should clear all filters', () => {
      component.searchForm.patchValue({
        city: 'Austin',
        state: 'TX',
        minPrice: 100000,
        minBedrooms: 2
      });
      component.currentSort = { sortBy: 'Price', sortOrder: 'asc' };

      component.clearFilters();

      expect(component.searchForm.value).toEqual({
        city: null,
        state: null,
        propertyType: null,
        minPrice: null,
        maxPrice: null,
        minBedrooms: null,
        maxBedrooms: null,
        minBathrooms: null,
        maxBathrooms: null
      });
      expect(component.currentSort).toEqual({
        sortBy: 'ListedDate',
        sortOrder: 'desc'
      });
      expect(propertyService.searchProperties).toHaveBeenCalled();
    });

    it('should check if search criteria exists', () => {
      expect(component.hasSearchCriteria()).toBe(false);

      component.searchForm.patchValue({ city: 'Austin' });
      expect(component.hasSearchCriteria()).toBe(true);

      component.searchForm.patchValue({ city: '' });
      expect(component.hasSearchCriteria()).toBe(false);
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.searchResults = mockSearchResult;
    });

    it('should trigger search on sort change', () => {
      propertyService.searchProperties.calls.reset();
      component.onSortChange();
      expect(propertyService.searchProperties).toHaveBeenCalled();
    });

    it('should toggle sort order', () => {
      component.currentSort.sortOrder = 'desc';
      component.toggleSortOrder();
      expect(component.currentSort.sortOrder).toBe('asc');

      component.toggleSortOrder();
      expect(component.currentSort.sortOrder).toBe('desc');
    });

    it('should trigger search when toggling sort order', () => {
      propertyService.searchProperties.calls.reset();
      component.toggleSortOrder();
      expect(propertyService.searchProperties).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.searchResults = mockSearchResult;
    });

    it('should go to valid page', () => {
      spyOn(window, 'scrollTo');
      propertyService.searchProperties.calls.reset();

      component.goToPage(2);

      expect(component.searchResults!.page).toBe(2);
      expect(propertyService.searchProperties).toHaveBeenCalled();
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('should not go to invalid page (too low)', () => {
      const originalPage = component.searchResults!.page;
      propertyService.searchProperties.calls.reset();

      component.goToPage(0);

      expect(component.searchResults!.page).toBe(originalPage);
      expect(propertyService.searchProperties).not.toHaveBeenCalled();
    });

    it('should not go to invalid page (too high)', () => {
      const originalPage = component.searchResults!.page;
      propertyService.searchProperties.calls.reset();

      component.goToPage(10);

      expect(component.searchResults!.page).toBe(originalPage);
      expect(propertyService.searchProperties).not.toHaveBeenCalled();
    });

    it('should generate page numbers correctly', () => {
      component.searchResults = { ...mockSearchResult, page: 3, totalPages: 8 };
      const pages = component.getPageNumbers();
      expect(pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle no search results for page numbers', () => {
      component.searchResults = null;
      const pages = component.getPageNumbers();
      expect(pages).toEqual([]);
    });
  });

  describe('Favorite Toggle', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.searchResults = mockSearchResult;
    });

    it('should toggle favorite successfully', () => {
      const property = mockSearchResult.properties[0];
      const toggleResponse = { isFavorite: true };
      propertyService.toggleFavorite.and.returnValue(of(toggleResponse));

      component.toggleFavorite(property);

      expect(propertyService.toggleFavorite).toHaveBeenCalledWith(property.id);
      expect(property.isFavorite).toBe(true);
      expect(notificationService.success).toHaveBeenCalledWith(
        'Favorites Updated',
        'Property added to your favorites'
      );
    });

    it('should handle remove from favorites', () => {
      const property = mockSearchResult.properties[1]; // Already favorite
      const toggleResponse = { isFavorite: false };
      propertyService.toggleFavorite.and.returnValue(of(toggleResponse));

      component.toggleFavorite(property);

      expect(property.isFavorite).toBe(false);
      expect(notificationService.success).toHaveBeenCalledWith(
        'Favorites Updated',
        'Property removed from your favorites'
      );
    });

    it('should handle favorite toggle error', () => {
      const property = mockSearchResult.properties[0];
      propertyService.toggleFavorite.and.returnValue(throwError(() => 'Auth error'));

      component.toggleFavorite(property);

      expect(notificationService.error).toHaveBeenCalledWith(
        'Error',
        'Please log in to manage favorites'
      );
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

    it('should handle image errors', () => {
      const mockEvent = {
        target: { src: 'original-image.jpg' }
      };

      component.onImageError(mockEvent);

      expect(mockEvent.target.src).toBe('/assets/images/property-placeholder.jpg');
    });

    it('should calculate mortgage', () => {
      const property = mockSearchResult.properties[0];
      component.calculateMortgage(property);

      expect(notificationService.info).toHaveBeenCalledWith(
        'Calculate Mortgage',
        'Redirecting to mortgage calculator...'
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

  describe('DOM Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.searchResults = mockSearchResult;
      fixture.detectChanges();
    });

    it('should display search results count', () => {
      const compiled = fixture.nativeElement;
      const resultsCount = compiled.querySelector('.results-count h3');
      expect(resultsCount?.textContent).toContain('25 Properties Found');
    });

    it('should display property cards', () => {
      const compiled = fixture.nativeElement;
      const propertyCards = compiled.querySelectorAll('.property-card');
      expect(propertyCards.length).toBe(2);
    });

    it('should show loading state', () => {
      component.loading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const loadingState = compiled.querySelector('.loading-state');
      expect(loadingState).toBeTruthy();
    });

    it('should show empty state when no results', () => {
      component.searchResults = { ...mockSearchResult, properties: [] };
      component.loading = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should highlight active bedroom button', () => {
      component.searchForm.patchValue({ minBedrooms: 3 });
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const bedroomButtons = compiled.querySelectorAll('.bedroom-btn');
      const activeButton = Array.from(bedroomButtons).find(btn => 
        btn.classList.contains('active')
      );
      expect(activeButton?.textContent?.trim()).toBe('3');
    });

    it('should highlight active bathroom button', () => {
      component.searchForm.patchValue({ minBathrooms: 2 });
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const bathroomButtons = compiled.querySelectorAll('.bathroom-btn');
      const activeButton = Array.from(bathroomButtons).find(btn => 
        btn.classList.contains('active')
      );
      expect(activeButton?.textContent?.trim()).toBe('2');
    });
  });
});