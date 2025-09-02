import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Invalid email format</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <div class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
            </div>
          </div>

          <div class="form-error mt-md" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block mt-lg" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="auth-link">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: var(--space-lg);
    }

    .auth-card {
      background: var(--background-primary);
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 16px var(--shadow-medium);
      width: 100%;
      max-width: 420px;
    }

    h2 {
      text-align: center;
      margin-bottom: var(--space-xl);
      color: var(--primary-dark);
      font-size: var(--text-2xl);
      font-weight: 600;
    }

    .form-control.is-invalid {
      border-color: var(--accent-danger);
      box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
    }

    .auth-link {
      text-align: center;
      margin-top: var(--space-lg);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .auth-link a {
      color: var(--primary-dark);
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    /* Mobile responsive */
    @media (max-width: 480px) {
      .auth-container {
        padding: var(--space-sm);
        min-height: 60vh;
      }
      
      .auth-card {
        padding: var(--space-lg);
        max-width: 100%;
      }
      
      h2 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-lg);
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Login failed';
        }
      });
    }
  }
}