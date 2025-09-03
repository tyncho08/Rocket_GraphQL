import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ExtraPaymentResult {
  originalLoan: LoanDetails;
  withExtraPayment: LoanDetails;
  savings: PaymentSavings;
  paymentSchedule: PaymentScheduleItem[];
  breakdownAnalysis: BreakdownAnalysis;
  scenarios: PaymentScenario[];
}

interface LoanDetails {
  balance: number;
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  yearsToPayoff: number;
}

interface PaymentSavings {
  interestSaved: number;
  timeSaved: number; // in months
  percentageSaved: number;
  totalSavings: number;
}

interface PaymentScheduleItem {
  paymentNumber: number;
  paymentDate: string;
  regularPayment: number;
  extraPayment: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  cumulativeInterest: number;
}

interface BreakdownAnalysis {
  firstYear: YearlyBreakdown;
  fifthYear: YearlyBreakdown;
  totalBreakdown: TotalBreakdown;
}

interface YearlyBreakdown {
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  extraPaid: number;
  remainingBalance: number;
}

interface TotalBreakdown {
  totalRegularPayments: number;
  totalExtraPayments: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
}

interface PaymentScenario {
  name: string;
  extraPayment: number;
  timeSaved: number;
  interestSaved: number;
  totalSavings: number;
}

