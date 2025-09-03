import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { PropertyService } from '../../home-search/services/property.service';
import { MortgageService } from '../../mortgage-tools/services/mortgage.service';
import { LoanService } from '../services/loan.service';
import { AuthService } from '../../auth/services/auth.service';
import { Property } from '../../shared/models/property.model';
import { MortgageCalculationResult, LoanApplication } from '../../shared/models/mortgage.model';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  joinDate: string;
}

export interface LoanApplicationDisplay {
  id: number;
  status: string;
  propertyAddress: string;
  loanAmount: number;
  monthlyPayment: number;
  applicationDate: string;
  lastUpdated: string;
  nextStep: string;
}


@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Manage your mortgage journey and track your applications</p>
      </div>

      <div class="dashboard-main">
        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ favoriteProperties.length }}</div>
              <div class="stat-label">Saved Properties</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ loanApplications.length }}</div>
              <div class="stat-label">Loan Applications</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="1" height="1"/>
                <rect x="14" y="9" width="1" height="1"/>
                <rect x="9" y="14" width="1" height="1"/>
                <rect x="14" y="14" width="1" height="1"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ calculationHistory.length }}</div>
              <div class="stat-label">Calculations</div>
            </div>
          </div>
          
          <div class="stat-card" *ngIf="getActiveApplication()">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ getActiveApplication()?.status | titlecase }}</div>
              <div class="stat-label">Current Status</div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="dashboard-grid">
          <!-- Profile Section -->
          <div class="section-content profile-section">
            <div class="section-header">
              <h2>Profile Information</h2>
            </div>
            
            <div class="profile-content" *ngIf="!editingProfile; else profileTemplate">
              <div class="profile-info">
                <div class="profile-avatar">
                  <div class="avatar-placeholder">
                    {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                  </div>
                </div>
                
                <div class="profile-details">
                  <h3>{{ user?.firstName }} {{ user?.lastName }}</h3>
                  <div class="profile-item">
                    <span class="label">Email:</span>
                    <span class="value">{{ user?.email }}</span>
                  </div>
                  <div class="profile-item">
                    <span class="label">Phone:</span>
                    <span class="value">{{ user?.phone || 'Not provided' }}</span>
                  </div>
                  <div class="profile-item">
                    <span class="label">Address:</span>
                    <span class="value">
                      {{ user?.address }}, {{ user?.city }}, {{ user?.state }} {{ user?.zipCode }}
                    </span>
                  </div>
                  <div class="profile-item">
                    <span class="label">Member Since:</span>
                    <span class="value">{{ formatDate(user?.joinDate) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="button-group-center mt-lg">
                <button (click)="editProfile()" class="btn btn-primary">
                  Edit Profile
                </button>
              </div>
            </div>

            <ng-template #profileTemplate>
              <div class="profile-edit-container">
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                  <div class="profile-form-grid">
                    <div class="form-group">
                      <label for="firstName">First Name</label>
                      <input type="text" id="firstName" formControlName="firstName" class="form-control" />
                    </div>
                    
                    <div class="form-group">
                      <label for="lastName">Last Name</label>
                      <input type="text" id="lastName" formControlName="lastName" class="form-control" />
                    </div>
                    
                    <div class="form-group full-width">
                      <label for="email">Email</label>
                      <input type="email" id="email" formControlName="email" class="form-control" />
                    </div>
                    
                    <div class="form-group">
                      <label for="phone">Phone</label>
                      <input type="tel" id="phone" formControlName="phone" class="form-control" />
                    </div>
                    
                    <div class="form-group full-width">
                      <label for="address">Address</label>
                      <input type="text" id="address" formControlName="address" class="form-control" />
                    </div>
                    
                    <div class="form-group">
                      <label for="city">City</label>
                      <input type="text" id="city" formControlName="city" class="form-control" />
                    </div>
                    
                    <div class="form-group">
                      <label for="state">State</label>
                      <select id="state" formControlName="state" class="form-control">
                        <option value="">Select State</option>
                        <option value="TX">Texas</option>
                        <option value="CA">California</option>
                        <option value="FL">Florida</option>
                        <option value="NY">New York</option>
                      </select>
                    </div>
                    
                    <div class="form-group">
                      <label for="zipCode">ZIP Code</label>
                      <input type="text" id="zipCode" formControlName="zipCode" class="form-control" />
                    </div>
                  </div>
                  
                  <div class="profile-form-actions">
                    <button type="button" (click)="cancelEdit()" class="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </ng-template>
          </div>

          <!-- Loan Applications -->
          <div class="section-content applications-section">
            <div class="section-header">
              <h2>Loan Applications</h2>
              <button [routerLink]="['/loan-application']" class="btn btn-primary">
                New Application
              </button>
            </div>
            
            <div *ngIf="loanApplications.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                  <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
                </svg>
              </div>
              <h3>No applications yet</h3>
              <p>Ready to start your mortgage journey?</p>
              <button [routerLink]="['/loan-application']" class="btn btn-primary">
                Start Application
              </button>
            </div>
            
            <div *ngIf="loanApplications.length > 0" class="applications-list">
              <div 
                *ngFor="let app of loanApplications" 
                class="application-card"
                [class]="'status-' + app.status"
              >
                <div class="app-header">
                  <div class="app-status">
                    <span class="status-badge">{{ app.status | titlecase }}</span>
                    <span class="app-date">{{ formatDate(app.applicationDate) }}</span>
                  </div>
                  <div class="app-id">App #{{ app.id }}</div>
                </div>
                
                <div class="app-content">
                  <div class="app-property">
                    <h4>{{ app.propertyAddress }}</h4>
                  </div>
                  
                  <div class="app-details">
                    <div class="detail-item">
                      <span class="label">Loan Amount:</span>
                      <span class="value">{{ formatCurrency(app.loanAmount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Monthly Payment:</span>
                      <span class="value">{{ formatCurrency(app.monthlyPayment) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Last Updated:</span>
                      <span class="value">{{ formatDate(app.lastUpdated) }}</span>
                    </div>
                  </div>
                  
                  <div class="app-next-step" *ngIf="app.nextStep">
                    <strong>Next Step:</strong> {{ app.nextStep }}
                  </div>
                </div>
                
                <div class="app-actions">
                  <button (click)="viewApplicationDetails(app.id)" class="btn btn-outline btn-sm">
                    View Details
                  </button>
                  <button *ngIf="app.status === 'draft'" (click)="continueApplication(app.id)" class="btn btn-primary btn-sm">
                    Continue
                  </button>
                  <button *ngIf="app.status !== 'draft'" (click)="viewApplicationDocuments(app.id)" class="btn btn-secondary btn-sm">
                    Documents
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Favorite Properties -->
          <div class="section-content favorites-section">
            <div class="section-header">
              <h2>Saved Properties</h2>
              <button [routerLink]="['/search']" class="btn btn-outline">
                Search More
              </button>
            </div>
            
            <div *ngIf="favoriteProperties.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h3>No saved properties</h3>
              <p>Save properties you're interested in to track them here</p>
              <button [routerLink]="['/search']" class="btn btn-primary">
                Browse Properties
              </button>
            </div>
            
            <div *ngIf="favoriteProperties.length > 0" class="card-grid-sm">
              <div 
                *ngFor="let property of favoriteProperties.slice(0, 6)" 
                class="favorite-card"
                [routerLink]="['/properties', property.id]"
              >
                <img 
                  [src]="property.imageUrl || '/assets/images/property-placeholder.jpg'" 
                  [alt]="property.address"
                  (error)="onImageError($event)"
                />
                <div class="favorite-content">
                  <div class="favorite-price">{{ formatCurrency(property.price) }}</div>
                  <div class="favorite-address">{{ property.address }}</div>
                  <div class="favorite-specs">
                    {{ property.bedrooms }}bd • {{ property.bathrooms }}ba • {{ formatNumber(property.squareFeet) }} sqft
                  </div>
                </div>
                <button 
                  class="unfavorite-btn"
                  (click)="removeFavorite(property, $event)"
                  title="Remove from favorites"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div *ngIf="favoriteProperties.length > 6" class="view-all">
              <button [routerLink]="['/favorites']" class="btn btn-link">
                View All {{ favoriteProperties.length }} Properties →
              </button>
            </div>
          </div>

          <!-- Recent Calculations -->
          <div class="section-content calculations-section">
            <div class="section-header">
              <h2>Recent Calculations</h2>
              <button [routerLink]="['/mortgage-tools']" class="btn btn-outline">
                Calculate
              </button>
            </div>
            
            <div *ngIf="calculationHistory.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                  <rect x="9" y="9" width="1" height="1"/>
                  <rect x="14" y="9" width="1" height="1"/>
                  <rect x="9" y="14" width="1" height="1"/>
                  <rect x="14" y="14" width="1" height="1"/>
                </svg>
              </div>
              <h3>No calculations yet</h3>
              <p>Use our mortgage calculator to estimate payments</p>
              <button [routerLink]="['/mortgage-tools']" class="btn btn-primary">
                Calculate Now
              </button>
            </div>
            
            <div *ngIf="calculationHistory.length > 0" class="calculations-list">
              <div 
                *ngFor="let calc of calculationHistory.slice(0, 5)" 
                class="calculation-card"
                (click)="loadCalculation(calc)"
              >
                <div class="calc-payment">{{ formatCurrency(calc.monthlyPayment) }}/month</div>
                <div class="calc-details">
                  <div class="calc-amount">Loan: {{ formatCurrency(calc.loanAmount) }}</div>
                  <div class="calc-term">{{ getLoanTerm(calc) }} years</div>
                </div>
                <div class="calc-date">{{ calc.calculatedAt ? getRelativeTime(calc.calculatedAt.toString()) : 'Just now' }}</div>
              </div>
            </div>
            
            <div *ngIf="calculationHistory.length > 5" class="view-all">
              <button (click)="viewAllCalculations()" class="btn btn-link">
                View All Calculations →
              </button>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="section-content actions-section">
            <div class="section-header">
              <h2>Quick Actions</h2>
            </div>
            
            <div class="card-grid-sm">
              <button [routerLink]="['/search']" class="action-btn">
                <div class="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
                <div class="action-content">
                  <div class="action-title">Search Properties</div>
                  <div class="action-subtitle">Find your dream home</div>
                </div>
              </button>
              
              <button [routerLink]="['/mortgage-tools']" class="action-btn">
                <div class="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <rect x="9" y="9" width="1" height="1"/>
                    <rect x="14" y="9" width="1" height="1"/>
                    <rect x="9" y="14" width="1" height="1"/>
                    <rect x="14" y="14" width="1" height="1"/>
                  </svg>
                </div>
                <div class="action-content">
                  <div class="action-title">Calculate Payments</div>
                  <div class="action-subtitle">Estimate monthly costs</div>
                </div>
              </button>
              
              <button [routerLink]="['/loan-application']" class="action-btn">
                <div class="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"/>
                  </svg>
                </div>
                <div class="action-content">
                  <div class="action-title">Apply for Loan</div>
                  <div class="action-subtitle">Start your application</div>
                </div>
              </button>
              
              <button (click)="contactSupport()" class="action-btn">
                <div class="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59532 1.99523 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47145 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.513 12.4135 11.5865 14.4869 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 21.2 16.92H22Z"/>
                  </svg>
                </div>
                <div class="action-content">
                  <div class="action-title">Contact Support</div>
                  <div class="action-subtitle">Get help from experts</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--space-lg);
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }

    .dashboard-header h1 {
      font-size: var(--text-3xl);
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
    }

    .dashboard-header p {
      font-size: var(--text-lg);
      color: var(--text-secondary);
    }

    .stat-card {
      background: var(--background-primary);
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 2px 8px var(--shadow-light);
      display: flex;
      align-items: center;
      gap: var(--space-md);
      transition: all 0.2s ease;
    }
    
    .stat-card:hover {
      box-shadow: 0 4px 12px var(--shadow-medium);
      transform: translateY(-2px);
      border-color: var(--primary-dark);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      background: var(--background-tertiary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-dark);
      flex-shrink: 0;
    }

    .stat-value {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--space-lg);
    }

    /* Profile Section */
    .profile-section {
      grid-column: span 2;
    }

    .profile-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-lg);
    }

    .profile-info {
      display: flex;
      gap: var(--space-xl);
      flex: 1;
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary-dark);
      color: var(--text-white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xl);
      font-weight: 700;
      flex-shrink: 0;
    }

    .profile-details h3 {
      color: var(--primary-dark);
      margin-bottom: var(--space-md);
      font-size: var(--text-xl);
    }

    .profile-item {
      display: flex;
      margin-bottom: var(--space-sm);
      align-items: flex-start;
    }

    .profile-item .label {
      width: 120px;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: var(--text-sm);
      flex-shrink: 0;
    }

    .profile-item .value {
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    /* Profile Edit Form Styling */
    .profile-edit-container {
      padding: var(--space-lg) 0;
    }

    .profile-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }

    .profile-form-grid .form-group {
      margin-bottom: var(--space-lg);
    }

    .profile-form-grid .form-group.full-width {
      grid-column: span 2;
    }

    .profile-form-actions {
      display: flex;
      justify-content: center;
      gap: var(--space-md);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border-light);
    }

    .form-group.full-width {
      grid-column: span 2;
    }

    /* Applications Section */
    .applications-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .application-card {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      transition: all 0.2s ease;
      background: var(--background-primary);
    }

    .application-card.status-approved {
      border-color: var(--accent-success);
      background: rgba(56, 161, 105, 0.05);
    }

    .application-card.status-denied {
      border-color: var(--accent-danger);
      background: rgba(229, 62, 62, 0.05);
    }

    .application-card.status-under_review {
      border-color: var(--accent-warning);
      background: rgba(214, 158, 46, 0.05);
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-md);
    }

    .status-badge {
      background: var(--background-tertiary);
      color: var(--text-primary);
      padding: var(--space-xs) var(--space-sm);
      border-radius: calc(var(--radius-sm) * 2);
      font-size: var(--text-xs);
      font-weight: 600;
    }

    .app-date {
      color: var(--text-secondary);
      font-size: var(--text-xs);
      margin-left: var(--space-md);
    }

    .app-property h4 {
      color: var(--primary-dark);
      margin-bottom: var(--space-md);
      font-size: var(--text-lg);
    }

    .app-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-md);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item .label {
      color: var(--text-secondary);
      font-size: var(--text-xs);
      margin-bottom: var(--space-xs);
      font-weight: 500;
    }

    .detail-item .value {
      color: var(--primary-dark);
      font-weight: 600;
      font-size: var(--text-sm);
    }

    .app-next-step {
      background: rgba(26, 54, 93, 0.05);
      padding: var(--space-md);
      border-radius: var(--radius-sm);
      color: var(--primary-dark);
      margin-bottom: var(--space-md);
      border: 1px solid var(--primary-dark);
      font-size: var(--text-sm);
    }

    .app-actions {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }

    /* Favorites Section */
    .favorite-card {
      position: relative;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      color: inherit;
      background: var(--background-primary);
    }

    .favorite-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
      border-color: var(--primary-dark);
    }

    .favorite-card img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .favorite-content {
      padding: var(--space-md);
    }

    .favorite-price {
      font-weight: 700;
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
      font-size: var(--text-base);
    }

    .favorite-address {
      font-size: var(--text-sm);
      margin-bottom: var(--space-xs);
      color: var(--text-primary);
      font-weight: 500;
    }

    .favorite-specs {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .unfavorite-btn {
      position: absolute;
      top: var(--space-xs);
      right: var(--space-xs);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid var(--border-light);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
      
      &:hover {
        background: var(--background-primary);
        border-color: var(--accent-danger);
        color: var(--accent-danger);
      }
    }

    /* Calculations Section */
    .calculations-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .calculation-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-md);
      background: var(--background-secondary);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .calculation-card:hover {
      background: var(--background-tertiary);
      border-color: var(--primary-dark);
    }

    .calc-payment {
      font-weight: 700;
      color: var(--primary-dark);
      font-size: var(--text-lg);
    }

    .calc-details {
      flex: 1;
      margin-left: var(--space-md);
    }

    .calc-amount {
      font-size: var(--text-sm);
      color: var(--text-primary);
      font-weight: 500;
    }

    .calc-term {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .calc-date {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    /* Action buttons */
    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--background-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      color: inherit;
    }

    .action-btn:hover {
      background: var(--background-tertiary);
      transform: translateY(-2px);
      border-color: var(--primary-dark);
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      background: var(--background-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px var(--shadow-light);
      color: var(--primary-dark);
      flex-shrink: 0;
    }

    .action-title {
      font-weight: 600;
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
      font-size: var(--text-base);
    }

    .action-subtitle {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .view-all {
      text-align: center;
      margin-top: var(--space-md);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: var(--space-sm);
      }

      .dashboard-header {
        margin-bottom: var(--space-xl);
      }

      .dashboard-header h1 {
        font-size: var(--text-2xl);
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .profile-section {
        grid-column: span 1;
      }

      .profile-content {
        flex-direction: column;
        gap: var(--space-lg);
      }

      .profile-info {
        flex-direction: column;
        gap: var(--space-md);
      }

      .form-group.full-width {
        grid-column: span 1;
      }

      .profile-form-grid {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .profile-form-grid .form-group.full-width {
        grid-column: span 1;
      }

      .app-details {
        grid-template-columns: 1fr;
        gap: var(--space-sm);
      }
    }

    @media (max-width: 480px) {
      .dashboard-container {
        padding: var(--space-xs);
      }
      
      .stat-card {
        padding: var(--space-sm);
        gap: var(--space-sm);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
      }
      
      .stat-value {
        font-size: var(--text-xl);
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  loanApplications: LoanApplicationDisplay[] = [];
  favoriteProperties: Property[] = [];
  calculationHistory: MortgageCalculationResult[] = [];
  
  editingProfile = false;
  profileForm: FormGroup;
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private propertyService: PropertyService,
    private mortgageService: MortgageService,
    private loanService: LoanService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    // Load user profile
    this.loadUserProfile();
    
    // Load favorite properties
    this.loadFavoriteProperties();
    
    // Load calculation history
    this.loadCalculationHistory();
    
    // Load loan applications
    this.loadLoanApplications();
  }

  loadUserProfile(): void {
    // Mock user data - in real app, this would come from an API
    this.user = {
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
  }

  loadFavoriteProperties(): void {
    this.subscriptions.add(
      this.propertyService.getFavoriteProperties().subscribe({
        next: (properties) => {
          this.favoriteProperties = properties;
        },
        error: () => {
          // Silently handle error for favorites
          this.favoriteProperties = [];
        }
      })
    );
  }

  loadCalculationHistory(): void {
    this.subscriptions.add(
      this.mortgageService.calculationHistory$.subscribe(history => {
        this.calculationHistory = history;
      })
    );
  }

  loadLoanApplications(): void {
    // Check if user is authenticated before making API call
    if (!this.authService.isAuthenticated()) {
      // User is not authenticated - show empty state or mock data for demo
      this.loanApplications = [];
      console.log('User not authenticated - showing empty loan applications');
      return;
    }

    this.subscriptions.add(
      this.loanService.getUserLoanApplications().subscribe({
        next: (applications) => {
          this.loanApplications = applications.map(app => this.convertToDisplayFormat(app));
        },
        error: (error) => {
          console.error('Error loading loan applications:', error);
          
          // If it's an authentication error, redirect to login
          if (error.status === 401) {
            this.notificationService.info(
              'Authentication Required',
              'Please log in to view your loan applications.'
            );
            this.router.navigate(['/auth/login']);
            return;
          }
          
          // For other errors, show empty state
          this.loanApplications = [];
          this.notificationService.error(
            'Load Error',
            'Unable to load loan applications. Please try again.'
          );
        }
      })
    );
  }

  private convertToDisplayFormat(app: LoanApplication): LoanApplicationDisplay {
    // Calculate monthly payment if not provided
    const monthlyPayment = this.calculateMonthlyPayment(
      app.loanAmount, 
      app.interestRate, 
      app.loanTermYears
    );

    // Determine next step based on status
    const nextStep = this.getNextStepForStatus(app.status || 'draft');

    return {
      id: app.id || 0,
      status: app.status || 'draft',
      propertyAddress: this.formatPropertyAddress(app),
      loanAmount: app.loanAmount,
      monthlyPayment: monthlyPayment,
      applicationDate: app.createdAt ? app.createdAt.toString() : new Date().toISOString(),
      lastUpdated: app.updatedAt ? app.updatedAt.toString() : new Date().toISOString(),
      nextStep: nextStep
    };
  }

  private calculateMonthlyPayment(loanAmount: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
      return loanAmount / numberOfPayments;
    }
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
    return Math.round(monthlyPayment * 100) / 100;
  }

  private formatPropertyAddress(_app: LoanApplication): string {
    // Try to construct address from available fields, or use a placeholder
    return 'Property address not specified';
  }

  private getNextStepForStatus(status: string): string {
    switch (status) {
      case 'draft':
        return 'Complete application form';
      case 'submitted':
        return 'Application under initial review';
      case 'under_review':
        return 'Provide additional documentation';
      case 'approved':
        return 'Review loan terms';
      case 'denied':
        return 'Review denial reasons';
      default:
        return 'Contact support for status update';
    }
  }

  editProfile(): void {
    if (this.user) {
      this.profileForm.patchValue(this.user);
      this.editingProfile = true;
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      const formValue = this.profileForm.value;
      this.user = { ...this.user, ...formValue };
      this.editingProfile = false;
      
      this.notificationService.success(
        'Profile Updated',
        'Your profile information has been saved successfully'
      );
    }
  }

  cancelEdit(): void {
    this.editingProfile = false;
    this.profileForm.reset();
  }

  removeFavorite(property: Property, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.propertyService.toggleFavorite(property.id).subscribe({
      next: () => {
        this.favoriteProperties = this.favoriteProperties.filter(p => p.id !== property.id);
        this.notificationService.success(
          'Removed from Favorites',
          'Property removed from your favorites'
        );
      },
      error: () => {
        this.notificationService.error('Error', 'Unable to remove property from favorites');
      }
    });
  }

  loadCalculation(calculation: MortgageCalculationResult): void {
    this.router.navigate(['/mortgage-tools'], {
      queryParams: { loadCalculation: JSON.stringify(calculation) }
    });
  }

  viewAllCalculations(): void {
    this.router.navigate(['/mortgage-tools']);
  }

  contactSupport(): void {
    this.notificationService.info(
      'Contact Support',
      'Support feature coming soon! Call (555) 123-LOAN for immediate assistance.'
    );
  }

  // Loan Application Actions
  viewApplicationDetails(applicationId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.info('Authentication Required', 'Please log in to view application details');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Navigate to loan application details or show modal
    this.router.navigate(['/loan-application'], { 
      queryParams: { id: applicationId, mode: 'view' } 
    });
  }

  continueApplication(applicationId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.info('Authentication Required', 'Please log in to continue your application');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Navigate to loan application form to continue draft
    this.router.navigate(['/loan-application'], { 
      queryParams: { id: applicationId, mode: 'continue' } 
    });
  }

  viewApplicationDocuments(_applicationId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.info('Authentication Required', 'Please log in to view documents');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Navigate to documents section or show documents modal
    this.notificationService.info(
      'Documents',
      'Document management feature coming soon!'
    );
    // TODO: Implement document viewing
    // this.router.navigate(['/loan-application/documents', applicationId]);
  }

  getActiveApplication(): LoanApplicationDisplay | undefined {
    return this.loanApplications.find(app => 
      app.status === 'under_review' || app.status === 'submitted'
    );
  }

  getLoanTerm(_calculation: MortgageCalculationResult): number {
    // Extract loan term from calculation - this would be stored with the calculation
    return 30; // Default to 30 years for now
  }

  getRelativeTime(date: string): string {
    const now = new Date();
    const calcDate = new Date(date || now);
    const diffMs = now.getTime() - calcDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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