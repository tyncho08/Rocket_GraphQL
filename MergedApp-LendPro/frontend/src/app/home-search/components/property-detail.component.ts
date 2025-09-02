import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PropertyService } from '../services/property.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Property } from '../../shared/models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="property-detail-container" *ngIf="property; else loading">
      <div class="property-header">
        <button 
          class="back-button" 
          (click)="goBack()"
          aria-label="Go back to search results"
        >
          ← Back to Search
        </button>
        
        <button 
          class="favorite-btn"
          [class.active]="property.isFavorite"
          (click)="toggleFavorite()"
          title="{{ property.isFavorite ? 'Remove from favorites' : 'Add to favorites' }}"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="property.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {{ property.isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
        </button>
      </div>

      <div class="property-main">
        <div class="property-image-section">
          <div class="main-image">
            <img 
              [src]="property.imageUrl || '/assets/images/property-placeholder.jpg'" 
              [alt]="property.address"
              (error)="onImageError($event)"
            />
          </div>
        </div>

        <div class="property-info-section">
          <div class="property-price">
            {{ formatCurrency(property.price) }}
          </div>

          <div class="property-address">
            <h1>{{ property.address }}</h1>
            <p class="location">{{ property.city }}, {{ property.state }} {{ property.zipCode }}</p>
          </div>

          <div class="property-highlights">
            <div class="highlight-item">
              <div class="highlight-value">{{ property.bedrooms }}</div>
              <div class="highlight-label">Bedrooms</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-value">{{ property.bathrooms }}</div>
              <div class="highlight-label">Bathrooms</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-value">{{ formatNumber(property.squareFeet) }}</div>
              <div class="highlight-label">Sq Ft</div>
            </div>
            <div class="highlight-item">
              <div class="highlight-value">{{ property.propertyType }}</div>
              <div class="highlight-label">Type</div>
            </div>
          </div>

          <div class="property-actions">
            <button 
              [routerLink]="['/mortgage-tools']" 
              [queryParams]="{propertyPrice: property.price}"
              class="btn btn-primary btn-large"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="1" height="1"/>
                <rect x="14" y="9" width="1" height="1"/>
                <rect x="9" y="14" width="1" height="1"/>
                <rect x="14" y="14" width="1" height="1"/>
              </svg>
              Calculate Mortgage
            </button>
            <button 
              (click)="contactAgent()" 
              class="btn btn-secondary btn-large"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59532 1.99523 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47145 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.513 12.4135 11.5865 14.4869 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92H22Z"/>
              </svg>
              Contact Agent
            </button>
          </div>
        </div>
      </div>

      <div class="property-details">
        <div class="details-section">
          <h2>Property Details</h2>
          <div class="details-grid">
            <div class="detail-row">
              <span class="detail-label">Property Type:</span>
              <span class="detail-value">{{ property.propertyType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Square Feet:</span>
              <span class="detail-value">{{ formatNumber(property.squareFeet) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bedrooms:</span>
              <span class="detail-value">{{ property.bedrooms }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bathrooms:</span>
              <span class="detail-value">{{ property.bathrooms }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price per Sq Ft:</span>
              <span class="detail-value">{{ formatCurrency(property.price / property.squareFeet) }}</span>
            </div>
          </div>
        </div>

        <div class="description-section" *ngIf="property.description">
          <h2>Description</h2>
          <p class="property-description">{{ property.description }}</p>
        </div>

        <div class="mortgage-estimation">
          <h2>Estimated Monthly Payment</h2>
          <div class="mortgage-preview">
            <div class="mortgage-assumptions">
              <p>Based on a 30-year fixed-rate mortgage with 20% down payment at 6.5% APR:</p>
            </div>
            <div class="payment-estimate">
              <div class="payment-amount">{{ formatCurrency(estimatedPayment) }}/month</div>
              <div class="payment-breakdown">
                <small>
                  Loan Amount: {{ formatCurrency(property.price * 0.8) }} • 
                  Down Payment: {{ formatCurrency(property.price * 0.2) }}
                </small>
              </div>
            </div>
            <button 
              [routerLink]="['/mortgage-tools']" 
              [queryParams]="{propertyPrice: property.price}"
              class="btn btn-outline"
            >
              Get Detailed Calculation
            </button>
          </div>
        </div>

        <div class="nearby-properties">
          <h2>Similar Properties</h2>
          <div *ngIf="similarProperties.length > 0; else noSimilarProperties" class="similar-properties-grid">
            <div 
              *ngFor="let similar of similarProperties" 
              class="similar-property-card"
              [routerLink]="['/properties', similar.id]"
            >
              <img 
                [src]="similar.imageUrl || '/assets/images/property-placeholder.jpg'" 
                [alt]="similar.address"
                (error)="onImageError($event)"
              />
              <div class="similar-property-info">
                <div class="similar-price">{{ formatCurrency(similar.price) }}</div>
                <div class="similar-specs">{{ similar.bedrooms }}bd • {{ similar.bathrooms }}ba</div>
                <div class="similar-address">{{ similar.address }}</div>
              </div>
            </div>
          </div>
          <ng-template #noSimilarProperties>
            <div class="no-similar-properties">
              <div class="no-similar-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h3>No Similar Properties Found</h3>
              <p>We couldn't find similar properties in this area right now. Try browsing all available properties in {{ property.city }}, {{ property.state }}.</p>
              <button 
                [routerLink]="['/search']" 
                [queryParams]="{city: property.city, state: property.state}"
                class="btn btn-outline browse-all-btn"
              >
                Browse All Properties in {{ property.city }}
              </button>
            </div>
          </ng-template>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .property-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-lg);
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
      gap: var(--space-md);
      flex-wrap: wrap;
    }

    .back-button {
      background: var(--background-primary);
      border: 1px solid var(--border-medium);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s ease;
      font-size: var(--text-base);
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      text-decoration: none;
    }

    .back-button:hover {
      background-color: var(--background-tertiary);
      border-color: var(--primary-dark);
      color: var(--primary-dark);
      transform: translateY(-1px);
    }

    .favorite-btn {
      background: var(--background-primary);
      border: 2px solid var(--accent-danger);
      color: var(--accent-danger);
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
      font-size: var(--text-base);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .favorite-btn:hover {
      background-color: var(--accent-danger);
      color: var(--text-white);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    }

    .favorite-btn.active {
      background-color: var(--accent-danger);
      color: var(--text-white);
    }

    .property-main {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-xl);
      margin-bottom: var(--space-xl);
    }

    .property-image-section {
      position: relative;
    }

    .main-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .property-info-section {
      background: var(--background-primary);
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
      height: fit-content;
    }

    .property-price {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: var(--space-md);
    }

    .property-address h1 {
      font-size: var(--text-xl);
      margin-bottom: var(--space-xs);
      color: var(--primary-dark);
      font-weight: 600;
    }

    .location {
      color: var(--text-secondary);
      font-size: var(--text-lg);
      margin-bottom: var(--space-xl);
    }

    .property-highlights {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }

    .highlight-item {
      text-align: center;
      padding: var(--space-md);
      background: var(--background-tertiary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .highlight-value {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
    }

    .highlight-label {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .property-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      align-items: stretch;
    }

    /* Use unified button system - all buttons inherit from global styles.scss */
    .btn-large {
      height: var(--height-button-lg);
      padding: 0 var(--space-lg);
      font-size: var(--text-lg);
    }

    .property-details {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-xl);
    }

    .details-section, .description-section, .mortgage-estimation, .nearby-properties {
      background: var(--background-primary);
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .details-section h2, .description-section h2, .mortgage-estimation h2, .nearby-properties h2 {
      color: var(--primary-dark);
      margin-bottom: var(--space-lg);
      font-size: var(--text-xl);
      font-weight: 600;
    }

    .details-grid {
      display: grid;
      gap: var(--space-sm);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border-light);
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: var(--text-base);
    }

    .detail-value {
      color: var(--primary-dark);
      font-weight: 500;
      font-size: var(--text-base);
    }

    .property-description {
      line-height: 1.6;
      color: var(--text-primary);
      font-size: var(--text-lg);
    }

    .mortgage-preview {
      background: var(--background-tertiary);
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      border-left: 4px solid var(--primary-dark);
      text-align: center;
    }

    .mortgage-assumptions {
      color: var(--text-secondary);
      font-size: var(--text-base);
      margin-bottom: var(--space-md);
      line-height: 1.5;
    }

    .payment-estimate {
      margin: var(--space-lg) 0;
    }

    .payment-amount {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
    }

    .payment-breakdown {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin-bottom: var(--space-lg);
    }

    .similar-properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-md);
    }

    .similar-property-card {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      color: inherit;
      background: var(--background-primary);
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .similar-property-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--shadow-medium);
      border-color: var(--primary-dark);
    }

    .similar-property-card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }

    .similar-property-info {
      padding: var(--space-md);
    }

    .similar-price {
      font-weight: 700;
      color: var(--primary-dark);
      font-size: var(--text-lg);
      margin-bottom: var(--space-xs);
    }

    .similar-specs {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin-bottom: var(--space-xs);
      font-weight: 500;
    }

    .similar-address {
      font-size: var(--text-sm);
      color: var(--text-primary);
      word-wrap: break-word;
    }

    .no-similar-properties {
      text-align: center;
      padding: var(--space-2xl);
      color: var(--text-secondary);
    }

    .no-similar-icon {
      color: var(--text-muted);
      margin-bottom: var(--space-lg);
    }

    .no-similar-properties h3 {
      color: var(--primary-dark);
      margin-bottom: var(--space-md);
      font-size: var(--text-xl);
      font-weight: 600;
    }

    .no-similar-properties p {
      margin-bottom: var(--space-xl);
      line-height: 1.5;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: var(--text-secondary);
    }

    .loading-spinner {
      border: 3px solid var(--background-tertiary);
      border-top: 3px solid var(--primary-dark);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
      margin-bottom: var(--space-md);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .property-detail-container {
        padding: var(--space-sm);
      }

      .property-header {
        flex-direction: column;
        gap: var(--space-md);
        align-items: stretch;
      }

      .property-main {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }

      .property-info-section {
        padding: var(--space-lg);
      }

      .property-highlights {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-sm);
      }

      .highlight-item {
        padding: var(--space-sm);
      }

      .similar-properties-grid {
        grid-template-columns: 1fr;
        gap: var(--space-sm);
      }
      
      .details-section, .description-section, .mortgage-estimation, .nearby-properties {
        padding: var(--space-lg);
      }
    }

    @media (max-width: 480px) {
      .property-detail-container {
        padding: var(--space-xs);
      }

      .property-info-section {
        padding: var(--space-md);
      }

      .property-highlights {
        grid-template-columns: 1fr;
      }

      .property-actions {
        gap: var(--space-sm);
      }

      .details-section, .description-section, .mortgage-estimation, .nearby-properties {
        padding: var(--space-md);
      }
    }
  `]
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  property: Property | null = null;
  similarProperties: Property[] = [];
  estimatedPayment = 0;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        const id = +params['id'];
        if (id) {
          this.loadProperty(id);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProperty(id: number): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.calculateEstimatedPayment();
        this.loadSimilarProperties();
      },
      error: (error) => {
        this.notificationService.error('Error', 'Unable to load property details');
        console.error('Property load error:', error);
        this.router.navigate(['/search']);
      }
    });
  }

  loadSimilarProperties(): void {
    if (!this.property) return;
    
    // Single, simple search with progressive fallback
    this.searchForSimilarProperties();
  }

  private searchForSimilarProperties(): void {
    // Start with a broader search to get more options
    const searchFilters = {
      state: this.property!.state,
      page: 1,
      pageSize: 50, // Get many properties to choose from
      sortBy: 'random', // Use backend random sorting
      sortOrder: 'asc'
    };

    this.propertyService.searchProperties(searchFilters).subscribe({
      next: (results) => {
        // Filter out current property and ensure unique IDs
        const uniqueProperties = results.properties
          .filter(p => p.id !== this.property!.id)
          .filter((property, index, array) => 
            array.findIndex(p => p.id === property.id) === index
          );
        
        if (uniqueProperties.length === 0) {
          this.similarProperties = [];
          return;
        }

        // Try to find properties with similar characteristics
        let similarProperties = this.findSimilarProperties(uniqueProperties);
        
        if (similarProperties.length < 3) {
          // If not enough similar properties, fill with any available properties
          const remainingProperties = uniqueProperties.filter(p => 
            !similarProperties.some(sp => sp.id === p.id)
          );
          
          while (similarProperties.length < 3 && remainingProperties.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingProperties.length);
            similarProperties.push(remainingProperties.splice(randomIndex, 1)[0]);
          }
        }

        // Take only 3 properties maximum
        this.similarProperties = similarProperties.slice(0, 3);
      },
      error: (error) => {
        this.similarProperties = [];
      }
    });
  }

  private findSimilarProperties(allProperties: any[]): any[] {
    const currentProperty = this.property!;
    const similarProperties: any[] = [];

    // Priority 1: Same city and property type
    const sameCityType = allProperties.filter(p => 
      p.city.toLowerCase() === currentProperty.city.toLowerCase() &&
      p.propertyType.toLowerCase() === currentProperty.propertyType.toLowerCase() &&
      Math.abs(p.price - currentProperty.price) <= currentProperty.price * 0.3
    );

    // Priority 2: Same city, different type
    const sameCityDiffType = allProperties.filter(p => 
      p.city.toLowerCase() === currentProperty.city.toLowerCase() &&
      p.propertyType.toLowerCase() !== currentProperty.propertyType.toLowerCase()
    );

    // Priority 3: Same state, similar price range
    const sameStateSimilarPrice = allProperties.filter(p => 
      p.city.toLowerCase() !== currentProperty.city.toLowerCase() &&
      Math.abs(p.price - currentProperty.price) <= currentProperty.price * 0.4
    );

    // Add properties in order of priority
    this.addUniqueProperties(similarProperties, sameCityType, 3);
    if (similarProperties.length < 3) {
      this.addUniqueProperties(similarProperties, sameCityDiffType, 3 - similarProperties.length);
    }
    if (similarProperties.length < 3) {
      this.addUniqueProperties(similarProperties, sameStateSimilarPrice, 3 - similarProperties.length);
    }

    return similarProperties;
  }

  private addUniqueProperties(targetArray: any[], sourceArray: any[], maxToAdd: number): void {
    let added = 0;
    for (const property of sourceArray) {
      if (added >= maxToAdd) break;
      if (!targetArray.some(p => p.id === property.id)) {
        targetArray.push(property);
        added++;
      }
    }
  }

  calculateEstimatedPayment(): void {
    if (!this.property) return;

    // Simple mortgage calculation: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    const loanAmount = this.property.price * 0.8; // 80% loan
    const monthlyRate = 0.065 / 12; // 6.5% APR
    const numberOfPayments = 30 * 12; // 30 years

    this.estimatedPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  toggleFavorite(): void {
    if (!this.property) return;

    this.propertyService.toggleFavorite(this.property.id).subscribe({
      next: (result) => {
        if (this.property) {
          this.property.isFavorite = result.isFavorite;
          const action = result.isFavorite ? 'added to' : 'removed from';
          this.notificationService.success(
            'Favorites Updated', 
            `Property ${action} your favorites`
          );
        }
      },
      error: () => {
        this.notificationService.error('Error', 'Please log in to manage favorites');
      }
    });
  }

  contactAgent(): void {
    this.notificationService.info(
      'Contact Agent', 
      'Agent contact feature coming soon!'
    );
  }

  goBack(): void {
    this.router.navigate(['/search']);
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
    event.target.src = '/assets/images/property-placeholder.jpg';
  }
}