@Component({
  selector: 'app-extra-payment-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="extra-payment-container">
      <div class="calculator-header">
        <h1>Extra Payment Calculator</h1>
        <p>See how extra mortgage payments can save you time and money</p>
        <a routerLink="/mortgage-tools" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Back to Mortgage Tools
        </a>
      </div>

      <div class="calculator-content">
        <div class="calculator-form">
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()">
            <!-- Current Loan Details -->
            <div class="form-section">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                Current Mortgage Details
              </h3>
              <div class="form-grid-2x2">
                <div class="form-group">
                  <label for="loanBalance">Current Loan Balance</label>
                  <input 
                    id="loanBalance"
                    type="number" 
                    formControlName="loanBalance"
                    placeholder="350000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="interestRate">Interest Rate (%)</label>
                  <input 
                    id="interestRate"
                    type="number" 
                    step="0.01"
                    formControlName="interestRate"
                    placeholder="6.5"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="remainingYears">Years Remaining</label>
                  <input 
                    id="remainingYears"
                    type="number" 
                    formControlName="remainingYears"
                    placeholder="25"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="monthlyPayment">Current Monthly Payment</label>
                  <input 
                    id="monthlyPayment"
                    type="number" 
                    formControlName="monthlyPayment"
                    placeholder="2200"
                    class="form-input"
                    readonly
                  />
                </div>
              </div>
            </div>

            <!-- Extra Payment Options -->
            <div class="form-section">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Extra Payment Strategy
              </h3>
              <div class="form-grid-strategy">
                <div class="form-group form-group-full">
                  <label for="extraPaymentType">Payment Type</label>
                  <select id="extraPaymentType" formControlName="extraPaymentType" class="form-input">
                    <option value="monthly">Monthly Extra Payment</option>
                    <option value="yearly">Annual Extra Payment</option>
                    <option value="oneTime">One-Time Payment</option>
                  </select>
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'monthly'">
                  <label for="monthlyExtra">Monthly Extra Payment</label>
                  <input 
                    id="monthlyExtra"
                    type="number" 
                    formControlName="monthlyExtra"
                    placeholder="200"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'yearly'">
                  <label for="yearlyExtra">Annual Extra Payment</label>
                  <input 
                    id="yearlyExtra"
                    type="number" 
                    formControlName="yearlyExtra"
                    placeholder="5000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'oneTime'">
                  <label for="oneTimeAmount">One-Time Payment Amount</label>
                  <input 
                    id="oneTimeAmount"
                    type="number" 
                    formControlName="oneTimeAmount"
                    placeholder="10000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group" *ngIf="calculatorForm.value.extraPaymentType === 'oneTime'">
                  <label for="oneTimeMonth">Payment Month (1-12)</label>
                  <input 
                    id="oneTimeMonth"
                    type="number" 
                    min="1"
                    max="12"
                    formControlName="oneTimeMonth"
                    placeholder="12"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="calculatorForm.invalid || calculating"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                  <rect x="9" y="9" width="1" height="1"/>
                  <rect x="14" y="9" width="1" height="1"/>
                  <rect x="9" y="14" width="1" height="1"/>
                  <rect x="14" y="14" width="1" height="1"/>
                </svg>
                {{ calculating ? 'Calculating...' : 'Calculate Savings' }}
              </button>
              <button type="button" (click)="reset()" class="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <path d="M1 4V10H7"/>
                  <path d="M23 20V14H17"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M22.66 14.36A9 9 0 0 1 3.51 15L23 20"/>
                </svg>
                Reset
              </button>
            </div>
          </form>
        </div>

        <!-- Results Section -->
        <div *ngIf="result" class="results-section">
          <!-- Savings Summary -->
          <div class="savings-summary">
            <div class="summary-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Extra Payment Impact
              </h3>
              <div class="recommendation-badge">
                {{ getSavingsRecommendation() }}
              </div>
            </div>
            
            <div class="savings-grid">
              <div class="savings-card highlight">
                <div class="savings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div class="savings-amount">\${{ result.savings.interestSaved | number:'1.0-0' }}</div>
                <div class="savings-label">Interest Saved</div>
              </div>
              
              <div class="savings-card highlight">
                <div class="savings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <div class="savings-amount">{{ Math.floor(result.savings.timeSaved / 12) }} years {{ result.savings.timeSaved % 12 }} months</div>
                <div class="savings-label">Time Saved</div>
              </div>
              
              <div class="savings-card">
                <div class="savings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                </div>
                <div class="savings-amount">{{ result.savings.percentageSaved | number:'1.1-1' }}%</div>
                <div class="savings-label">Percentage Saved</div>
              </div>
              
              <div class="savings-card">
                <div class="savings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div class="savings-amount">{{ result.withExtraPayment.payoffDate }}</div>
                <div class="savings-label">New Payoff Date</div>
              </div>
            </div>
          </div>

          <!-- Comparison Table -->
          <div class="comparison-table">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
              Loan Comparison
            </h3>
            <div class="table-container">
              <table class="loan-comparison">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Without Extra Payments</th>
                    <th>With Extra Payments</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Monthly Payment</td>
                    <td>\${{ result.originalLoan.monthlyPayment | number:'1.0-0' }}</td>
                    <td>\${{ result.originalLoan.monthlyPayment + getAverageExtraPayment() | number:'1.0-0' }}</td>
                    <td class="positive">+\${{ getAverageExtraPayment() | number:'1.0-0' }}</td>
                  </tr>
                  <tr>
                    <td>Total Payments</td>
                    <td>{{ result.originalLoan.totalPayments }}</td>
                    <td>{{ result.withExtraPayment.totalPayments }}</td>
                    <td class="positive">-{{ result.originalLoan.totalPayments - result.withExtraPayment.totalPayments }}</td>
                  </tr>
                  <tr>
                    <td>Total Interest</td>
                    <td>\${{ result.originalLoan.totalInterest | number:'1.0-0' }}</td>
                    <td>\${{ result.withExtraPayment.totalInterest | number:'1.0-0' }}</td>
                    <td class="positive">-\${{ result.savings.interestSaved | number:'1.0-0' }}</td>
                  </tr>
                  <tr>
                    <td>Payoff Date</td>
                    <td>{{ result.originalLoan.payoffDate }}</td>
                    <td>{{ result.withExtraPayment.payoffDate }}</td>
                    <td class="positive">{{ Math.floor(result.savings.timeSaved / 12) }}y {{ result.savings.timeSaved % 12 }}m earlier</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Cost</td>
                    <td>\${{ result.originalLoan.totalCost | number:'1.0-0' }}</td>
                    <td>\${{ result.withExtraPayment.totalCost | number:'1.0-0' }}</td>
                    <td class="positive">-\${{ result.savings.totalSavings | number:'1.0-0' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payment Scenarios -->
          <div class="scenarios-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Payment Scenarios
            </h3>
            <div class="scenarios-grid">
              <div 
                *ngFor="let scenario of result.scenarios" 
                class="scenario-card"
                [class.selected]="isSelectedScenario(scenario)"
              >
                <div class="scenario-header">
                  <h4>{{ scenario.name }}</h4>
                  <div class="scenario-amount">+\${{ scenario.extraPayment | number:'1.0-0' }}/month</div>
                </div>
                <div class="scenario-benefits">
                  <div class="benefit-item">
                    <span class="benefit-label">Interest Saved:</span>
                    <span class="benefit-value">\${{ scenario.interestSaved | number:'1.0-0' }}</span>
                  </div>
                  <div class="benefit-item">
                    <span class="benefit-label">Time Saved:</span>
                    <span class="benefit-value">{{ Math.floor(scenario.timeSaved / 12) }}y {{ scenario.timeSaved % 12 }}m</span>
                  </div>
                  <div class="benefit-item">
                    <span class="benefit-label">Total Savings:</span>
                    <span class="benefit-value highlight">\${{ scenario.totalSavings | number:'1.0-0' }}</span>
                  </div>
                </div>
                <button 
                  (click)="applyScenario(scenario)"
                  class="btn btn-sm btn-outline"
                >
                  Apply Scenario
                </button>
              </div>
            </div>
          </div>

          <!-- Breakdown Analysis -->
          <div class="breakdown-analysis">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Payment Breakdown
            </h3>
            <div class="breakdown-cards">
              <div class="breakdown-card">
                <h4>First Year</h4>
                <div class="breakdown-details">
                  <div class="detail-row">
                    <span>Total Paid:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.totalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Principal Paid:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.principalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Interest Paid:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.interestPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Extra Payments:</span>
                    <span>\${{ result.breakdownAnalysis.firstYear.extraPaid | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="breakdown-card" *ngIf="result.breakdownAnalysis.fifthYear.year <= result.withExtraPayment.yearsToPayoff">
                <h4>Fifth Year</h4>
                <div class="breakdown-details">
                  <div class="detail-row">
                    <span>Total Paid:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.totalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Principal Paid:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.principalPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Interest Paid:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.interestPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Remaining Balance:</span>
                    <span>\${{ result.breakdownAnalysis.fifthYear.remainingBalance | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="breakdown-card total">
                <h4>Total Summary</h4>
                <div class="breakdown-details">
                  <div class="detail-row">
                    <span>Regular Payments:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalRegularPayments | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Extra Payments:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalExtraPayments | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row">
                    <span>Total Interest:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalInterestPaid | number:'1.0-0' }}</span>
                  </div>
                  <div class="detail-row total-row">
                    <span>Grand Total:</span>
                    <span>\${{ result.breakdownAnalysis.totalBreakdown.totalAmountPaid | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="result-actions">
            <button (click)="saveCalculation()" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              Save Calculation
            </button>
            <button (click)="exportResults()" class="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Export Report
            </button>
            <button (click)="shareResults()" class="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share Results
            </button>
            <button (click)="viewPaymentSchedule()" class="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              View Payment Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .extra-payment-container {
      min-height: 100vh;
      background: var(--background-secondary);
      padding: var(--space-lg);
    }

    .calculator-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%);
      padding: var(--space-2xl) var(--space-lg);
      border-radius: var(--radius-lg);
      color: var(--text-white);
    }

    .calculator-header h1 {
      font-size: var(--text-3xl);
      margin-bottom: var(--space-md);
      color: var(--text-white);
      font-weight: 600;
    }

    .calculator-header p {
      font-size: var(--text-lg);
      margin-bottom: var(--space-md);
      opacity: 0.9;
    }

    .back-link {
      color: var(--text-white);
      text-decoration: none;
      padding: var(--space-xs) var(--space-md);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: var(--radius-lg);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      font-size: var(--text-sm);
    }

    .back-link:hover {
      background: rgba(255,255,255,0.2);
      color: var(--text-white);
      text-decoration: none;
      transform: translateY(-1px);
    }

    .calculator-content {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-xl);
    }

    .calculator-form {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: 0 4px 12px var(--shadow-medium);
      border: 1px solid var(--border-light);
    }

    .form-section {
      margin-bottom: var(--space-xl);
      padding: var(--space-lg);
      background: var(--background-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .form-section h3 {
      color: var(--primary-dark);
      margin-bottom: var(--space-md);
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: var(--text-xl);
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-md);
    }

    .form-grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
      align-items: start;
    }

    .form-grid-strategy {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
      align-items: start;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--space-xs);
      font-size: var(--text-sm);
      line-height: 1.4;
    }

    .form-input {
      width: 100%;
      height: var(--height-input);
      padding: 0 var(--space-sm);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-sm);
      font-size: var(--text-base);
      background: var(--background-primary);
      color: var(--text-primary);
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-dark);
      box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
    }

    .form-input[readonly] {
      background: var(--background-tertiary);
      color: var(--text-secondary);
      cursor: not-allowed;
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    .form-actions {
      display: flex;
      gap: var(--space-sm);
      justify-content: center;
      margin-top: var(--space-xl);
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Results Section */
    .results-section {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: 0 4px 12px var(--shadow-medium);
      border: 1px solid var(--border-light);
    }

    .savings-summary {
      margin-bottom: var(--space-xl);
      padding: var(--space-lg);
      background: rgba(56, 161, 105, 0.05);
      border-radius: var(--radius-md);
      border-left: 4px solid var(--accent-success);
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-md);
      flex-wrap: wrap;
      gap: var(--space-sm);
    }

    .summary-header h3 {
      margin: 0;
      color: var(--primary-dark);
      font-size: var(--text-xl);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .recommendation-badge {
      padding: var(--space-xs) var(--space-md);
      background: var(--accent-success);
      color: var(--text-white);
      border-radius: var(--radius-lg);
      font-weight: 600;
      font-size: var(--text-sm);
    }

    .savings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .savings-card {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .savings-card.highlight {
      border: 2px solid #28a745;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
    }

    .savings-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .savings-amount {
      font-size: 1.5rem;
      font-weight: bold;
      color: #28a745;
      margin-bottom: 5px;
      line-height: 1.2;
    }

    .savings-label {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .comparison-table {
      margin-bottom: 30px;
    }

    .comparison-table h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .loan-comparison {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .loan-comparison th {
      background: #667eea;
      color: white;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
    }

    .loan-comparison td {
      padding: 15px 12px;
      border-bottom: 1px solid #e9ecef;
    }

    .loan-comparison tr:hover {
      background: #f8f9fa;
    }

    .loan-comparison .positive {
      color: #28a745;
      font-weight: 600;
    }

    .loan-comparison .total-row {
      background: #f8f9fa;
      font-weight: 600;
    }

    .scenarios-section {
      margin-bottom: 30px;
    }

    .scenarios-section h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .scenario-card {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .scenario-card:hover {
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }

    .scenario-card.selected {
      border-color: #28a745;
      background: #f8fff9;
    }

    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .scenario-header h4 {
      margin: 0;
      color: #333;
    }

    .scenario-amount {
      font-weight: bold;
      color: #667eea;
    }

    .scenario-benefits {
      margin-bottom: 15px;
    }

    .benefit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .benefit-label {
      color: #666;
      font-size: 0.9rem;
    }

    .benefit-value {
      font-weight: 600;
      color: #333;
    }

    .benefit-value.highlight {
      color: #28a745;
      font-size: 1.1rem;
    }

    .breakdown-analysis {
      margin-bottom: 30px;
    }

    .breakdown-analysis h3 {
      color: #333;
      margin-bottom: 20px;
    }

    .breakdown-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--space-lg);
      width: 100%;
      justify-items: center;
      align-items: start;
    }

    .breakdown-card {
      background: var(--background-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: var(--space-xl);
      width: 100%;
      max-width: 400px;
      min-height: 240px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: all 0.2s ease;
    }

    .breakdown-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
    }

    .breakdown-card.total {
      border-color: var(--primary-dark);
      background: rgba(26, 54, 93, 0.03);
    }

    .breakdown-card h4 {
      margin: 0 0 var(--space-lg) 0;
      color: var(--primary-dark);
      font-size: var(--text-xl);
      font-weight: 600;
      text-align: center;
      flex-shrink: 0;
    }

    .breakdown-details {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      flex: 1;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--space-xs) 0;
      font-size: var(--text-sm);
      line-height: 1.5;
      min-height: 24px;
    }
    
    .detail-row span:first-child {
      color: var(--text-secondary);
      font-weight: 500;
      flex: 1;
      margin-right: var(--space-sm);
    }
    
    .detail-row span:last-child {
      color: var(--text-primary);
      font-weight: 600;
      text-align: right;
      flex-shrink: 0;
    }

    .detail-row.total-row {
      border-top: 2px solid var(--border-medium);
      margin-top: var(--space-md);
      padding-top: var(--space-md);
      font-size: var(--text-base);
    }
    
    .detail-row.total-row span {
      color: var(--primary-dark) !important;
      font-weight: 700 !important;
    }

    .result-actions {
      display: flex;
      gap: var(--space-sm);
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-top: var(--space-xl);
      padding: var(--space-lg);
    }

    /* Math functions available in template */
    .savings-amount {
      /* Math functions will be accessible */
    }

    /* Enhanced Responsive Design */
    @media (max-width: 768px) {
      .extra-payment-container {
        padding: var(--space-sm);
      }

      .calculator-header {
        padding: var(--space-lg);
      }

      .calculator-header h1 {
        font-size: var(--text-2xl);
      }

      .form-grid,
      .form-grid-2x2,
      .form-grid-strategy {
        grid-template-columns: 1fr;
        gap: var(--space-sm);
      }
      
      .form-group-full {
        grid-column: 1;
      }

      .savings-grid {
        grid-template-columns: 1fr;
        gap: var(--space-sm);
      }

      .savings-card {
        max-width: none;
        width: 100%;
      }

      .scenarios-grid {
        grid-template-columns: 1fr;
        gap: var(--space-sm);
      }

      .scenario-card {
        max-width: none;
        width: 100%;
      }

      .breakdown-cards {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .breakdown-card {
        max-width: none;
        width: 100%;
        min-height: auto;
        padding: var(--space-lg);
      }

      .result-actions {
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
      }

      .result-actions .btn {
        width: 100%;
        max-width: 300px;
      }

      .summary-header {
        flex-direction: column;
        gap: var(--space-sm);
        text-align: center;
        align-items: center;
      }

      .loan-comparison {
        font-size: var(--text-xs);
      }

      .loan-comparison th,
      .loan-comparison td {
        padding: var(--space-xs);
      }
    }

    @media (max-width: 480px) {
      .calculator-header h1 {
        font-size: var(--text-xl);
      }

      .calculator-form,
      .results-section {
        padding: var(--space-md);
      }

      .form-section {
        padding: var(--space-sm);
      }

      .savings-card,
      .scenario-card,
      .breakdown-card {
        padding: var(--space-sm);
      }
    }
  `]
})
export class ExtraPaymentCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  result: ExtraPaymentResult | null = null;
  calculating = false;
  
  // Expose Math to template
  Math = Math;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      loanBalance: [350000, [Validators.required, Validators.min(1000)]],
      interestRate: [6.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      remainingYears: [25, [Validators.required, Validators.min(1), Validators.max(50)]],
      monthlyPayment: [{ value: 0, disabled: true }],
      extraPaymentType: ['monthly', [Validators.required]],
      monthlyExtra: [200, [Validators.min(0)]],
      yearlyExtra: [5000, [Validators.min(0)]],
      oneTimeAmount: [10000, [Validators.min(0)]],
      oneTimeMonth: [12, [Validators.min(1), Validators.max(12)]]
    });
  }

  ngOnInit() {
    // Calculate monthly payment when loan details change
    this.calculatorForm.get('loanBalance')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
    this.calculatorForm.get('interestRate')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
    this.calculatorForm.get('remainingYears')?.valueChanges.subscribe(() => this.updateMonthlyPayment());
    
    // Initial calculation
    this.updateMonthlyPayment();
    
    // Auto-calculate when form changes
    this.calculatorForm.valueChanges.subscribe(() => {
      if (this.calculatorForm.valid) {
        setTimeout(() => this.calculate(), 500); // Debounce
      }
    });
  }

  private updateMonthlyPayment() {
    const balance = this.calculatorForm.get('loanBalance')?.value;
    const rate = this.calculatorForm.get('interestRate')?.value;
    const years = this.calculatorForm.get('remainingYears')?.value;
    
    if (balance && rate && years) {
      const monthlyRate = rate / 100 / 12;
      const numberOfPayments = years * 12;
      
      const monthlyPayment = balance * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      this.calculatorForm.get('monthlyPayment')?.setValue(Math.round(monthlyPayment * 100) / 100);
    }
  }

  calculate() {
    if (this.calculatorForm.invalid) return;

    this.calculating = true;
    
    // Simulate calculation delay
    setTimeout(() => {
      const formData = this.calculatorForm.value;
      this.result = this.performCalculation(formData);
      this.calculating = false;
    }, 1000);
  }

  private performCalculation(data: any): ExtraPaymentResult {
    const originalLoan = this.calculateOriginalLoan(data);
    const withExtraPayment = this.calculateLoanWithExtraPayments(data);
    const savings = this.calculateSavings(originalLoan, withExtraPayment);
    const paymentSchedule = this.generatePaymentSchedule(data);
    const breakdownAnalysis = this.calculateBreakdownAnalysis(paymentSchedule);
    const scenarios = this.generateScenarios(data);

    return {
      originalLoan,
      withExtraPayment,
      savings,
      paymentSchedule,
      breakdownAnalysis,
      scenarios
    };
  }

  private calculateOriginalLoan(data: any): LoanDetails {
    const balance = data.loanBalance;
    const rate = data.interestRate / 100 / 12;
    const years = data.remainingYears;
    const numberOfPayments = years * 12;
    
    const monthlyPayment = balance * (rate * Math.pow(1 + rate, numberOfPayments)) / 
                          (Math.pow(1 + rate, numberOfPayments) - 1);
    
    const totalCost = monthlyPayment * numberOfPayments;
    const totalInterest = totalCost - balance;
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);

    return {
      balance,
      monthlyPayment,
      totalPayments: numberOfPayments,
      totalInterest,
      totalCost,
      payoffDate: payoffDate.toLocaleDateString(),
      yearsToPayoff: years
    };
  }

  private calculateLoanWithExtraPayments(data: any): LoanDetails {
    let balance = data.loanBalance;
    const rate = data.interestRate / 100 / 12;
    const regularPayment = this.calculatorForm.get('monthlyPayment')?.value;
    
    let totalInterest = 0;
    let totalRegularPayments = 0;
    let totalExtraPayments = 0;
    let paymentCount = 0;
    const maxPayments = data.remainingYears * 12;

    while (balance > 0 && paymentCount < maxPayments) {
      paymentCount++;
      const interestPayment = balance * rate;
      const principalPayment = Math.min(regularPayment - interestPayment, balance);
      
      // Calculate extra payment
      let extraPayment = 0;
      if (data.extraPaymentType === 'monthly') {
        extraPayment = data.monthlyExtra || 0;
      } else if (data.extraPaymentType === 'yearly' && paymentCount % 12 === 0) {
        extraPayment = data.yearlyExtra || 0;
      } else if (data.extraPaymentType === 'oneTime' && paymentCount === data.oneTimeMonth) {
        extraPayment = data.oneTimeAmount || 0;
      }
      
      // Apply extra payment to principal
      extraPayment = Math.min(extraPayment, balance - principalPayment);
      
      totalInterest += interestPayment;
      totalRegularPayments += regularPayment;
      totalExtraPayments += extraPayment;
      
      balance -= (principalPayment + extraPayment);
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + paymentCount);

    return {
      balance: 0,
      monthlyPayment: regularPayment,
      totalPayments: paymentCount,
      totalInterest,
      totalCost: totalRegularPayments + totalExtraPayments,
      payoffDate: payoffDate.toLocaleDateString(),
      yearsToPayoff: Math.round(paymentCount / 12 * 10) / 10
    };
  }

  private calculateSavings(originalLoan: LoanDetails, withExtraLoan: LoanDetails): PaymentSavings {
    const interestSaved = originalLoan.totalInterest - withExtraLoan.totalInterest;
    const timeSaved = originalLoan.totalPayments - withExtraLoan.totalPayments;
    const totalSavings = originalLoan.totalCost - withExtraLoan.totalCost;
    const percentageSaved = (interestSaved / originalLoan.totalInterest) * 100;

    return {
      interestSaved,
      timeSaved,
      percentageSaved,
      totalSavings
    };
  }

  private generatePaymentSchedule(data: any): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];
    let balance = data.loanBalance;
    const rate = data.interestRate / 100 / 12;
    const regularPayment = this.calculatorForm.get('monthlyPayment')?.value;
    
    let paymentCount = 0;
    let cumulativeInterest = 0;
    const maxPayments = data.remainingYears * 12;

    while (balance > 0.01 && paymentCount < maxPayments && paymentCount < 60) { // Limit to 5 years for display
      paymentCount++;
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() + paymentCount);
      
      const interestPaid = balance * rate;
      const principalPaid = Math.min(regularPayment - interestPaid, balance);
      
      // Calculate extra payment
      let extraPayment = 0;
      if (data.extraPaymentType === 'monthly') {
        extraPayment = data.monthlyExtra || 0;
      } else if (data.extraPaymentType === 'yearly' && paymentCount % 12 === 0) {
        extraPayment = data.yearlyExtra || 0;
      } else if (data.extraPaymentType === 'oneTime' && paymentCount === data.oneTimeMonth) {
        extraPayment = data.oneTimeAmount || 0;
      }
      
      extraPayment = Math.min(extraPayment, balance - principalPaid);
      
      cumulativeInterest += interestPaid;
      balance -= (principalPaid + extraPayment);

      schedule.push({
        paymentNumber: paymentCount,
        paymentDate: paymentDate.toLocaleDateString(),
        regularPayment,
        extraPayment,
        totalPayment: regularPayment + extraPayment,
        principalPaid: principalPaid + extraPayment,
        interestPaid,
        remainingBalance: Math.max(0, balance),
        cumulativeInterest
      });
    }

    return schedule;
  }

  private calculateBreakdownAnalysis(paymentSchedule: PaymentScheduleItem[]): BreakdownAnalysis {
    const firstYear = this.calculateYearlyBreakdown(paymentSchedule, 1);
    const fifthYear = this.calculateYearlyBreakdown(paymentSchedule, 5);
    
    const totalRegularPayments = paymentSchedule.reduce((sum, payment) => sum + payment.regularPayment, 0);
    const totalExtraPayments = paymentSchedule.reduce((sum, payment) => sum + payment.extraPayment, 0);
    const totalInterestPaid = paymentSchedule.reduce((sum, payment) => sum + payment.interestPaid, 0);
    
    const totalBreakdown: TotalBreakdown = {
      totalRegularPayments,
      totalExtraPayments,
      totalInterestPaid,
      totalAmountPaid: totalRegularPayments + totalExtraPayments
    };

    return {
      firstYear,
      fifthYear,
      totalBreakdown
    };
  }

  private calculateYearlyBreakdown(paymentSchedule: PaymentScheduleItem[], year: number): YearlyBreakdown {
    const startPayment = (year - 1) * 12 + 1;
    const endPayment = year * 12;
    
    const yearPayments = paymentSchedule.filter(p => 
      p.paymentNumber >= startPayment && p.paymentNumber <= endPayment
    );

    const totalPaid = yearPayments.reduce((sum, payment) => sum + payment.totalPayment, 0);
    const principalPaid = yearPayments.reduce((sum, payment) => sum + payment.principalPaid, 0);
    const interestPaid = yearPayments.reduce((sum, payment) => sum + payment.interestPaid, 0);
    const extraPaid = yearPayments.reduce((sum, payment) => sum + payment.extraPayment, 0);
    const remainingBalance = yearPayments.length > 0 ? yearPayments[yearPayments.length - 1].remainingBalance : 0;

    return {
      year,
      totalPaid,
      principalPaid,
      interestPaid,
      extraPaid,
      remainingBalance
    };
  }

  private generateScenarios(data: any): PaymentScenario[] {
    const scenarios: PaymentScenario[] = [];
    const extraAmounts = [50, 100, 200, 500];
    
    for (const extra of extraAmounts) {
      const scenarioData = { ...data, extraPaymentType: 'monthly', monthlyExtra: extra };
      const originalLoan = this.calculateOriginalLoan(data);
      const withExtra = this.calculateLoanWithExtraPayments(scenarioData);
      const savings = this.calculateSavings(originalLoan, withExtra);
      
      scenarios.push({
        name: `$${extra} Monthly`,
        extraPayment: extra,
        timeSaved: savings.timeSaved,
        interestSaved: savings.interestSaved,
        totalSavings: savings.totalSavings
      });
    }

    return scenarios;
  }

  getSavingsRecommendation(): string {
    if (!this.result) return '';
    
    const savings = this.result.savings;
    if (savings.interestSaved > 50000) {
      return '🌟 Excellent Strategy';
    } else if (savings.interestSaved > 20000) {
      return '👍 Good Strategy';
    } else if (savings.interestSaved > 5000) {
      return '✅ Beneficial';
    } else {
      return '💡 Modest Impact';
    }
  }

  getAverageExtraPayment(): number {
    if (!this.result) return 0;
    
    const form = this.calculatorForm.value;
    if (form.extraPaymentType === 'monthly') {
      return form.monthlyExtra || 0;
    } else if (form.extraPaymentType === 'yearly') {
      return (form.yearlyExtra || 0) / 12;
    } else {
      return (form.oneTimeAmount || 0) / this.result.withExtraPayment.totalPayments;
    }
  }

  isSelectedScenario(scenario: PaymentScenario): boolean {
    const currentExtra = this.getAverageExtraPayment();
    return Math.abs(scenario.extraPayment - currentExtra) < 1;
  }

  applyScenario(scenario: PaymentScenario) {
    this.calculatorForm.patchValue({
      extraPaymentType: 'monthly',
      monthlyExtra: scenario.extraPayment
    });
    this.calculate();
  }

  reset() {
    this.calculatorForm.reset({
      loanBalance: 350000,
      interestRate: 6.5,
      remainingYears: 25,
      extraPaymentType: 'monthly',
      monthlyExtra: 200,
      yearlyExtra: 5000,
      oneTimeAmount: 10000,
      oneTimeMonth: 12
    });
    this.result = null;
    this.updateMonthlyPayment();
  }

  saveCalculation() {
    if (this.result) {
      const calculationData = {
        ...this.calculatorForm.value,
        result: this.result,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`extra-payment-calc-${Date.now()}`, JSON.stringify(calculationData));
      // Show success message
    }
  }

  exportResults() {
    if (this.result) {
      const data = {
        calculation: this.calculatorForm.value,
        results: this.result,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extra-payment-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  shareResults() {
    if (this.result && navigator.share) {
      navigator.share({
        title: 'Extra Payment Calculator Results',
        text: `Making extra payments could save me $${Math.round(this.result.savings.interestSaved)} in interest and ${Math.floor(this.result.savings.timeSaved / 12)} years off my mortgage.`,
        url: window.location.href
      }).catch(console.error);
    }
  }

  viewPaymentSchedule() {
    if (this.result) {
      // Create a simple table view of the payment schedule
      console.table(this.result.paymentSchedule);
      // In a real app, this would open a detailed modal or navigate to a schedule page
    }
  }
}