import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-spinner-container" [class]="'size-' + size" [class.overlay]="overlay">
      <div class="spinner-wrapper">
        <div class="spinner" [class]="'spinner-' + variant"></div>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: var(--min-height, 100px);
    }

    .loading-spinner-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 9999;
      min-height: 100vh;
    }

    .spinner-wrapper {
      text-align: center;
    }

    .spinner {
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Size variants */
    .size-small {
      --min-height: 40px;
    }

    .size-small .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(102, 126, 234, 0.2);
      border-top: 3px solid #667eea;
    }

    .size-medium {
      --min-height: 80px;
    }

    .size-medium .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(102, 126, 234, 0.2);
      border-top: 4px solid #667eea;
    }

    .size-large {
      --min-height: 120px;
    }

    .size-large .spinner {
      width: 60px;
      height: 60px;
      border: 5px solid rgba(102, 126, 234, 0.2);
      border-top: 5px solid #667eea;
    }

    /* Variant styles */
    .spinner-primary {
      border-color: rgba(102, 126, 234, 0.2);
      border-top-color: #667eea;
    }

    .spinner-secondary {
      border-color: rgba(108, 117, 125, 0.2);
      border-top-color: #6c757d;
    }

    .spinner-success {
      border-color: rgba(40, 167, 69, 0.2);
      border-top-color: #28a745;
    }

    .spinner-warning {
      border-color: rgba(255, 193, 7, 0.2);
      border-top-color: #ffc107;
    }

    .spinner-danger {
      border-color: rgba(220, 53, 69, 0.2);
      border-top-color: #dc3545;
    }

    .spinner-white {
      border-color: rgba(255, 255, 255, 0.3);
      border-top-color: white;
    }

    .loading-message {
      margin-top: 15px;
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .overlay .loading-message {
      color: #333;
      font-size: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Pulse animation for dots */
    .spinner-dots {
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: center;
    }

    .spinner-dots::before,
    .spinner-dots::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      animation: pulse 1.4s ease-in-out infinite both;
    }

    .spinner-dots {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      animation: pulse 1.4s ease-in-out infinite both;
    }

    .spinner-dots::before {
      animation-delay: -0.32s;
    }

    .spinner-dots::after {
      animation-delay: 0.32s;
    }

    @keyframes pulse {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white' | 'dots' = 'primary';
  @Input() message: string = '';
  @Input() overlay: boolean = false;
}