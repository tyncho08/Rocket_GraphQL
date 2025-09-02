import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of } from 'rxjs';

export interface AddressSuggestion {
  formatted: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressAutocompleteComponent),
      multi: true
    }
  ],
  template: `
    <div class="address-autocomplete">
      <label *ngIf="label" [for]="fieldId" class="form-label">
        {{ label }}
        <span *ngIf="required" class="required-indicator">*</span>
      </label>
      
      <div class="input-container" [class.focused]="focused" [class.has-suggestions]="suggestions.length > 0">
        <input
          #input
          [id]="fieldId"
          type="text"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [formControl]="searchControl"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          class="form-input"
          autocomplete="off"
          [attr.aria-expanded]="suggestions.length > 0"
          [attr.aria-haspopup]="true"
          [attr.aria-describedby]="fieldId + '-suggestions'"
        />
        
        <div class="input-actions">
          <span *ngIf="loading" class="loading-indicator">⏳</span>
          <button
            *ngIf="searchControl.value && !disabled"
            type="button"
            class="clear-button"
            (click)="clear()"
            aria-label="Clear address"
          >
            ×
          </button>
          <span class="location-icon">📍</span>
        </div>
      </div>
      
      <!-- Suggestions Dropdown -->
      <div
        *ngIf="suggestions.length > 0 && showSuggestions"
        [id]="fieldId + '-suggestions'"
        class="suggestions-dropdown"
        role="listbox"
        [attr.aria-label]="'Address suggestions for ' + searchControl.value"
      >
        <div
          *ngFor="let suggestion of suggestions; let i = index"
          class="suggestion-item"
          [class.selected]="i === selectedIndex"
          (click)="selectSuggestion(suggestion)"
          (mouseenter)="selectedIndex = i"
          role="option"
          [attr.aria-selected]="i === selectedIndex"
        >
          <div class="suggestion-main">{{ suggestion.formatted }}</div>
          <div class="suggestion-details" *ngIf="suggestion.city && suggestion.state">
            {{ suggestion.city }}, {{ suggestion.state }} {{ suggestion.zipCode }}
          </div>
        </div>
        
        <div *ngIf="!loading && suggestions.length === 0 && searchControl.value" class="no-suggestions">
          <span class="no-results-icon">🔍</span>
          <span>No addresses found</span>
          <button type="button" class="manual-entry-btn" (click)="enableManualEntry()">
            Enter manually
          </button>
        </div>
      </div>
      
      <!-- Manual Entry Form -->
      <div *ngIf="showManualEntry" class="manual-entry">
        <div class="manual-header">
          <h4>Enter Address Manually</h4>
          <button type="button" class="close-manual" (click)="showManualEntry = false">×</button>
        </div>
        
        <div class="manual-form">
          <div class="form-row">
            <input
              type="text"
              placeholder="Street Address"
              [(ngModel)]="manualAddress.street"
              class="form-input"
            />
          </div>
          
          <div class="form-row two-column">
            <input
              type="text"
              placeholder="City"
              [(ngModel)]="manualAddress.city"
              class="form-input"
            />
            <select [(ngModel)]="manualAddress.state" class="form-input">
              <option value="" disabled>State</option>
              <option *ngFor="let state of states" [value]="state.code">{{ state.name }}</option>
            </select>
          </div>
          
          <div class="form-row two-column">
            <input
              type="text"
              placeholder="ZIP Code"
              [(ngModel)]="manualAddress.zipCode"
              class="form-input"
              maxlength="5"
            />
            <select [(ngModel)]="manualAddress.country" class="form-input">
              <option value="US">United States</option>
            </select>
          </div>
          
          <div class="manual-actions">
            <button type="button" class="btn btn-primary" (click)="saveManualAddress()">
              Use This Address
            </button>
            <button type="button" class="btn btn-secondary" (click)="showManualEntry = false">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .address-autocomplete {
      position: relative;
      width: 100%;
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      font-size: 0.9rem;
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
      padding-right: 80px;
      border: 2px solid #e0e6ed;
      border-radius: 6px;
      font-size: 1rem;
      background: white;
      transition: all 0.2s ease;
      outline: none;
    }

    .input-container.focused .form-input {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .input-container.has-suggestions .form-input {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .input-actions {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-indicator {
      font-size: 1rem;
      animation: pulse 1.5s infinite;
    }

    .clear-button {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #6c757d;
      cursor: pointer;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .clear-button:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #333;
    }

    .location-icon {
      color: #667eea;
      font-size: 1rem;
    }

    .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #667eea;
      border-top: none;
      border-radius: 0 0 6px 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
    }

    .suggestion-item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f1f3f4;
      transition: background-color 0.2s ease;
    }

    .suggestion-item:hover,
    .suggestion-item.selected {
      background-color: #f8f9ff;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-main {
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .suggestion-details {
      font-size: 0.85rem;
      color: #6c757d;
    }

    .no-suggestions {
      padding: 20px;
      text-align: center;
      color: #6c757d;
    }

    .no-results-icon {
      display: block;
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .manual-entry-btn {
      background: none;
      border: 1px solid #667eea;
      color: #667eea;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }

    .manual-entry-btn:hover {
      background: #667eea;
      color: white;
    }

    .manual-entry {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 2px solid #667eea;
      border-top: none;
      border-radius: 0 0 6px 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      padding: 20px;
    }

    .manual-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e0e6ed;
    }

    .manual-header h4 {
      margin: 0;
      color: #333;
      font-size: 1rem;
    }

    .close-manual {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-row {
      margin-bottom: 12px;
    }

    .form-row.two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .manual-form .form-input {
      padding: 8px 12px;
      font-size: 0.9rem;
      margin-bottom: 0;
    }

    .manual-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 15px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @media (max-width: 768px) {
      .form-input {
        font-size: 16px; /* Prevents zoom on iOS */
      }

      .manual-entry {
        left: -20px;
        right: -20px;
        border-left: none;
        border-right: none;
        border-radius: 0;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
    }
  `]
})
export class AddressAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;

  @Input() label: string = '';
  @Input() placeholder: string = 'Enter your address';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() debounceTime: number = 300;

  @Output() addressSelected = new EventEmitter<AddressSuggestion>();

  searchControl = new FormControl('');
  fieldId = `address-autocomplete-${Math.random().toString(36).substr(2, 9)}`;
  
  suggestions: AddressSuggestion[] = [];
  selectedIndex = -1;
  focused = false;
  loading = false;
  showSuggestions = false;
  showManualEntry = false;

  manualAddress: Partial<AddressSuggestion> = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  };

  states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        switchMap(query => this.searchAddresses(query || '')),
        takeUntil(this.destroy$)
      )
      .subscribe(suggestions => {
        this.suggestions = suggestions;
        this.selectedIndex = -1;
        this.loading = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value && typeof value === 'object') {
      this.searchControl.setValue(value.formatted || '', { emitEvent: false });
    } else if (value) {
      this.searchControl.setValue(value, { emitEvent: false });
    }
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
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }

  onFocus(): void {
    this.focused = true;
    this.showSuggestions = true;
    if (this.suggestions.length === 0 && this.searchControl.value) {
      this.searchAddresses(this.searchControl.value).subscribe(suggestions => {
        this.suggestions = suggestions;
      });
    }
  }

  onBlur(): void {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      this.focused = false;
      this.showSuggestions = false;
      this.onTouched();
    }, 200);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions || this.suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.suggestions.length) {
          this.selectSuggestion(this.suggestions[this.selectedIndex]);
        }
        break;

      case 'Escape':
        this.showSuggestions = false;
        this.selectedIndex = -1;
        break;
    }
  }

  selectSuggestion(suggestion: AddressSuggestion): void {
    this.searchControl.setValue(suggestion.formatted);
    this.showSuggestions = false;
    this.selectedIndex = -1;
    this.onChange(suggestion);
    this.addressSelected.emit(suggestion);
  }

  clear(): void {
    this.searchControl.setValue('');
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedIndex = -1;
    this.onChange(null);
  }

  enableManualEntry(): void {
    this.showManualEntry = true;
    this.showSuggestions = false;
  }

  saveManualAddress(): void {
    const address: AddressSuggestion = {
      formatted: `${this.manualAddress.street}, ${this.manualAddress.city}, ${this.manualAddress.state} ${this.manualAddress.zipCode}`,
      street: this.manualAddress.street || '',
      city: this.manualAddress.city || '',
      state: this.manualAddress.state || '',
      zipCode: this.manualAddress.zipCode || '',
      country: this.manualAddress.country || 'US'
    };

    this.selectSuggestion(address);
    this.showManualEntry = false;
    
    // Reset manual form
    this.manualAddress = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    };
  }

  private searchAddresses(query: string): Subject<AddressSuggestion[]> {
    const result$ = new Subject<AddressSuggestion[]>();
    
    if (!query || query.length < 3) {
      result$.next([]);
      return result$;
    }

    this.loading = true;

    // Simulate API call with mock data
    setTimeout(() => {
      const mockSuggestions: AddressSuggestion[] = [
        {
          formatted: `${query} Main St`,
          street: `${query} Main St`,
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        {
          formatted: `${query} Oak Ave`,
          street: `${query} Oak Ave`,
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'US',
          coordinates: { lat: 39.7817, lng: -89.6501 }
        },
        {
          formatted: `${query} Elm Street`,
          street: `${query} Elm Street`,
          city: 'Madison',
          state: 'WI',
          zipCode: '53703',
          country: 'US',
          coordinates: { lat: 43.0731, lng: -89.4012 }
        }
      ].filter(addr => 
        addr.formatted.toLowerCase().includes(query.toLowerCase()) ||
        addr.city.toLowerCase().includes(query.toLowerCase()) ||
        addr.state.toLowerCase().includes(query.toLowerCase())
      );

      result$.next(mockSuggestions);
    }, 500);

    return result$;
  }
}