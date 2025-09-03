import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { LoanService } from '../../dashboard/services/loan.service';
import { AuthService } from '../../auth/services/auth.service';

export interface LoanApplicationData {
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ssn: string;
    dateOfBirth: string;
    maritalStatus: string;
  };
  
  // Employment Information
  employmentInfo: {
    employmentStatus: string;
    employerName: string;
    jobTitle: string;
    workStartDate: string;
    grossAnnualIncome: number;
    otherIncome?: number;
    otherIncomeSource?: string;
  };
  
  // Financial Information
  financialInfo: {
    assets: {
      checkingAccount: number;
      savingsAccount: number;
      investmentAccounts: number;
      retirementAccounts: number;
      realEstate: number;
      other: number;
    };
    debts: {
      creditCards: number;
      studentLoans: number;
      autoLoans: number;
      otherDebts: number;
    };
  };
  
  // Loan Details
  loanInfo: {
    propertyAddress: string;
    propertyValue: number;
    downPayment: number;
    loanAmount: number;
    loanPurpose: string;
    propertyType: string;
    occupancyType: string;
  };
  
  // References
  references: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }[];
}

@Component({
  selector: 'app-loan-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="application-container">
      <div class="application-header">
        <h1>Loan Application</h1>
        <p>Complete your mortgage application to get pre-approved</p>
        
        <div class="progress-bar">
          <div class="progress-steps">
            <div 
              *ngFor="let step of steps; let i = index" 
              class="step"
              [class.active]="currentStep === i"
              [class.completed]="currentStep > i"
            >
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-title">{{ step.title }}</div>
            </div>
          </div>
          <div class="progress-line" [style.width.%]="((currentStep + 1) / steps.length) * 100"></div>
        </div>
      </div>

      <div class="application-form-container">
        <form [formGroup]="applicationForm" (ngSubmit)="onSubmit()">
          
          <!-- Step 1: Personal Information -->
          <div *ngIf="currentStep === 0" class="step-content">
            <div class="step-header">
              <h2>Personal Information</h2>
              <p>Let's start with your basic information</p>
            </div>
            
            <div formGroupName="personalInfo" class="form-section">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name *</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    formControlName="firstName" 
                    class="form-input"
                    [class.error]="isFieldInvalid('personalInfo.firstName')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('personalInfo.firstName')">
                    First name is required
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="lastName">Last Name *</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    formControlName="lastName" 
                    class="form-input"
                    [class.error]="isFieldInvalid('personalInfo.lastName')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('personalInfo.lastName')">
                    Last name is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email" 
                    class="form-input"
                    [class.error]="isFieldInvalid('personalInfo.email')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('personalInfo.email')">
                    Valid email address is required
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="phone">Phone Number *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    formControlName="phone" 
                    class="form-input"
                    placeholder="(555) 123-4567"
                    [class.error]="isFieldInvalid('personalInfo.phone')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('personalInfo.phone')">
                    Phone number is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="ssn">Social Security Number *</label>
                  <input 
                    type="password" 
                    id="ssn" 
                    formControlName="ssn" 
                    class="form-input"
                    placeholder="XXX-XX-XXXX"
                    [class.error]="isFieldInvalid('personalInfo.ssn')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('personalInfo.ssn')">
                    SSN is required
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="dateOfBirth">Date of Birth *</label>
                  <input 
                    type="date" 
                    id="dateOfBirth" 
                    formControlName="dateOfBirth" 
                    class="form-input"
                    [class.error]="isFieldInvalid('personalInfo.dateOfBirth')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('personalInfo.dateOfBirth')">
                    Date of birth is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="maritalStatus">Marital Status *</label>
                  <select 
                    id="maritalStatus" 
                    formControlName="maritalStatus" 
                    class="form-input"
                    [class.error]="isFieldInvalid('personalInfo.maritalStatus')"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                  <div class="error-message" *ngIf="isFieldInvalid('personalInfo.maritalStatus')">
                    Marital status is required
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Employment Information -->
          <div *ngIf="currentStep === 1" class="step-content">
            <div class="step-header">
              <h2>Employment Information</h2>
              <p>Tell us about your current employment</p>
            </div>
            
            <div formGroupName="employmentInfo" class="form-section">
              <div class="form-row">
                <div class="form-group">
                  <label for="employmentStatus">Employment Status *</label>
                  <select 
                    id="employmentStatus" 
                    formControlName="employmentStatus" 
                    class="form-input"
                    [class.error]="isFieldInvalid('employmentInfo.employmentStatus')"
                  >
                    <option value="">Select Status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="retired">Retired</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                  </select>
                  <div class="error-message" *ngIf="isFieldInvalid('employmentInfo.employmentStatus')">
                    Employment status is required
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="employerName">Employer Name *</label>
                  <input 
                    type="text" 
                    id="employerName" 
                    formControlName="employerName" 
                    class="form-input"
                    [class.error]="isFieldInvalid('employmentInfo.employerName')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('employmentInfo.employerName')">
                    Employer name is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="jobTitle">Job Title *</label>
                  <input 
                    type="text" 
                    id="jobTitle" 
                    formControlName="jobTitle" 
                    class="form-input"
                    [class.error]="isFieldInvalid('employmentInfo.jobTitle')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('employmentInfo.jobTitle')">
                    Job title is required
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="workStartDate">Start Date *</label>
                  <input 
                    type="date" 
                    id="workStartDate" 
                    formControlName="workStartDate" 
                    class="form-input"
                    [class.error]="isFieldInvalid('employmentInfo.workStartDate')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('employmentInfo.workStartDate')">
                    Work start date is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="grossAnnualIncome">Gross Annual Income *</label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number" 
                      id="grossAnnualIncome" 
                      formControlName="grossAnnualIncome" 
                      class="form-input"
                      placeholder="75,000"
                      [class.error]="isFieldInvalid('employmentInfo.grossAnnualIncome')"
                    />
                  </div>
                  <div class="error-message" *ngIf="isFieldInvalid('employmentInfo.grossAnnualIncome')">
                    Annual income is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="otherIncome">Other Monthly Income</label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number" 
                      id="otherIncome" 
                      formControlName="otherIncome" 
                      class="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="otherIncomeSource">Other Income Source</label>
                  <input 
                    type="text" 
                    id="otherIncomeSource" 
                    formControlName="otherIncomeSource" 
                    class="form-input"
                    placeholder="Rental income, investments, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Financial Information -->
          <div *ngIf="currentStep === 2" class="step-content">
            <div class="step-header">
              <h2>Financial Information</h2>
              <p>Provide details about your assets and debts</p>
            </div>
            
            <div formGroupName="financialInfo" class="form-section">
              <!-- Assets Section -->
              <div class="subsection">
                <h3>Assets</h3>
                <div formGroupName="assets">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="checkingAccount">Checking Account</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="checkingAccount" 
                          formControlName="checkingAccount" 
                          class="form-input"
                          placeholder="5,000"
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="savingsAccount">Savings Account</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="savingsAccount" 
                          formControlName="savingsAccount" 
                          class="form-input"
                          placeholder="15,000"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="investmentAccounts">Investment Accounts</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="investmentAccounts" 
                          formControlName="investmentAccounts" 
                          class="form-input"
                          placeholder="25,000"
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="retirementAccounts">Retirement Accounts</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="retirementAccounts" 
                          formControlName="retirementAccounts" 
                          class="form-input"
                          placeholder="50,000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Debts Section -->
              <div class="subsection">
                <h3>Monthly Debt Payments</h3>
                <div formGroupName="debts">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="creditCards">Credit Cards</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="creditCards" 
                          formControlName="creditCards" 
                          class="form-input"
                          placeholder="200"
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="studentLoans">Student Loans</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="studentLoans" 
                          formControlName="studentLoans" 
                          class="form-input"
                          placeholder="300"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="autoLoans">Auto Loans</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="autoLoans" 
                          formControlName="autoLoans" 
                          class="form-input"
                          placeholder="400"
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="otherDebts">Other Debts</label>
                      <div class="input-with-prefix">
                        <span class="input-prefix">$</span>
                        <input 
                          type="number" 
                          id="otherDebts" 
                          formControlName="otherDebts" 
                          class="form-input"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Loan Details -->
          <div *ngIf="currentStep === 3" class="step-content">
            <div class="step-header">
              <h2>Loan Details</h2>
              <p>Tell us about the property and loan you're seeking</p>
            </div>
            
            <div formGroupName="loanInfo" class="form-section">
              <div class="form-row full-width">
                <div class="form-group">
                  <label for="propertyAddress">Property Address *</label>
                  <input 
                    type="text" 
                    id="propertyAddress" 
                    formControlName="propertyAddress" 
                    class="form-input"
                    placeholder="123 Main St, Austin, TX 78701"
                    [class.error]="isFieldInvalid('loanInfo.propertyAddress')"
                  />
                  <div class="error-message" *ngIf="isFieldInvalid('loanInfo.propertyAddress')">
                    Property address is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="propertyValue">Property Value *</label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number" 
                      id="propertyValue" 
                      formControlName="propertyValue" 
                      class="form-input"
                      placeholder="350,000"
                      [class.error]="isFieldInvalid('loanInfo.propertyValue')"
                    />
                  </div>
                  <div class="error-message" *ngIf="isFieldInvalid('loanInfo.propertyValue')">
                    Property value is required
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="downPayment">Down Payment *</label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number" 
                      id="downPayment" 
                      formControlName="downPayment" 
                      class="form-input"
                      placeholder="70,000"
                      [class.error]="isFieldInvalid('loanInfo.downPayment')"
                    />
                  </div>
                  <div class="down-payment-info" *ngIf="getDownPaymentPercentage() > 0">
                    {{ getDownPaymentPercentage() }}% down payment
                  </div>
                  <div class="error-message" *ngIf="isFieldInvalid('loanInfo.downPayment')">
                    Down payment is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="loanPurpose">Loan Purpose *</label>
                  <select 
                    id="loanPurpose" 
                    formControlName="loanPurpose" 
                    class="form-input"
                    [class.error]="isFieldInvalid('loanInfo.loanPurpose')"
                  >
                    <option value="">Select Purpose</option>
                    <option value="purchase">Purchase</option>
                    <option value="refinance">Refinance</option>
                    <option value="cashout-refinance">Cash-out Refinance</option>
                  </select>
                  <div class="error-message" *ngIf="isFieldInvalid('loanInfo.loanPurpose')">
                    Loan purpose is required
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="propertyType">Property Type *</label>
                  <select 
                    id="propertyType" 
                    formControlName="propertyType" 
                    class="form-input"
                    [class.error]="isFieldInvalid('loanInfo.propertyType')"
                  >
                    <option value="">Select Type</option>
                    <option value="single-family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi-family">Multi-Family</option>
                  </select>
                  <div class="error-message" *ngIf="isFieldInvalid('loanInfo.propertyType')">
                    Property type is required
                  </div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="occupancyType">Occupancy Type *</label>
                  <select 
                    id="occupancyType" 
                    formControlName="occupancyType" 
                    class="form-input"
                    [class.error]="isFieldInvalid('loanInfo.occupancyType')"
                  >
                    <option value="">Select Occupancy</option>
                    <option value="primary">Primary Residence</option>
                    <option value="secondary">Secondary Home</option>
                    <option value="investment">Investment Property</option>
                  </select>
                  <div class="error-message" *ngIf="isFieldInvalid('loanInfo.occupancyType')">
                    Occupancy type is required
                  </div>
                </div>
              </div>
              
              <!-- Calculated Loan Amount -->
              <div class="loan-summary">
                <div class="summary-item">
                  <span class="label">Requested Loan Amount:</span>
                  <span class="value">{{ formatCurrency(getCalculatedLoanAmount()) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: References -->
          <div *ngIf="currentStep === 4" class="step-content">
            <div class="step-header">
              <h2>References</h2>
              <p>Provide at least two personal references</p>
            </div>
            
            <div formArrayName="references" class="form-section">
              <div 
                *ngFor="let reference of references.controls; let i = index"
                [formGroupName]="i"
                class="reference-group"
              >
                <h4>Reference {{ i + 1 }}</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label [for]="'refName' + i">Name *</label>
                    <input 
                      type="text" 
                      [id]="'refName' + i"
                      formControlName="name" 
                      class="form-input"
                      [class.error]="isReferenceFieldInvalid(i, 'name')"
                    />
                    <div class="error-message" *ngIf="isReferenceFieldInvalid(i, 'name')">
                      Reference name is required
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label [for]="'refRelationship' + i">Relationship *</label>
                    <select 
                      [id]="'refRelationship' + i"
                      formControlName="relationship" 
                      class="form-input"
                      [class.error]="isReferenceFieldInvalid(i, 'relationship')"
                    >
                      <option value="">Select Relationship</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="family">Family Member</option>
                      <option value="employer">Employer</option>
                    </select>
                    <div class="error-message" *ngIf="isReferenceFieldInvalid(i, 'relationship')">
                      Relationship is required
                    </div>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label [for]="'refPhone' + i">Phone *</label>
                    <input 
                      type="tel" 
                      [id]="'refPhone' + i"
                      formControlName="phone" 
                      class="form-input"
                      placeholder="(555) 123-4567"
                      [class.error]="isReferenceFieldInvalid(i, 'phone')"
                    />
                    <div class="error-message" *ngIf="isReferenceFieldInvalid(i, 'phone')">
                      Phone number is required
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label [for]="'refEmail' + i">Email</label>
                    <input 
                      type="email" 
                      [id]="'refEmail' + i"
                      formControlName="email" 
                      class="form-input"
                      placeholder="reference@email.com"
                    />
                  </div>
                </div>
                
                <button 
                  *ngIf="references.length > 2"
                  type="button" 
                  (click)="removeReference(i)" 
                  class="btn btn-danger btn-sm"
                >
                  Remove Reference
                </button>
              </div>
              
              <button 
                type="button" 
                (click)="addReference()" 
                class="btn btn-outline"
                *ngIf="references.length < 5"
              >
                + Add Another Reference
              </button>
            </div>
          </div>

          <!-- Step 6: Review & Submit -->
          <div *ngIf="currentStep === 5" class="step-content">
            <div class="step-header">
              <h2>Review & Submit</h2>
              <p>Review your application before submitting</p>
            </div>
            
            <div class="review-section">
              <!-- Personal Info Summary -->
              <div class="review-card">
                <h3>Personal Information</h3>
                <div class="review-items">
                  <div class="review-item">
                    <span class="label">Name:</span>
                    <span class="value">{{ applicationForm.get('personalInfo.firstName')?.value }} {{ applicationForm.get('personalInfo.lastName')?.value }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Email:</span>
                    <span class="value">{{ applicationForm.get('personalInfo.email')?.value }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Phone:</span>
                    <span class="value">{{ applicationForm.get('personalInfo.phone')?.value }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Marital Status:</span>
                    <span class="value">{{ applicationForm.get('personalInfo.maritalStatus')?.value | titlecase }}</span>
                  </div>
                </div>
                <button type="button" (click)="goToStep(0)" class="btn btn-link btn-sm">Edit</button>
              </div>
              
              <!-- Employment Summary -->
              <div class="review-card">
                <h3>Employment Information</h3>
                <div class="review-items">
                  <div class="review-item">
                    <span class="label">Employer:</span>
                    <span class="value">{{ applicationForm.get('employmentInfo.employerName')?.value }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Job Title:</span>
                    <span class="value">{{ applicationForm.get('employmentInfo.jobTitle')?.value }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Annual Income:</span>
                    <span class="value">{{ formatCurrency(applicationForm.get('employmentInfo.grossAnnualIncome')?.value) }}</span>
                  </div>
                </div>
                <button type="button" (click)="goToStep(1)" class="btn btn-link btn-sm">Edit</button>
              </div>
              
              <!-- Loan Details Summary -->
              <div class="review-card">
                <h3>Loan Information</h3>
                <div class="review-items">
                  <div class="review-item">
                    <span class="label">Property Address:</span>
                    <span class="value">{{ applicationForm.get('loanInfo.propertyAddress')?.value }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Property Value:</span>
                    <span class="value">{{ formatCurrency(applicationForm.get('loanInfo.propertyValue')?.value) }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Down Payment:</span>
                    <span class="value">{{ formatCurrency(applicationForm.get('loanInfo.downPayment')?.value) }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Requested Loan Amount:</span>
                    <span class="value primary">{{ formatCurrency(getCalculatedLoanAmount()) }}</span>
                  </div>
                </div>
                <button type="button" (click)="goToStep(3)" class="btn btn-link btn-sm">Edit</button>
              </div>
              
              <!-- Terms and Conditions -->
              <div class="terms-section">
                <div class="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="agreeTerms" 
                    [(ngModel)]="agreeToTerms" 
                    [ngModelOptions]="{standalone: true}"
                  />
                  <label for="agreeTerms">
                    I agree to the <a href="#" target="_blank">Terms and Conditions</a> and 
                    <a href="#" target="_blank">Privacy Policy</a> *
                  </label>
                </div>
                
                <div class="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="creditCheck" 
                    [(ngModel)]="agreeToCreditCheck" 
                    [ngModelOptions]="{standalone: true}"
                  />
                  <label for="creditCheck">
                    I authorize a credit check to be performed for this application *
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="form-navigation">
            <button 
              type="button" 
              (click)="previousStep()" 
              class="btn btn-secondary"
              [disabled]="currentStep === 0"
            >
              ← Previous
            </button>
            
            <div class="step-info">
              Step {{ currentStep + 1 }} of {{ steps.length }}
            </div>
            
            <button 
              *ngIf="currentStep < steps.length - 1"
              type="button" 
              (click)="nextStep()" 
              class="btn btn-primary"
            >
              Next →
            </button>
            
            <button 
              *ngIf="currentStep === steps.length - 1"
              type="submit" 
              class="btn btn-primary btn-large"
              [disabled]="!canSubmit()"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .application-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .application-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .application-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .application-header p {
      font-size: 1.1rem;
      color: #6c757d;
      margin-bottom: 2rem;
    }

    .progress-bar {
      position: relative;
      margin-bottom: 2rem;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #dee2e6;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 3;
    }

    .step.active .step-number {
      background: #3498db;
      color: white;
    }

    .step.completed .step-number {
      background: #27ae60;
      color: white;
    }

    .step-title {
      font-size: 0.875rem;
      color: #6c757d;
      text-align: center;
    }

    .step.active .step-title {
      color: #3498db;
      font-weight: 600;
    }

    .progress-line {
      position: absolute;
      top: 20px;
      left: 0;
      height: 2px;
      background: #3498db;
      transition: width 0.3s ease;
      z-index: 1;
    }

    .application-form-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .step-content {
      padding: 2rem;
      min-height: 500px;
    }

    .step-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .step-header h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .step-header p {
      color: #6c757d;
    }

    .form-section {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-row.full-width {
      grid-template-columns: 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .form-input {
      padding: 0.75rem;
      border: 2px solid #dee2e6;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-input:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-input.error {
      border-color: #e74c3c;
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-prefix {
      position: absolute;
      left: 0.75rem;
      color: #6c757d;
      font-weight: 600;
      z-index: 2;
    }

    .input-with-prefix .form-input {
      padding-left: 2rem;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .down-payment-info {
      color: #3498db;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-weight: 600;
    }

    .subsection {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .subsection h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .loan-summary {
      background: #e3f2fd;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-item .label {
      font-weight: 600;
      color: #1976d2;
    }

    .summary-item .value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1976d2;
    }

    .reference-group {
      padding: 1.5rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .reference-group h4 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .review-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      position: relative;
    }

    .review-card h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .review-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .review-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .review-item .label {
      font-weight: 600;
      color: #6c757d;
    }

    .review-item .value {
      color: #2c3e50;
    }

    .review-item .value.primary {
      color: #3498db;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .review-card .btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 10;
    }

    .terms-section {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 1.5rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .checkbox-group {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .checkbox-group input[type="checkbox"] {
      margin-right: 0.75rem;
      margin-top: 0.25rem;
      transform: scale(1.2);
    }

    .checkbox-group label {
      color: #2c3e50;
      line-height: 1.5;
    }

    .checkbox-group a {
      color: #3498db;
      text-decoration: underline;
    }

    .form-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .step-info {
      color: #6c757d;
      font-weight: 600;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-large {
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-outline {
      background: white;
      border: 2px solid #3498db;
      color: #3498db;
    }

    .btn-outline:hover {
      background-color: #3498db;
      color: white;
    }

    .btn-danger {
      background-color: #e74c3c;
      color: white;
    }

    .btn-link {
      background: none;
      border: none;
      color: #3498db;
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .application-container {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .step-content {
        padding: 1.5rem;
      }

      .form-navigation {
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
      }
      
      .form-navigation button {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }
      
      .step-info {
        text-align: center;
        order: -1;
      }

      .progress-steps {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .step {
        min-width: 120px;
      }

      .review-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class LoanApplicationFormComponent implements OnInit, OnDestroy {
  applicationForm: FormGroup;
  currentStep = 0;
  agreeToTerms = false;
  agreeToCreditCheck = false;
  
  steps = [
    { title: 'Personal Info', required: true },
    { title: 'Employment', required: true },
    { title: 'Financial', required: false },
    { title: 'Loan Details', required: true },
    { title: 'References', required: true },
    { title: 'Review', required: true }
  ];

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private loanService: LoanService,
    private authService: AuthService
  ) {
    this.applicationForm = this.createForm();
  }

  ngOnInit(): void {
    // Check for property data from route params
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        if (params['propertyAddress'] && params['propertyValue']) {
          this.applicationForm.patchValue({
            loanInfo: {
              propertyAddress: params['propertyAddress'],
              propertyValue: +params['propertyValue'],
              downPayment: Math.round(+params['propertyValue'] * 0.2) // Default 20%
            }
          });
        }
      })
    );

    // Auto-save functionality
    this.subscriptions.add(
      this.applicationForm.valueChanges.subscribe(() => {
        this.saveFormProgress();
      })
    );

    // Load any saved progress
    this.loadFormProgress();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        ssn: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required]],
        maritalStatus: ['', [Validators.required]]
      }),
      
      employmentInfo: this.fb.group({
        employmentStatus: ['', [Validators.required]],
        employerName: ['', [Validators.required]],
        jobTitle: ['', [Validators.required]],
        workStartDate: ['', [Validators.required]],
        grossAnnualIncome: ['', [Validators.required, Validators.min(1)]],
        otherIncome: [''],
        otherIncomeSource: ['']
      }),
      
      financialInfo: this.fb.group({
        assets: this.fb.group({
          checkingAccount: [0],
          savingsAccount: [0],
          investmentAccounts: [0],
          retirementAccounts: [0],
          realEstate: [0],
          other: [0]
        }),
        debts: this.fb.group({
          creditCards: [0],
          studentLoans: [0],
          autoLoans: [0],
          otherDebts: [0]
        })
      }),
      
      loanInfo: this.fb.group({
        propertyAddress: ['', [Validators.required]],
        propertyValue: ['', [Validators.required, Validators.min(1)]],
        downPayment: ['', [Validators.required, Validators.min(1)]],
        loanAmount: [''],
        loanPurpose: ['', [Validators.required]],
        propertyType: ['', [Validators.required]],
        occupancyType: ['', [Validators.required]]
      }),
      
      references: this.fb.array([
        this.createReferenceGroup(),
        this.createReferenceGroup()
      ])
    });
  }

  private createReferenceGroup(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      relationship: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['']
    });
  }

  get references(): FormArray {
    return this.applicationForm.get('references') as FormArray;
  }

  addReference(): void {
    this.references.push(this.createReferenceGroup());
  }

  removeReference(index: number): void {
    this.references.removeAt(index);
  }

  nextStep(): void {
    if (this.canProceedToNext()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  private canProceedToNext(): boolean {
    const currentStepGroup = this.getCurrentStepFormGroup();
    if (!currentStepGroup) return true;
    
    if (currentStepGroup.invalid) {
      this.markGroupAsTouched(currentStepGroup);
      this.notificationService.warning(
        'Form Incomplete',
        'Please fill in all required fields before proceeding.'
      );
      return false;
    }
    
    return true;
  }

  private getCurrentStepFormGroup(): FormGroup | null {
    switch (this.currentStep) {
      case 0: return this.applicationForm.get('personalInfo') as FormGroup;
      case 1: return this.applicationForm.get('employmentInfo') as FormGroup;
      case 2: return null; // Financial info is optional
      case 3: return this.applicationForm.get('loanInfo') as FormGroup;
      case 4: 
        const refs = this.applicationForm.get('references') as FormArray;
        if (refs.length < 2) {
          this.notificationService.warning('References Required', 'Please provide at least 2 references.');
          return null;
        }
        return refs.valid ? null : refs as any;
      default: return null;
    }
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.notificationService.error(
        'Cannot Submit',
        'Please review all required fields and agree to terms.'
      );
      return;
    }

    // Check authentication before submitting
    if (!this.authService.isAuthenticated()) {
      this.notificationService.info(
        'Authentication Required',
        'Please log in to submit your application.'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    const formData: LoanApplicationData = this.applicationForm.value;
    formData.loanInfo.loanAmount = this.getCalculatedLoanAmount();

    this.loanService.submitApplication(formData).subscribe({
      next: (response) => {
        this.notificationService.success(
          'Application Submitted',
          'Your loan application has been submitted successfully!'
        );
        
        // Clear saved progress
        localStorage.removeItem('loanApplicationProgress');
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        // Handle authentication errors specifically
        if (error.status === 401) {
          this.notificationService.info(
            'Session Expired',
            'Your session has expired. Please log in again.'
          );
          this.router.navigate(['/auth/login']);
          return;
        }
        
        this.notificationService.error(
          'Submission Failed',
          'Unable to submit your application. Please try again.'
        );
        console.error('Application submission error:', error);
      }
    });
  }

  canSubmit(): boolean {
    return this.applicationForm.valid && 
           this.agreeToTerms && 
           this.agreeToCreditCheck &&
           this.references.length >= 2;
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.applicationForm.get(fieldPath);
    return !!(field && field.invalid && field.touched);
  }

  isReferenceFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.references.at(index)?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private markGroupAsTouched(group: FormGroup | FormArray): void {
    Object.keys(group.controls).forEach(key => {
      const control = group.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markGroupAsTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  getCalculatedLoanAmount(): number {
    const propertyValue = this.applicationForm.get('loanInfo.propertyValue')?.value || 0;
    const downPayment = this.applicationForm.get('loanInfo.downPayment')?.value || 0;
    return Math.max(0, propertyValue - downPayment);
  }

  getDownPaymentPercentage(): number {
    const propertyValue = this.applicationForm.get('loanInfo.propertyValue')?.value || 0;
    const downPayment = this.applicationForm.get('loanInfo.downPayment')?.value || 0;
    if (propertyValue === 0) return 0;
    return Math.round((downPayment / propertyValue) * 100);
  }

  formatCurrency(amount: number): string {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private saveFormProgress(): void {
    const progress = {
      formData: this.applicationForm.value,
      currentStep: this.currentStep,
      agreeToTerms: this.agreeToTerms,
      agreeToCreditCheck: this.agreeToCreditCheck
    };
    localStorage.setItem('loanApplicationProgress', JSON.stringify(progress));
  }

  private loadFormProgress(): void {
    const saved = localStorage.getItem('loanApplicationProgress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        this.applicationForm.patchValue(progress.formData);
        this.currentStep = progress.currentStep || 0;
        this.agreeToTerms = progress.agreeToTerms || false;
        this.agreeToCreditCheck = progress.agreeToCreditCheck || false;
      } catch (error) {
        console.error('Error loading form progress:', error);
      }
    }
  }
}