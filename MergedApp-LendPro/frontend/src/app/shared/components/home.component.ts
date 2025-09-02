import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <section class="hero-section">
        <div class="hero-content">
          <h1>Welcome to LendPro</h1>
          <p>Your one-stop solution for home search, mortgage tools, and loan management</p>
          <div class="button-group-center">
            <a routerLink="/search" class="btn btn-outline-white btn-lg">Search Homes</a>
            <a routerLink="/mortgage-tools" class="btn btn-outline-white btn-lg">Mortgage Calculator</a>
          </div>
        </div>
      </section>

      <section class="section-content">
        <div class="section-header">
          <h2>Our Features</h2>
          <p>Discover powerful tools to help you with your mortgage journey</p>
        </div>
        <div class="card-grid">
          <!-- Always visible cards -->
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <h3>Home Search</h3>
            <p>Browse thousands of properties with advanced filtering options</p>
            <a routerLink="/search" class="btn btn-primary btn-sm">Search Now</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="1" height="1"/>
                <rect x="14" y="9" width="1" height="1"/>
                <rect x="9" y="14" width="1" height="1"/>
                <rect x="14" y="14" width="1" height="1"/>
              </svg>
            </div>
            <h3>Mortgage Tools</h3>
            <p>Calculate payments, check eligibility, and view amortization schedules</p>
            <a routerLink="/mortgage-tools" class="btn btn-primary btn-sm">Try Tools</a>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            </div>
            <h3>Market Trends</h3>
            <p>Analyze market data, price trends, and neighborhood analytics</p>
            <a routerLink="/market-trends" class="btn btn-primary btn-sm">View Trends</a>
          </div>

          <!-- Authenticated regular users only -->
          <div class="feature-card" *ngIf="authService.isAuthenticated() && !authService.isAdmin()">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
              </svg>
            </div>
            <h3>Loan Application</h3>
            <p>Apply for loans and track your application status</p>
            <a routerLink="/loan-application" class="btn btn-primary btn-sm">Apply Now</a>
          </div>

          <!-- Admin users only -->
          <div class="feature-card" *ngIf="authService.isAdmin()">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
                <path d="M9 12H15M9 16H15"/>
              </svg>
            </div>
            <h3>Loan Management</h3>
            <p>Review and manage all loan applications</p>
            <a routerLink="/admin/loans" class="btn btn-primary btn-sm">Manage Loans</a>
          </div>

          <div class="feature-card" *ngIf="authService.isAdmin()">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"/>
              </svg>
            </div>
            <h3>User Management</h3>
            <p>Manage users and their access permissions</p>
            <a routerLink="/admin/users" class="btn btn-primary btn-sm">Manage Users</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--space-lg);
    }

    .hero-section {
      text-align: center;
      padding: var(--space-2xl) var(--space-lg);
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%);
      color: var(--text-white);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-2xl);
      box-shadow: 0 8px 32px var(--shadow-dark);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .hero-section h1 {
      font-size: var(--text-4xl);
      margin-bottom: var(--space-md);
      font-weight: 700;
      color: var(--text-white);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .hero-section p {
      font-size: var(--text-xl);
      margin-bottom: var(--space-xl);
      color: var(--text-white);
      opacity: 0.95;
      line-height: 1.6;
    }

    .feature-card {
      background: var(--background-primary);
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
      text-align: center;
      transition: all 0.2s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px var(--shadow-medium);
      border-color: var(--primary-dark);
    }

    .feature-icon {
      margin-bottom: var(--space-lg);
      color: var(--primary-dark);
      display: flex;
      justify-content: center;
    }

    .feature-icon svg {
      width: 48px;
      height: 48px;
      stroke: var(--primary-dark);
    }

    .feature-card h3 {
      color: var(--primary-dark);
      margin-bottom: var(--space-md);
      font-weight: 600;
      font-size: var(--text-xl);
    }

    .feature-card p {
      color: var(--text-secondary);
      margin-bottom: var(--space-lg);
      line-height: 1.6;
      font-size: var(--text-base);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .home-container {
        padding: 0 var(--space-sm);
      }

      .hero-section {
        padding: var(--space-xl) var(--space-md);
        margin-bottom: var(--space-xl);
      }

      .hero-section h1 {
        font-size: var(--text-3xl);
        margin-bottom: var(--space-sm);
      }
      
      .hero-section p {
        font-size: var(--text-lg);
        margin-bottom: var(--space-lg);
      }

      .feature-card {
        padding: var(--space-lg);
      }

      .feature-card h3 {
        font-size: var(--text-lg);
      }
    }

    @media (max-width: 480px) {
      .home-container {
        padding: 0 var(--space-xs);
      }
      
      .hero-section {
        padding: var(--space-lg) var(--space-sm);
      }
      
      .hero-section h1 {
        font-size: var(--text-2xl);
      }
      
      .feature-card {
        padding: var(--space-md);
      }
    }
  `]
})
export class HomeComponent {
  constructor(public authService: AuthService) {}
}