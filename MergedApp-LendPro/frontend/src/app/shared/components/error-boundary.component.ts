import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: string;
  timestamp?: Date;
  stack?: string;
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error-boundary" [class]="'error-' + type" *ngIf="hasError">
      <!-- Critical Error -->
      <div *ngIf="type === 'critical'" class="error-critical">
        <div class="error-icon">💥</div>
        <h2>Application Error</h2>
        <p>{{ error?.message || 'An unexpected error occurred' }}</p>
        <div class="error-actions">
          <button (click)="reload()" class="btn btn-primary">Reload Page</button>
          <button (click)="goHome()" class="btn btn-secondary">Go Home</button>
          <button (click)="toggleDetails()" class="btn btn-link">{{ showDetails ? 'Hide' : 'Show' }} Details</button>
        </div>
        <div *ngIf="showDetails && error?.details" class="error-details">
          <h4>Error Details:</h4>
          <pre>{{ error?.details }}</pre>
        </div>
      </div>

      <!-- Network Error -->
      <div *ngIf="type === 'network'" class="error-network">
        <div class="error-icon">🌐</div>
        <h3>Connection Problem</h3>
        <p>{{ error?.message || 'Unable to connect to the server' }}</p>
        <div class="error-actions">
          <button (click)="retry()" class="btn btn-primary" [disabled]="retrying">
            {{ retrying ? 'Retrying...' : 'Try Again' }}
          </button>
          <button (click)="dismiss()" class="btn btn-secondary">Dismiss</button>
        </div>
      </div>

      <!-- Not Found Error -->
      <div *ngIf="type === 'not-found'" class="error-not-found">
        <div class="error-icon">🔍</div>
        <h3>Page Not Found</h3>
        <p>{{ error?.message || "The page you're looking for doesn't exist" }}</p>
        <div class="error-actions">
          <a routerLink="/" class="btn btn-primary">Go Home</a>
          <button (click)="goBack()" class="btn btn-secondary">Go Back</button>
        </div>
      </div>

      <!-- Permission Error -->
      <div *ngIf="type === 'permission'" class="error-permission">
        <div class="error-icon">🔒</div>
        <h3>Access Denied</h3>
        <p>{{ error?.message || 'You don\'t have permission to access this resource' }}</p>
        <div class="error-actions">
          <a routerLink="/login" class="btn btn-primary">Login</a>
          <a routerLink="/" class="btn btn-secondary">Go Home</a>
        </div>
      </div>

      <!-- Warning -->
      <div *ngIf="type === 'warning'" class="error-warning">
        <div class="error-icon">⚠️</div>
        <h4>{{ error?.message || 'Warning' }}</h4>
        <p *ngIf="error?.details">{{ error?.details }}</p>
        <div class="error-actions">
          <button (click)="dismiss()" class="btn btn-primary">OK</button>
        </div>
      </div>

      <!-- Info -->
      <div *ngIf="type === 'info'" class="error-info">
        <div class="error-icon">ℹ️</div>
        <h4>{{ error?.message || 'Information' }}</h4>
        <p *ngIf="error?.details">{{ error?.details }}</p>
        <div class="error-actions">
          <button (click)="dismiss()" class="btn btn-primary">Got it</button>
        </div>
      </div>

      <!-- Inline Error -->
      <div *ngIf="type === 'inline'" class="error-inline">
        <div class="error-content">
          <span class="error-icon">❌</span>
          <span class="error-text">{{ error?.message || 'An error occurred' }}</span>
        </div>
        <button (click)="dismiss()" class="error-close" aria-label="Close error">×</button>
      </div>
    </div>

    <!-- Fallback content when no error -->
    <div *ngIf="!hasError" class="error-boundary-content">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .error-boundary {
      width: 100%;
    }

    .error-critical,
    .error-network,
    .error-not-found,
    .error-permission {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 40px 20px;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      margin: 20px;
    }

    .error-warning,
    .error-info {
      padding: 20px;
      border-radius: 8px;
      margin: 10px 0;
      text-align: center;
    }

    .error-warning {
      background: #fff3cd;
      border: 1px solid #ffeeba;
      color: #856404;
    }

    .error-info {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }

    .error-inline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 6px;
      color: #721c24;
      margin: 10px 0;
    }

    .error-inline .error-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .error-close:hover {
      opacity: 1;
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .error-inline .error-icon {
      font-size: 1.2rem;
      margin: 0;
    }

    .error-warning .error-icon,
    .error-info .error-icon {
      font-size: 2rem;
      margin-bottom: 15px;
      display: block;
    }

    h2, h3, h4 {
      margin-bottom: 15px;
      color: #333;
    }

    .error-critical h2 {
      color: #dc3545;
    }

    .error-network h3 {
      color: #17a2b8;
    }

    .error-not-found h3 {
      color: #6c757d;
    }

    .error-permission h3 {
      color: #fd7e14;
    }

    p {
      margin-bottom: 25px;
      color: #6c757d;
      max-width: 600px;
      line-height: 1.5;
    }

    .error-actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
      border-color: #5a67d8;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }

    .btn-secondary:hover {
      background: #5a6268;
      border-color: #545b62;
    }

    .btn-link {
      background: transparent;
      color: #667eea;
      border: none;
      text-decoration: underline;
    }

    .btn-link:hover {
      color: #5a67d8;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .error-details {
      margin-top: 20px;
      text-align: left;
      max-width: 800px;
      width: 100%;
    }

    .error-details h4 {
      margin-bottom: 10px;
      color: #495057;
    }

    .error-details pre {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      font-size: 0.875rem;
      color: #495057;
      max-height: 300px;
      overflow-y: auto;
    }

    .error-boundary-content {
      width: 100%;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .error-critical,
      .error-network,
      .error-not-found,
      .error-permission {
        min-height: 300px;
        padding: 30px 15px;
        margin: 10px;
      }

      .error-icon {
        font-size: 3rem;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .btn {
        width: 200px;
      }
    }
  `]
})
export class ErrorBoundaryComponent {
  @Input() error: ErrorInfo | null = null;
  @Input() type: 'critical' | 'network' | 'not-found' | 'permission' | 'warning' | 'info' | 'inline' = 'critical';
  @Input() showRetry: boolean = true;
  
  @Output() retryClick = new EventEmitter<void>();
  @Output() dismissClick = new EventEmitter<void>();

  showDetails = false;
  retrying = false;

  get hasError(): boolean {
    return this.error !== null;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  retry(): void {
    if (this.retrying) return;
    
    this.retrying = true;
    this.retryClick.emit();
    
    setTimeout(() => {
      this.retrying = false;
    }, 2000);
  }

  dismiss(): void {
    this.dismissClick.emit();
  }

  reload(): void {
    window.location.reload();
  }

  goHome(): void {
    window.location.href = '/';
  }

  goBack(): void {
    window.history.back();
  }
}