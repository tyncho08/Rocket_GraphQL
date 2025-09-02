import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AdminService, AdminUser, UsersResponse } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="user-management-container">
      <div class="page-header">
        <h1>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
            <path d="M17 21V19C17 17.9391 17.5786 16.9217 18.3284 16.1716C19.0783 15.4214 20.0957 15 21 15V15C22.1046 15 23 15.8954 23 17V21"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M1 21V19C1 17.9391 1.57857 16.9217 2.32843 16.1716C3.07828 15.4214 4.0957 15 5 15H13C13.9043 15 14.9217 15.4214 15.6716 16.1716C16.4214 16.9217 17 17.9391 17 19V21"/>
          </svg>
          User Management
        </h1>
        <p>Manage user accounts and permissions</p>
        <a routerLink="/admin" class="back-btn">← Back to Dashboard</a>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-filter">
          <input 
            type="text" 
            placeholder="Search by name or email..."
            [(ngModel)]="searchTerm"
            (input)="onSearchChange($event)"
            class="search-input">
        </div>

        <div class="results-info" *ngIf="usersResponse">
          Showing {{((usersResponse.page - 1) * usersResponse.limit) + 1}} to 
          {{Math.min(usersResponse.page * usersResponse.limit, usersResponse.totalCount)}} 
          of {{usersResponse.totalCount}} users
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>

      <!-- Users Table -->
      <div class="users-table" *ngIf="!loading && usersResponse">
        <div class="table-responsive">
          <table class="users-grid">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Applications</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of usersResponse.users" class="user-row">
                <td class="user-info">
                  <div class="user-avatar">{{getInitials(user.firstName, user.lastName)}}</div>
                  <div class="user-details">
                    <div class="user-name">{{user.firstName}} {{user.lastName}}</div>
                    <div class="user-id">ID: {{user.id}}</div>
                  </div>
                </td>
                <td class="user-email">{{user.email}}</td>
                <td class="role-cell">
                  <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                    {{user.role}}
                  </span>
                </td>
                <td class="applications-cell">
                  <div class="app-count">{{user.loanApplicationsCount}}</div>
                  <div class="app-label">applications</div>
                </td>
                <td class="date-cell">{{formatDate(user.createdAt)}}</td>
                <td class="actions-cell">
                  <select 
                    [value]="user.role"
                    (change)="updateUserRole(user, $event)"
                    class="role-select"
                    [disabled]="updatingUserId === user.id">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div class="updating-indicator" *ngIf="updatingUserId === user.id">
                    Updating...
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Users Message -->
        <div class="no-users" *ngIf="usersResponse.users.length === 0">
          <div class="no-data-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21V19C17 17.9391 17.5786 16.9217 18.3284 16.1716C19.0783 15.4214 20.0957 15 21 15V15C22.1046 15 23 15.8954 23 17V21"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M1 21V19C1 17.9391 1.57857 16.9217 2.32843 16.1716C3.07828 15.4214 4.0957 15 5 15H13C13.9043 15 14.9217 15.4214 15.6716 16.1716C16.4214 16.9217 17 17.9391 17 19V21"/>
            </svg>
          </div>
          <h3>No Users Found</h3>
          <p>No users match your current search criteria.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="usersResponse && usersResponse.totalPages > 1">
        <button 
          (click)="changePage(usersResponse.page - 1)"
          [disabled]="usersResponse.page === 1 || loading"
          class="pagination-btn">
          Previous
        </button>
        
        <span class="pagination-info">
          Page {{usersResponse.page}} of {{usersResponse.totalPages}}
        </span>
        
        <button 
          (click)="changePage(usersResponse.page + 1)"
          [disabled]="usersResponse.page === usersResponse.totalPages || loading"
          class="pagination-btn">
          Next
        </button>
      </div>

      <!-- User Statistics -->
      <div class="stats-section">
        <h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          User Statistics
        </h2>
        <div class="stats-grid" *ngIf="usersResponse">
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21V19C17 17.9391 17.5786 16.9217 18.3284 16.1716C19.0783 15.4214 20.0957 15 21 15V15C22.1046 15 23 15.8954 23 17V21"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M1 21V19C1 17.9391 1.57857 16.9217 2.32843 16.1716C3.07828 15.4214 4.0957 15 5 15H13C13.9043 15 14.9217 15.4214 15.6716 16.1716C16.4214 16.9217 17 17.9391 17 19V21"/>
              </svg>
            </div>
            <div class="stat-value">{{usersResponse.totalCount}}</div>
            <div class="stat-label">Total Users</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="stat-value">{{getUsersByRole('User')}}</div>
            <div class="stat-label">Regular Users</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22S8 18 8 14V8L12 4L16 8V14C16 18 12 22 12 22Z"/>
              </svg>
            </div>
            <div class="stat-value">{{getUsersByRole('Admin')}}</div>
            <div class="stat-label">Administrators</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
              </svg>
            </div>
            <div class="stat-value">{{getTotalApplications()}}</div>
            <div class="stat-label">Total Applications</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-management-container {
      min-height: 100vh;
      background: var(--background-secondary);
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
    }

    .page-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: var(--primary-dark);
      font-weight: 600;
    }

    .page-header p {
      font-size: 1.2rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .back-btn {
      position: absolute;
      left: 0;
      top: 0;
      color: var(--primary-dark);
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--border-medium);
      border-radius: 0.375rem;
      background: var(--background-primary);
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .back-btn:hover {
      background: var(--background-tertiary);
      border-color: var(--primary-dark);
      color: var(--primary-dark);
      text-decoration: none;
      transform: translateY(-1px);
    }

    .filters-section {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
      display: flex;
      gap: 1.25rem;
      align-items: center;
      flex-wrap: wrap;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .search-filter {
      flex: 2;
      min-width: 300px;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .results-info {
      flex: 1;
      min-width: 200px;
      color: #666;
      font-size: 0.9rem;
      text-align: right;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: var(--text-primary);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255,255,255,0.3);
      border-top: 5px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .users-table {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .users-grid {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .users-grid th {
      background: var(--background-secondary);
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      color: var(--primary-dark);
      border-bottom: 2px solid var(--border-light);
      white-space: nowrap;
    }

    .user-row {
      border-bottom: 1px solid var(--border-light);
      transition: background-color 0.3s ease;
    }

    .user-row:hover {
      background-color: var(--background-secondary);
    }

    .users-grid td {
      padding: 20px 12px;
      vertical-align: middle;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary-dark);
      color: var(--text-white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .user-details .user-name {
      font-weight: 600;
      color: var(--primary-dark);
      margin-bottom: 4px;
    }

    .user-details .user-id {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .user-email {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .role-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .role-user {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-admin {
      background: #fff3e0;
      color: #f57c00;
    }

    .applications-cell {
      text-align: center;
    }

    .app-count {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--primary-dark);
    }

    .app-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .date-cell {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .actions-cell {
      position: relative;
    }

    .role-select {
      padding: 6px 12px;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      font-size: 0.85rem;
      background: var(--background-primary);
      transition: border-color 0.3s ease;
    }

    .role-select:focus {
      outline: none;
      border-color: var(--primary-dark);
      box-shadow: 0 0 0 2px var(--shadow-light);
    }

    .updating-indicator {
      position: absolute;
      top: 100%;
      left: 0;
      font-size: 0.75rem;
      color: var(--primary-dark);
      margin-top: 4px;
    }

    .no-users {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .no-data-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .no-users h3 {
      margin-bottom: 10px;
      color: var(--primary-dark);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.25rem;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .pagination-btn {
      background: var(--background-primary);
      color: var(--primary-dark);
      border: 1px solid var(--border-medium);
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--background-tertiary);
      border-color: var(--primary-dark);
      transform: translateY(-1px);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-info {
      font-weight: 500;
    }

    .stats-section {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .stats-section h2 {
      margin-bottom: 1.5rem;
      color: var(--primary-dark);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: var(--background-secondary);
      padding: 1.5rem;
      border-radius: 0.75rem;
      text-align: center;
      border: 1px solid var(--border-light);
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
      border-color: var(--primary-dark);
    }

    .stat-icon {
      color: var(--primary-dark);
      margin-bottom: 1rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-dark);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 768px) {
      .user-management-container {
        padding: 10px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .back-btn {
        position: relative;
        display: block;
        width: fit-content;
        margin: 0 auto 20px;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-filter {
        min-width: unset;
      }

      .results-info {
        text-align: center;
      }

      .users-grid {
        font-size: 0.85rem;
      }

      .users-grid th,
      .users-grid td {
        padding: 12px 8px;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class UserManagementComponent implements OnInit, OnDestroy {
  usersResponse: UsersResponse | null = null;
  loading = true;
  updatingUserId: number | null = null;
  
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  private subscription = new Subscription();
  private searchSubject = new Subject<string>();
  
  // Expose Math to template
  Math = Math;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadUsers();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.searchSubject.complete();
  }

  setupSearchDebounce() {
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      })
    );
  }

  loadUsers() {
    this.loading = true;
    this.subscription.add(
      this.adminService.getAllUsers(
        this.currentPage,
        this.pageSize,
        this.searchTerm
      ).subscribe({
        next: (response) => {
          this.usersResponse = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.notificationService.loadError('users');
          this.loading = false;
        }
      })
    );
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  updateUserRole(user: AdminUser, event: any) {
    const newRole = event.target.value;
    if (newRole === user.role) return;

    this.updatingUserId = user.id;
    this.subscription.add(
      this.adminService.updateUserRole(user.id, newRole).subscribe({
        next: (updatedUser) => {
          user.role = updatedUser.role;
          this.notificationService.success('Updated', `User role updated to ${newRole}`);
          this.updatingUserId = null;
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.notificationService.saveError('user role update');
          this.updatingUserId = null;
          // Revert the select value
          event.target.value = user.role;
        }
      })
    );
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getUsersByRole(role: string): number {
    if (!this.usersResponse) return 0;
    return this.usersResponse.users.filter(user => user.role === role).length;
  }

  getTotalApplications(): number {
    if (!this.usersResponse) return 0;
    return this.usersResponse.users.reduce((total, user) => total + user.loanApplicationsCount, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}