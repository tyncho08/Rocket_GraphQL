import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="notifications-container" [class]="'position-' + position">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByFn" 
        class="notification"
        [ngClass]="'notification-' + notification.type"
        [@slideInOut]
        (click)="removeNotification(notification.id)"
      >
        <div class="notification-header">
          <div class="notification-icon" [innerHTML]="getIcon(notification.type)"></div>
          <div class="notification-title">{{ notification.title }}</div>
          <button 
            class="notification-close" 
            (click)="removeNotification(notification.id)"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <div class="notification-message" *ngIf="notification.message">
          {{ notification.message }}
        </div>
        <div class="notification-actions" *ngIf="notification.actions">
          <button 
            *ngFor="let action of notification.actions"
            class="notification-action"
            (click)="action.action(); removeNotification(notification.id)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      z-index: 1000;
      max-width: 400px;
      pointer-events: none;
    }

    .position-top-right {
      top: 1rem;
      right: 1rem;
    }

    .position-top-left {
      top: 1rem;
      left: 1rem;
    }

    .position-bottom-right {
      bottom: 1rem;
      right: 1rem;
    }

    .position-bottom-left {
      bottom: 1rem;
      left: 1rem;
    }

    .position-top-center {
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .position-bottom-center {
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .notification {
      background: var(--background-primary);
      border-radius: 0.5rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 2px 8px var(--shadow-medium);
      margin-bottom: 1rem;
      padding: 1rem;
      border-left: 4px solid;
      cursor: pointer;
      pointer-events: all;
      animation: slideIn 0.3s ease-out;
      transition: all 0.3s ease;
    }

    .notification:hover {
      transform: translateX(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .notification-success {
      border-left-color: var(--accent-success);
      background: var(--background-primary);
    }

    .notification-success .notification-icon {
      color: var(--accent-success);
    }

    .notification-error {
      border-left-color: var(--accent-danger);
      background: var(--background-primary);
    }

    .notification-error .notification-icon {
      color: var(--accent-danger);
    }

    .notification-warning {
      border-left-color: var(--accent-warning);
      background: var(--background-primary);
    }

    .notification-warning .notification-icon {
      color: var(--accent-warning);
    }

    .notification-info {
      border-left-color: var(--primary-dark);
      background: var(--background-primary);
    }

    .notification-info .notification-icon {
      color: var(--primary-dark);
    }

    .notification-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .notification-icon {
      margin-right: 0.5rem;
      display: flex;
      align-items: center;
    }

    .notification-icon svg {
      width: 20px;
      height: 20px;
    }

    .notification-title {
      font-weight: 600;
      flex: 1;
      color: var(--primary-dark);
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-muted);
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .notification-close:hover {
      background-color: var(--background-tertiary);
      color: var(--text-primary);
    }

    .notification-message {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .notification-actions {
      margin-top: 0.75rem;
      display: flex;
      gap: 0.5rem;
    }

    .notification-action {
      background: transparent;
      border: 1px solid var(--border-medium);
      border-radius: 0.25rem;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
    }

    .notification-action:hover {
      background-color: var(--background-tertiary);
      border-color: var(--primary-dark);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .notifications-container {
        top: 0.5rem;
        right: 0.5rem;
        left: 0.5rem;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' = 'top-right';
  
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  trackByFn(index: number, item: Notification): string {
    return item.id;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': 
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>';
      case 'error': 
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      case 'warning': 
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.68 21h16.64a2 2 0 0 0 1.86-2.86L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      case 'info': 
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
      default: 
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12H14L13 11V7A2 2 0 0 0 11 5H9A2 2 0 0 0 7 7V11"/><path d="M14 9V7A6 6 0 0 0 2 7V11A10 10 0 0 0 12 21A10 10 0 0 0 22 11V7A6 6 0 0 0 14 9Z"/></svg>';
    }
  }
}