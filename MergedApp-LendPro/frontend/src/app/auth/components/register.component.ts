import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Register</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              formControlName="firstName"
              class="form-control"
              [class.is-invalid]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
            />
            <div class="form-error" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
              <span *ngIf="registerForm.get('firstName')?.errors?.['required']">First name is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              class="form-control"
              [class.is-invalid]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
            />
            <div class="form-error" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
              <span *ngIf="registerForm.get('lastName')?.errors?.['required']">Last name is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            />
            <div class="form-error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Invalid email format</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            />
            <div class="form-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="form-control"
              [class.is-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            />
            <div class="form-error" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Confirm password is required</span>
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</span>
            </div>
          </div>

          <div class="form-error mt-md" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block mt-lg" [disabled]="registerForm.invalid || loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>

        <p class="auth-link">
          Already have an account? <a routerLink="/login">Login here</a>
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed';
        }
      });
    }
  }
}