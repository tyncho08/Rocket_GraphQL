import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormValidationService } from '../services/form-validation.service';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-field" [class.has-error]="hasError" [class.has-warning]="hasWarning" [class.focused]="focused">
      <label *ngIf="label" [for]="fieldId" class="form-label">
        {{ label }}
        <span *ngIf="required" class="required-indicator">*</span>
      </label>
      
      <div class="input-container">
        <!-- Text Input -->
        <input
          *ngIf="type !== 'textarea' && type !== 'select'"
          [id]="fieldId"
          [type]="getInputType()"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [maxlength]="maxLength"
          [formControl]="control"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (input)="onInput($event)"
          class="form-input"
          [attr.aria-describedby]="hasError || hasWarning || hint ? fieldId + '-help' : null"
          [attr.aria-invalid]="hasError"
        />
        
        <!-- Textarea -->
        <textarea
          *ngIf="type === 'textarea'"
          [id]="fieldId"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [maxlength]="maxLength"
          [rows]="textareaRows"
          [formControl]="control"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (input)="onInput($event)"
          class="form-input form-textarea"
          [attr.aria-describedby]="hasError || hasWarning || hint ? fieldId + '-help' : null"
          [attr.aria-invalid]="hasError"
        ></textarea>
        
        <!-- Select -->
        <select
          *ngIf="type === 'select'"
          [id]="fieldId"
          [disabled]="disabled"
          [formControl]="control"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (change)="onInput($event)"
          class="form-input form-select"
          [attr.aria-describedby]="hasError || hasWarning || hint ? fieldId + '-help' : null"
          [attr.aria-invalid]="hasError"
        >
          <option *ngIf="placeholder" value="" disabled>{{ placeholder }}</option>
          <option *ngFor="let option of options" [value]="option.value">{{ option.label }}</option>
        </select>
        
        <!-- Input Icons -->
        <div *ngIf="icon || showValidationIcon" class="input-icons">
          <span *ngIf="icon" class="input-icon">{{ icon }}</span>
          <span *ngIf="showValidationIcon && hasError" class="validation-icon error">❌</span>
          <span *ngIf="showValidationIcon && !hasError && control.valid && control.value" class="validation-icon success">✅</span>
          <span *ngIf="validating" class="validation-icon validating">⏳</span>
        </div>
        
        <!-- Character Counter -->
        <div *ngIf="maxLength && showCharacterCount" class="character-count">
          {{ (control.value || '').length }} / {{ maxLength }}
        </div>
      </div>
      
      <!-- Help Text -->
      <div *ngIf="hasError || hasWarning || hint" [id]="fieldId + '-help'" class="form-help">
        <!-- Errors -->
        <div *ngFor="let error of errorMessages" class="help-text error">
          {{ error }}
        </div>
        
        <!-- Warnings -->
        <div *ngFor="let warning of warningMessages" class="help-text warning">
          {{ warning }}
        </div>
        
        <!-- Hint -->
        <div *ngIf="hint && !hasError && !hasWarning" class="help-text hint">
          {{ hint }}
        </div>
        
        <!-- Password Strength -->
        <div *ngIf="type === 'password' && showPasswordStrength && control.value" class="password-strength">
          <div class="strength-bar">
            <div class="strength-fill" [style.width.%]="passwordStrength.percentage" [class]="'strength-' + passwordStrength.level"></div>
          </div>
          <span class="strength-label">{{ passwordStrength.label }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-field {
      margin-bottom: 20px;
      width: 100%;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .required-indicator {
      color: #dc3545;
      margin-left: 2px;
    }

    .input-container {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e6ed;
      border-radius: 6px;
      font-size: 1rem;
      background: white;
      transition: all 0.2s ease;
      outline: none;
    }

    .form-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input:disabled {
      background-color: #f8f9fa;
      color: #6c757d;
      cursor: not-allowed;
    }

    .form-input:readonly {
      background-color: #f8f9fa;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-select {
      cursor: pointer;
      padding-right: 40px;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
      appearance: none;
    }

    .has-error .form-input {
      border-color: #dc3545;
    }

    .has-error .form-input:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .has-warning .form-input {
      border-color: #ffc107;
    }

    .has-warning .form-input:focus {
      border-color: #ffc107;
      box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
    }

    .input-icons {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }

    .form-select + .input-icons {
      right: 36px;
    }

    .input-icon,
    .validation-icon {
      font-size: 1rem;
    }

    .validation-icon.error {
      color: #dc3545;
    }

    .validation-icon.success {
      color: #28a745;
    }

    .validation-icon.validating {
      animation: pulse 1.5s infinite;
    }

    .character-count {
      position: absolute;
      right: 12px;
      bottom: -22px;
      font-size: 0.75rem;
      color: #6c757d;
    }

    .form-field.has-error .character-count {
      color: #dc3545;
    }

    .form-help {
      margin-top: 6px;
    }

    .help-text {
      font-size: 0.8rem;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .help-text.error {
      color: #dc3545;
    }

    .help-text.warning {
      color: #856404;
    }

    .help-text.hint {
      color: #6c757d;
    }

    .password-strength {
      margin-top: 8px;
    }

    .strength-bar {
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .strength-fill {
      height: 100%;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .strength-fill.strength-weak {
      background: #dc3545;
    }

    .strength-fill.strength-fair {
      background: #fd7e14;
    }

    .strength-fill.strength-good {
      background: #ffc107;
    }

    .strength-fill.strength-strong {
      background: #28a745;
    }

    .strength-label {
      font-size: 0.75rem;
      color: #6c757d;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Focus within animation */
    .form-field.focused .form-label {
      color: #667eea;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-input {
        padding: 10px 12px;
        font-size: 16px; /* Prevents zoom on iOS */
      }
    }
  `]
})
export class FormFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea' | 'select' = 'text';
  @Input() placeholder: string = '';
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() maxLength: number | null = null;
  @Input() textareaRows: number = 3;
  @Input() options: { value: any; label: string }[] = [];
  @Input() icon: string = '';
  @Input() showValidationIcon: boolean = true;
  @Input() showCharacterCount: boolean = false;
  @Input() showPasswordStrength: boolean = false;
  @Input() autoFormat: boolean = false;
  @Input() validationDebounceTime: number = 300;

  @Output() valueChange = new EventEmitter<any>();
  @Output() validationChange = new EventEmitter<{ valid: boolean; errors: string[] }>();

  control = new FormControl('');
  fieldId = `form-field-${Math.random().toString(36).substr(2, 9)}`;
  focused = false;
  validating = false;
  errorMessages: string[] = [];
  warningMessages: string[] = [];

  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private validationService: FormValidationService) {}

  ngOnInit() {
    this.control.valueChanges
      .pipe(
        debounceTime(this.validationDebounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.validateField(value);
        this.onChange(value);
        this.valueChange.emit(value);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  get hasError(): boolean {
    return this.errorMessages.length > 0;
  }

  get hasWarning(): boolean {
    return this.warningMessages.length > 0;
  }

  get passwordStrength(): { percentage: number; level: string; label: string } {
    if (this.type !== 'password' || !this.control.value) {
      return { percentage: 0, level: 'weak', label: '' };
    }

    const value = this.control.value;
    let score = 0;

    // Length check
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(value)) score++;

    const levels = [
      { min: 0, level: 'weak', label: 'Weak', percentage: 25 },
      { min: 2, level: 'fair', label: 'Fair', percentage: 50 },
      { min: 4, level: 'good', label: 'Good', percentage: 75 },
      { min: 5, level: 'strong', label: 'Strong', percentage: 100 }
    ];

    const result = levels.reverse().find(l => score >= l.min) || levels[0];
    return result;
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  onInput(event: any): void {
    let value = event.target.value;

    if (this.autoFormat) {
      value = this.formatValue(value);
      if (value !== event.target.value) {
        this.control.setValue(value, { emitEvent: false });
      }
    }
  }

  getInputType(): string {
    return this.type === 'tel' ? 'tel' : this.type;
  }

  private formatValue(value: string): string {
    switch (this.type) {
      case 'tel':
        return this.validationService.formatPhone(value);
      default:
        return value;
    }
  }

  private validateField(value: any): void {
    this.errorMessages = [];
    this.warningMessages = [];

    if (!value && !this.required) {
      this.emitValidationChange(true, []);
      return;
    }

    if (!value && this.required) {
      this.errorMessages.push(`${this.label || 'This field'} is required`);
      this.emitValidationChange(false, this.errorMessages);
      return;
    }

    // Type-specific validation
    switch (this.type) {
      case 'email':
        const emailResult = FormValidationService.emailValidator()(this.control);
        if (emailResult) {
          this.errorMessages.push(emailResult.email.message);
        }
        break;

      case 'tel':
        const phoneResult = FormValidationService.phoneValidator()(this.control);
        if (phoneResult) {
          this.errorMessages.push(phoneResult.phone.message);
        }
        break;

      case 'password':
        if (this.showPasswordStrength) {
          const strengthResult = FormValidationService.passwordStrengthValidator()(this.control);
          if (strengthResult && strengthResult.passwordStrength) {
            const severity = strengthResult.passwordStrength.severity || 'error';
            if (severity === 'warning') {
              this.warningMessages.push(strengthResult.passwordStrength.message);
            } else {
              this.errorMessages.push(strengthResult.passwordStrength.message);
            }
          }
        }
        break;
    }

    this.emitValidationChange(this.errorMessages.length === 0, this.errorMessages);
  }

  private emitValidationChange(valid: boolean, errors: string[]): void {
    this.validationChange.emit({ valid, errors });
  }
}