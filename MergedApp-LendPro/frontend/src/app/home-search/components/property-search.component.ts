import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { PropertyService } from '../services/property.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Property, PropertySearchFilters, PropertySearchResult, PropertyLocations } from '../../shared/models/property.model';

@Component({
  selector: 'app-property-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1>Find Your Dream Home</h1>
        <p>Search through thousands of properties to find the perfect match</p>
      </div>

      <!-- Search Filters -->
      <form [formGroup]="searchForm" class="section-content compact-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="city">City</label>
            <input 
              type="text" 
              id="city" 
              formControlName="city" 
              placeholder="Enter city name"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="state">State</label>
            <select id="state" formControlName="state" class="form-control">
              <option value="">All States</option>
              <option *ngFor="let state of availableStates" [value]="state">{{ getStateName(state) }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="propertyType">Property Type</label>
            <select id="propertyType" formControlName="propertyType" class="form-control">
              <option value="">All Types</option>
              <option value="Single Family">Single Family</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Multi-Family">Multi-Family</option>
            </select>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Price Range</label>
            <div class="price-inputs">
              <input 
                type="number" 
                formControlName="minPrice" 
                placeholder="Min price"
                class="form-control"
              />
              <span class="range-separator">to</span>
              <input 
                type="number" 
                formControlName="maxPrice" 
                placeholder="Max price"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Bedrooms</label>
            <div class="button-group">
              <button 
                *ngFor="let bed of bedroomOptions" 
                type="button"
                class="btn btn-outline btn-sm"
                [class.btn-primary]="searchForm.get('minBedrooms')?.value === bed"
                [class.btn-outline]="searchForm.get('minBedrooms')?.value !== bed"
                (click)="setMinBedrooms(bed)"
              >
                {{ bed === 5 ? '5+' : bed }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Bathrooms</label>
            <div class="button-group">
              <button 
                *ngFor="let bath of bathroomOptions" 
                type="button"
                class="btn btn-outline btn-sm"
                [class.btn-primary]="searchForm.get('minBathrooms')?.value === bath"
                [class.btn-outline]="searchForm.get('minBathrooms')?.value !== bath"
                (click)="setMinBathrooms(bath)"
              >
                {{ bath === 4 ? '4+' : bath }}
              </button>
            </div>
          </div>
        </div>

        <div class="button-group-center mt-md">
          <button type="button" (click)="clearFilters()" class="btn btn-secondary btn-sm">
            Clear Filters
          </button>
          <button type="button" (click)="searchProperties()" class="btn btn-primary btn-sm">
            Search Properties
          </button>
        </div>
      </form>

      <!-- Search Results -->
      <div class="search-results" *ngIf="searchResults">
        <div class="section-header">
          <div class="results-info">
            <h3>{{ searchResults.totalCount }} Properties Found</h3>
            <p class="results-count">Showing {{ ((searchResults.page - 1) * searchResults.pageSize) + 1 }} - 
               {{ Math.min(searchResults.page * searchResults.pageSize, searchResults.totalCount) }} 
               of {{ searchResults.totalCount }} results</p>
          </div>
          
          <div class="sort-controls">
            <label for="sortBy" class="mr-xs">Sort by:</label>
            <select 
              id="sortBy" 
              [(ngModel)]="currentSort.sortBy" 
              (change)="onSortChange()"
              class="form-control mr-xs"
              style="width: auto; display: inline-block;"
            >
              <option value="ListedDate">Newest First</option>
              <option value="Price">Price</option>
              <option value="Bedrooms">Bedrooms</option>
            </select>
            
            <button 
              type="button" 
              class="btn btn-outline btn-sm"
              (click)="toggleSortOrder()"
              [title]="currentSort.sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'"
            >
              {{ currentSort.sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Searching properties...</p>
        </div>

        <!-- Properties Grid -->
        <div *ngIf="!loading" class="card-grid">
          <div 
            *ngFor="let property of searchResults.properties" 
            class="property-card"
          >
            <div class="property-image">
              <img 
                [src]="property.imageUrl || 'assets/images/property-placeholder.jpg'" 
                [alt]="property.address"
                (error)="onImageError($event)"
              />
              <button 
                class="btn btn-outline btn-sm favorite-btn"
                [class.btn-danger]="property.isFavorite"
                [class.btn-outline]="!property.isFavorite"
                (click)="toggleFavorite(property)"
                [title]="property.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="property.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            
            <div class="property-content">
              <div class="property-price">
                {{ formatCurrency(property.price) }}
              </div>
              
              <div class="property-address">
                {{ property.address }}
              </div>
              
              <div class="property-location">
                {{ property.city }}, {{ property.state }} {{ property.zipCode }}
              </div>
              
              <div class="property-specs">
                <span class="spec">{{ property.bedrooms }} bed</span>
                <span class="spec">{{ property.bathrooms }} bath</span>
                <span class="spec">{{ formatNumber(property.squareFeet) }} sqft</span>
              </div>
              
              <div class="property-type">
                {{ property.propertyType }}
              </div>
              
              <div class="property-actions mt-md">
                <button 
                  [routerLink]="['/properties', property.id]" 
                  class="btn btn-primary btn-sm btn-block"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && searchResults.properties.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <h3>No properties found</h3>
          <p>Try adjusting your search filters to see more results</p>
          <button (click)="clearFilters()" class="btn btn-primary">
            Clear Filters
          </button>
        </div>

        <!-- Pagination -->
        <div *ngIf="searchResults.totalPages > 1" class="pagination">
          <button 
            (click)="goToPage(searchResults.page - 1)"
            [disabled]="searchResults.page <= 1"
            class="pagination-btn"
          >
            Previous
          </button>
          
          <div class="pagination-numbers">
            <button 
              *ngFor="let page of getPageNumbers()" 
              (click)="goToPage(page)"
              class="pagination-number"
              [class.active]="page === searchResults.page"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            (click)="goToPage(searchResults.page + 1)"
            [disabled]="searchResults.page >= searchResults.totalPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-lg);
    }

    .search-header {
      text-align: center;
      margin-bottom: var(--space-lg);
    }

    .search-header h1 {
      font-size: var(--text-3xl);
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
    }

    .search-header p {
      font-size: var(--text-lg);
      color: var(--text-secondary);
    }

    /* Search Results Section */
    .search-results {
      margin-top: var(--space-xl);
    }

    .results-info h3 {
      margin: 0;
      color: var(--primary-dark);
      font-size: var(--text-xl);
    }

    .results-count {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin: var(--space-xs) 0 0 0;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .sort-controls label {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: 500;
    }

    /* Custom Form Grid for Property Search - Fix overlapping issue */
    .form-grid {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: var(--space-md) !important;
      width: 100% !important;
    }
    
    .form-grid .form-group {
      flex: 1 1 320px !important;
      min-width: 320px !important;
      max-width: calc(50% - var(--space-lg)) !important;
      margin-bottom: var(--space-sm) !important;
      margin-right: 0 !important;
    }
    
    /* Ensure form controls don't overflow */
    .form-grid .form-group .form-control {
      width: 100% !important;
      box-sizing: border-box !important;
    }

    /* Compact Form Styling */
    .compact-form {
      background: var(--background-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: var(--space-lg) !important;
      margin-bottom: var(--space-lg) !important;
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    /* Enhanced Form Control Styling */
    .form-control {
      line-height: 1.4;
      font-size: var(--text-sm);
      padding: var(--space-xs) var(--space-sm);
      height: 40px;
      
      &::placeholder {
        color: var(--text-muted);
        opacity: 0.8;
        font-size: var(--text-sm);
      }
      
      &:focus::placeholder {
        opacity: 0.5;
      }
    }

    /* Compact form group styling */
    .compact-form .form-group {
      margin-bottom: var(--space-sm) !important;
    }

    .compact-form .form-group label {
      margin-bottom: var(--space-xs);
      font-size: var(--text-sm);
      font-weight: 500;
    }

    /* Price Range Inputs */
    .price-inputs {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .price-inputs .form-control {
      flex: 1;
    }

    .range-separator {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: 500;
      padding: 0 var(--space-xs);
    }

    /* Property Cards */
    .property-card {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
      overflow: hidden;
      transition: all 0.2s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .property-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
      border-color: var(--primary-dark);
    }

    .property-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .property-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .favorite-btn {
      position: absolute;
      top: var(--space-sm);
      right: var(--space-sm);
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(4px);
      border-color: var(--border-medium);
      color: var(--text-secondary);
    }

    .favorite-btn:hover {
      background: rgba(255, 255, 255, 1) !important;
      color: var(--primary-dark);
      border-color: var(--primary-dark);
    }

    .favorite-btn.btn-danger {
      background: rgba(255, 255, 255, 0.95) !important;
      color: var(--accent-danger);
      border-color: var(--accent-danger);
    }

    .favorite-btn.btn-danger:hover {
      background: var(--accent-danger) !important;
      color: var(--text-white);
      border-color: var(--accent-danger);
    }

    .property-content {
      padding: var(--space-md);
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .property-price {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
    }

    .property-address {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-xs);
      font-size: var(--text-base);
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    .property-location {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin-bottom: var(--space-md);
    }

    .property-specs {
      display: flex;
      gap: var(--space-sm);
      margin-bottom: var(--space-xs);
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .spec {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .property-type {
      color: var(--accent-success);
      font-weight: 600;
      font-size: var(--text-sm);
      margin-bottom: var(--space-md);
    }

    /* Pagination Numbers */
    .pagination-numbers {
      display: flex;
      gap: var(--space-xs);
      align-items: center;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .search-container {
        padding: var(--space-sm);
      }
      
      .search-header h1 {
        font-size: var(--text-2xl);
      }
      
      /* Responsive form grid - ensure proper spacing on tablets */
      .form-grid .form-group {
        flex: 1 1 280px !important;
        min-width: 280px !important;
        max-width: 100% !important;
      }
      
      .sort-controls {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-xs);
      }
      
      .sort-controls select {
        width: 100%;
      }
      
      .pagination-numbers {
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .search-container {
        padding: var(--space-xs);
      }
      
      /* Mobile form grid - single column to prevent overlap */
      .form-grid {
        flex-direction: column !important;
        gap: var(--space-sm) !important;
      }
      
      .form-grid .form-group {
        flex: none !important;
        min-width: auto !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      
      .property-specs {
        gap: var(--space-xs);
        flex-direction: column;
        align-items: flex-start;
      }
      
      .property-content {
        padding: var(--space-sm);
      }
    }
    
    /* Fix property actions spacing */
    .property-actions {
      margin-top: auto;
      padding-top: var(--space-md);
    }
  `]
})
export class PropertySearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  searchResults: PropertySearchResult | null = null;
  loading = false;
  bedroomOptions = [1, 2, 3, 4, 5];
  bathroomOptions = [1, 2, 3, 4];
  currentSort = { sortBy: 'ListedDate', sortOrder: 'desc' };
  availableStates: string[] = [];
  availableCities: string[] = [];
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private notificationService: NotificationService
  ) {
    this.searchForm = this.fb.group({
      city: [''],
      state: [''],
      propertyType: [''],
      minPrice: [null],
      maxPrice: [null],
      minBedrooms: [null],
      maxBedrooms: [null],
      minBathrooms: [null],
      maxBathrooms: [null]
    });
  }

  ngOnInit(): void {
    // Load available locations
    this.propertyService.getLocations().subscribe({
      next: (locations: PropertyLocations) => {
        this.availableStates = locations.states;
        this.availableCities = locations.cities;
      },
      error: (error) => {
        console.error('Failed to load locations:', error);
        // Fallback to basic states if API fails
        this.availableStates = ['TX', 'CA', 'FL', 'NY'];
      }
    });

    // Auto-search when form values change (debounced)
    this.subscriptions.add(
      this.searchForm.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(() => {
        if (this.hasSearchCriteria()) {
          this.searchProperties();
        }
      })
    );

    // Initial search to show all properties
    this.searchProperties();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  searchProperties(): void {
    this.loading = true;
    
    const filters: PropertySearchFilters = {
      ...this.searchForm.value,
      page: this.searchResults?.page || 1,
      pageSize: 12,
      sortBy: this.currentSort.sortBy,
      sortOrder: this.currentSort.sortOrder
    };

    this.propertyService.searchProperties(filters).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Search Failed', 'Unable to load properties');
        this.loading = false;
        console.error('Search error:', error);
      }
    });
  }

  toggleFavorite(property: Property): void {
    this.propertyService.toggleFavorite(property.id).subscribe({
      next: (result) => {
        property.isFavorite = result.isFavorite;
        const action = result.isFavorite ? 'added to' : 'removed from';
        this.notificationService.success(
          'Favorites Updated', 
          `Property ${action} your favorites`
        );
      },
      error: () => {
        this.notificationService.error('Error', 'Please log in to manage favorites');
      }
    });
  }


  setMinBedrooms(beds: number): void {
    const current = this.searchForm.get('minBedrooms')?.value;
    this.searchForm.patchValue({
      minBedrooms: current === beds ? null : beds
    });
  }

  setMinBathrooms(baths: number): void {
    const current = this.searchForm.get('minBathrooms')?.value;
    this.searchForm.patchValue({
      minBathrooms: current === baths ? null : baths
    });
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.currentSort = { sortBy: 'ListedDate', sortOrder: 'desc' };
    this.searchProperties();
  }

  onSortChange(): void {
    this.searchProperties();
  }

  toggleSortOrder(): void {
    this.currentSort.sortOrder = this.currentSort.sortOrder === 'asc' ? 'desc' : 'asc';
    this.searchProperties();
  }

  goToPage(page: number): void {
    if (this.searchResults && page >= 1 && page <= this.searchResults.totalPages) {
      this.searchResults.page = page;
      this.searchProperties();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    if (!this.searchResults) return [];
    
    const current = this.searchResults.page;
    const total = this.searchResults.totalPages;
    const pages: number[] = [];
    
    // Show up to 5 page numbers around current page
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  hasSearchCriteria(): boolean {
    const formValue = this.searchForm.value;
    return Object.values(formValue).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/property-placeholder.jpg';
  }

  getStateName(stateCode: string): string {
    const stateNames: { [key: string]: string } = {
      'AZ': 'Arizona',
      'CA': 'California',
      'CO': 'Colorado',
      'FL': 'Florida',
      'GA': 'Georgia',
      'IL': 'Illinois',
      'NC': 'North Carolina',
      'NY': 'New York',
      'OR': 'Oregon',
      'TN': 'Tennessee',
      'TX': 'Texas',
      'WA': 'Washington'
    };
    return stateNames[stateCode] || stateCode;
  }

  // Add to module imports
  Math = Math;
}