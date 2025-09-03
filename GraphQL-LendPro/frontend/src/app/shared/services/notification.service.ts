import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: { label: string, action: () => void }[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  private addNotification(notification: Omit<Notification, 'id'>): void {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, newNotification]);

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }
  }

  success(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 0 // Errors don't auto-dismiss by default
    });
  }

  warning(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  removeNotification(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Convenience methods for common scenarios
  saveSuccess(itemName: string = 'Item'): void {
    this.success('Success', `${itemName} saved successfully`);
  }

  deleteSuccess(itemName: string = 'Item'): void {
    this.success('Deleted', `${itemName} deleted successfully`);
  }

  saveError(itemName: string = 'Item', error?: string): void {
    this.error('Save Failed', error || `Failed to save ${itemName}`);
  }

  loadError(itemName: string = 'Data', error?: string): void {
    this.error('Load Failed', error || `Failed to load ${itemName}`);
  }

  networkError(): void {
    this.error('Network Error', 'Please check your internet connection and try again');
  }

  unauthorized(): void {
    this.error('Unauthorized', 'You need to log in to perform this action');
  }

  forbidden(): void {
    this.error('Access Denied', 'You do not have permission to perform this action');
  }
}