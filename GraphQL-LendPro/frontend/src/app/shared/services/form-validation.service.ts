import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidationRule {
  validator: ValidatorFn;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  // Custom validators
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(control.value);
      
      return isValid ? null : { email: { message: 'Please enter a valid email address' } };
    };
  }

  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      const isValid = phoneRegex.test(control.value.replace(/\s/g, ''));
      
      return isValid ? null : { phone: { message: 'Please enter a valid phone number (e.g., 555-123-4567)' } };
    };
  }

  static ssnValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
      const isValid = ssnRegex.test(control.value.replace(/\s/g, ''));
      
      return isValid ? null : { ssn: { message: 'Please enter a valid SSN (e.g., 123-45-6789)' } };
    };
  }

  static currencyValidator(min?: number, max?: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = parseFloat(control.value.toString().replace(/[$,]/g, ''));
      
      if (isNaN(value)) {
        return { currency: { message: 'Please enter a valid amount' } };
      }
      
      if (min !== undefined && value < min) {
        return { currency: { message: `Amount must be at least $${min.toLocaleString()}` } };
      }
      
      if (max !== undefined && value > max) {
        return { currency: { message: `Amount cannot exceed $${max.toLocaleString()}` } };
      }
      
      return null;
    };
  }

  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value;
      const errors: any = {};
      
      if (value.length < 8) {
        errors.passwordStrength = { message: 'Password must be at least 8 characters long' };
      } else {
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(value);
        
        const score = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
        
        if (score < 3) {
          errors.passwordStrength = { 
            message: 'Password should contain uppercase, lowercase, number, and special character',
            severity: 'warning'
          };
        }
      }
      
      return Object.keys(errors).length ? errors : null;
    };
  }

  static confirmPasswordValidator(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const parent = control.parent;
      if (!parent) return null;
      
      const password = parent.get(passwordField);
      if (!password) return null;
      
      return control.value === password.value ? null : 
        { confirmPassword: { message: 'Passwords do not match' } };
    };
  }

  static dateRangeValidator(minDate?: Date, maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const date = new Date(control.value);
      
      if (isNaN(date.getTime())) {
        return { dateRange: { message: 'Please enter a valid date' } };
      }
      
      if (minDate && date < minDate) {
        return { dateRange: { message: `Date cannot be before ${minDate.toLocaleDateString()}` } };
      }
      
      if (maxDate && date > maxDate) {
        return { dateRange: { message: `Date cannot be after ${maxDate.toLocaleDateString()}` } };
      }
      
      return null;
    };
  }

  static creditScoreValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const score = parseInt(control.value);
      
      if (isNaN(score) || score < 300 || score > 850) {
        return { creditScore: { message: 'Credit score must be between 300 and 850' } };
      }
      
      return null;
    };
  }

  // Field formatters
  formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  formatSSN(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  }

  formatCurrency(value: string): string {
    const number = parseFloat(value.replace(/[$,]/g, ''));
    return isNaN(number) ? value : number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  formatCurrencyInput(value: string): string {
    // Remove non-digit characters except decimal point
    let cleaned = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    return cleaned;
  }

  // Real-time validation
  validateForm(formValue: any, rules: { [field: string]: ValidationRule[] }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const info: ValidationError[] = [];
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = formValue[field];
      const control = { value } as AbstractControl;
      
      for (const rule of fieldRules) {
        const result = rule.validator(control);
        if (result) {
          const error: ValidationError = {
            field,
            message: rule.message,
            severity: rule.severity || 'error',
            code: Object.keys(result)[0]
          };
          
          switch (error.severity) {
            case 'error':
              errors.push(error);
              break;
            case 'warning':
              warnings.push(error);
              break;
            case 'info':
              info.push(error);
              break;
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    };
  }

  // Async validators
  static asyncEmailValidator() {
    return (control: AbstractControl) => {
      return new Promise((resolve) => {
        // Simulate API call to check email availability
        setTimeout(() => {
          const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
          const email = control.value;
          
          if (!email) {
            resolve(null);
            return;
          }
          
          const domain = email.split('@')[1];
          if (domain && !commonDomains.includes(domain)) {
            resolve({ emailSuggestion: { message: `Did you mean ${email.replace(domain, 'gmail.com')}?` } });
          } else {
            resolve(null);
          }
        }, 500);
      });
    };
  }
}