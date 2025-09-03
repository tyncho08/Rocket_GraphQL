import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface RefinanceResult {
  currentLoan: LoanDetails;
  newLoan: LoanDetails;
  savings: SavingsAnalysis;
  breakEvenAnalysis: BreakEvenAnalysis;
  recommendation: string;
}

interface LoanDetails {
  balance: number;
  monthlyPayment: number;
  interestRate: number;
  remainingTerm: number;
  totalInterest: number;
  totalCost: number;
}

interface SavingsAnalysis {
  monthlyPaymentSavings: number;
  totalInterestSavings: number;
  lifetimeSavings: number;
  percentageSavings: number;
}

interface BreakEvenAnalysis {
  closingCosts: number;
  breakEvenMonths: number;
  breakEvenPoint: string;
  worthRefinancing: boolean;
}

@Component({
  selector: 'app-refinance-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="refinance-calculator-container">
      <div class="calculator-header">
        <h1>Refinancing Calculator</h1>
        <p>See if refinancing your mortgage could save you money</p>
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
          <h2>Current Loan Details</h2>
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()">
            <div class="form-section">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
                  <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
                </svg>
                Current Mortgage
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="currentBalance">Current Loan Balance</label>
                  <input 
                    id="currentBalance"
                    type="number" 
                    formControlName="currentBalance"
                    placeholder="250000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="currentRate">Current Interest Rate (%)</label>
                  <input 
                    id="currentRate"
                    type="number" 
                    step="0.01"
                    formControlName="currentRate"
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
                  <label for="currentPayment">Current Monthly Payment</label>
                  <input 
                    id="currentPayment"
                    type="number" 
                    formControlName="currentPayment"
                    placeholder="1650"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                New Loan Options
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="newRate">New Interest Rate (%)</label>
                  <input 
                    id="newRate"
                    type="number" 
                    step="0.01"
                    formControlName="newRate"
                    placeholder="5.5"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="newTerm">New Loan Term (years)</label>
                  <select id="newTerm" formControlName="newTerm" class="form-input">
                    <option value="15">15 years</option>
                    <option value="20">20 years</option>
                    <option value="25">25 years</option>
                    <option value="30">30 years</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="closingCosts">Estimated Closing Costs</label>
                  <input 
                    id="closingCosts"
                    type="number" 
                    formControlName="closingCosts"
                    placeholder="5000"
                    class="form-input"
                  />
                </div>
                
                <div class="form-group">
                  <label for="cashOut">Cash-Out Amount (optional)</label>
                  <input 
                    id="cashOut"
                    type="number" 
                    formControlName="cashOut"
                    placeholder="0"
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
                {{ calculating ? 'Calculating...' : 'Calculate Refinance Savings' }}
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
        <div *ngIf="result" class="section-content">
          <!-- Savings Summary -->
          <div class="savings-card" [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive-savings' : 'negative-savings'">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Refinancing Analysis
              </h2>
              <div class="recommendation-badge" [class]="result.breakEvenAnalysis.worthRefinancing ? 'recommend-yes' : 'recommend-no'">
                <svg *ngIf="result.breakEvenAnalysis.worthRefinancing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <svg *ngIf="!result.breakEvenAnalysis.worthRefinancing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <path d="M18 6L6 18"/>
                  <path d="M6 6l12 12"/>
                </svg>
                {{ result.breakEvenAnalysis.worthRefinancing ? 'Recommended' : 'Not Recommended' }}
              </div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div class="stat-value" [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive' : 'negative'">
                  {{ result.savings.monthlyPaymentSavings > 0 ? '+' : '' }}\${{ Math.abs(result.savings.monthlyPaymentSavings) | number:'1.0-0' }}
                </div>
                <div class="stat-label">Monthly Payment Change</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div class="stat-value" [class]="result.savings.totalInterestSavings > 0 ? 'positive' : 'negative'">
                  {{ result.savings.totalInterestSavings > 0 ? '+' : '' }}\${{ Math.abs(result.savings.totalInterestSavings) | number:'1.0-0' }}
                </div>
                <div class="stat-label">Interest Savings</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <div class="stat-value">{{ result.breakEvenAnalysis.breakEvenMonths }} months</div>
                <div class="stat-label">Break-Even Point</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div class="stat-value positive">{{ result.savings.percentageSavings | number:'1.1-1' }}%</div>
                <div class="stat-label">Total Savings Rate</div>
              </div>
            </div>
          </div>

          <!-- Detailed Comparison -->
          <div class="section-content">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Loan Comparison
              </h2>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Current Loan</th>
                    <th>New Loan</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Interest Rate</td>
                    <td>{{ result.currentLoan.interestRate }}%</td>
                    <td>{{ result.newLoan.interestRate }}%</td>
                    <td [class]="result.newLoan.interestRate < result.currentLoan.interestRate ? 'positive' : 'negative'">
                      {{ (result.newLoan.interestRate - result.currentLoan.interestRate) | number:'1.2-2' }}%
                    </td>
                  </tr>
                  <tr>
                    <td>Monthly Payment</td>
                    <td>\${{ result.currentLoan.monthlyPayment | number:'1.0-0' }}</td>
                    <td>\${{ result.newLoan.monthlyPayment | number:'1.0-0' }}</td>
                    <td [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive' : 'negative'">
                      {{ result.savings.monthlyPaymentSavings > 0 ? '-' : '+' }}\${{ Math.abs(result.savings.monthlyPaymentSavings) | number:'1.0-0' }}
                    </td>
                  </tr>
                  <tr>
                    <td>Remaining Term</td>
                    <td>{{ result.currentLoan.remainingTerm }} years</td>
                    <td>{{ result.newLoan.remainingTerm }} years</td>
                    <td>{{ (result.newLoan.remainingTerm - result.currentLoan.remainingTerm) | number:'1.0-0' }} years</td>
                  </tr>
                  <tr>
                    <td>Total Interest</td>
                    <td>\${{ result.currentLoan.totalInterest | number:'1.0-0' }}</td>
                    <td>\${{ result.newLoan.totalInterest | number:'1.0-0' }}</td>
                    <td [class]="result.savings.totalInterestSavings > 0 ? 'positive' : 'negative'">
                      {{ result.savings.totalInterestSavings > 0 ? '-' : '+' }}\${{ Math.abs(result.savings.totalInterestSavings) | number:'1.0-0' }}
                    </td>
                  </tr>
                  <tr>
                    <td>Total Cost</td>
                    <td>\${{ result.currentLoan.totalCost | number:'1.0-0' }}</td>
                    <td>\${{ result.newLoan.totalCost + result.breakEvenAnalysis.closingCosts | number:'1.0-0' }}</td>
                    <td [class]="result.savings.lifetimeSavings > 0 ? 'positive' : 'negative'">
                      {{ result.savings.lifetimeSavings > 0 ? '-' : '+' }}\${{ Math.abs(result.savings.lifetimeSavings) | number:'1.0-0' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Break-Even Analysis -->
          <div class="section-content">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M9 12L11 14L22 3"/>
                  <path d="M21 12V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V12"/>
                  <path d="M16 6L18.5 3.5L16 1"/>
                  <path d="M8 6L5.5 3.5L8 1"/>
                </svg>
                Break-Even Analysis
              </h2>
            </div>
            <div class="breakeven-layout">
              <div class="breakeven-chart">
                <div class="breakeven-visual">
                  <div class="chart-bar" 
                       [style.height.%]="(result.breakEvenAnalysis.breakEvenMonths / 60) * 100">
                  </div>
                  <div class="chart-label">{{ result.breakEvenAnalysis.breakEvenPoint }}</div>
                </div>
              </div>
              
              <div class="breakeven-details">
                <div class="detail-item">
                  <span class="detail-label">Closing Costs:</span>
                  <span class="detail-value">\${{ result.breakEvenAnalysis.closingCosts | number:'1.0-0' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Monthly Savings:</span>
                  <span class="detail-value" [class]="result.savings.monthlyPaymentSavings > 0 ? 'positive' : 'negative'">
                    \${{ Math.abs(result.savings.monthlyPaymentSavings) | number:'1.0-0' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Break-Even Time:</span>
                  <span class="detail-value">{{ result.breakEvenAnalysis.breakEvenMonths }} months</span>
                </div>
                <div class="detail-item recommendation-detail">
                  <span class="detail-label">Final Recommendation:</span>
                  <span class="detail-value">
                    <div *ngIf="result.breakEvenAnalysis.worthRefinancing" class="recommend-yes">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                      Refinance
                    </div>
                    <div *ngIf="!result.breakEvenAnalysis.worthRefinancing" class="recommend-no">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                        <path d="M18 6L6 18"/>
                        <path d="M6 6l12 12"/>
                      </svg>
                      Do Not Refinance
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="button-group-center">
            <button (click)="saveCalculation()" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              Save Calculation
            </button>
            <button (click)="exportResults()" class="btn btn-outline">
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
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .refinance-calculator-container {
      min-height: 100vh;
      background: var(--background-secondary);
      padding: var(--space-lg);
      max-width: 1400px;
      margin: 0 auto;
    }

    .calculator-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
      padding: var(--space-xl);
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .calculator-header h1 {
      font-size: var(--text-3xl);
      color: var(--primary-dark);
      margin-bottom: var(--space-sm);
      font-weight: 700;
    }

    .calculator-header p {
      font-size: var(--text-lg);
      color: var(--text-secondary);
      margin-bottom: var(--space-lg);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      color: var(--primary-dark);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .back-link:hover {
      color: var(--primary-medium);
      transform: translateX(-2px);
    }

    .page-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }

    .page-header h1 {
      font-size: var(--text-3xl);
      margin-bottom: var(--space-md);
      color: var(--primary-dark);
      font-weight: 700;
    }

    .page-header p {
      font-size: var(--text-lg);
      margin-bottom: var(--space-lg);
      color: var(--text-secondary);
    }

    .calculator-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-xl);
    }

    .calculator-form {
      background: var(--background-primary);
      padding: var(--space-xl);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .calculator-form h2 {
      text-align: center;
      color: var(--primary-dark);
      font-size: var(--text-2xl);
      margin-bottom: var(--space-xl);
      font-weight: 600;
    }

    .form-section {
      margin-bottom: var(--space-xl);
    }

    .form-section h3 {
      color: var(--primary-dark);
      font-size: var(--text-xl);
      font-weight: 600;
      margin-bottom: var(--space-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-lg);
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: var(--space-md);
      margin-top: var(--space-xl);
      flex-wrap: wrap;
    }

    /* Component specific styles */
    .savings-card {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
      padding: var(--space-xl);
      margin-bottom: var(--space-xl);
      border-left: 4px solid;
    }

    .savings-card.positive-savings {
      border-left-color: var(--accent-success);
      background: linear-gradient(135deg, rgba(56, 161, 105, 0.05) 0%, var(--background-primary) 100%);
    }

    .savings-card.negative-savings {
      border-left-color: var(--accent-danger);
      background: linear-gradient(135deg, rgba(229, 62, 62, 0.05) 0%, var(--background-primary) 100%);
    }

    .recommendation-badge {
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-xl);
      font-weight: 600;
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .recommend-yes {
      background: var(--accent-success);
      color: var(--text-white);
    }

    .recommend-no {
      background: var(--accent-danger);
      color: var(--text-white);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: var(--space-sm);
      display: flex;
      justify-content: center;
    }

    .stat-value {
      font-size: var(--text-2xl);
      font-weight: 700;
      margin-bottom: var(--space-xs);
    }

    .stat-value.positive {
      color: var(--accent-success);
    }

    .stat-value.negative {
      color: var(--accent-danger);
    }

    .stat-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .breakeven-layout {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-xl);
      align-items: center;
    }

    .breakeven-chart {
      text-align: center;
      padding: var(--space-lg);
      background: var(--background-tertiary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
    }

    .breakeven-visual {
      position: relative;
      height: 150px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: var(--space-lg);
    }

    .chart-bar {
      width: 60px;
      background: linear-gradient(0deg, var(--primary-dark) 0%, var(--primary-medium) 100%);
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      min-height: 20px;
    }

    .chart-label {
      position: absolute;
      bottom: 5px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .breakeven-details {
      display: grid;
      gap: var(--space-md);
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border-light);
    }

    .detail-item.recommendation-detail {
      border-bottom: none;
      padding-top: var(--space-lg);
      border-top: 2px solid var(--border-light);
    }

    .detail-label {
      font-weight: 500;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .detail-value {
      font-weight: 600;
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .detail-value.positive {
      color: var(--accent-success);
    }

    .detail-value.negative {
      color: var(--accent-danger);
    }

    .positive {
      color: var(--accent-success) !important;
    }

    .negative {
      color: var(--accent-danger) !important;
    }

    /* Enhanced Grid and Layout Styles */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-lg);
      margin-top: var(--space-lg);
    }

    .stat-card {
      background: var(--background-tertiary);
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      text-align: center;
      border: 1px solid var(--border-light);
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .recommendation-badge {
      display: inline-flex;
      align-items: center;
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .recommendation-badge.recommend-yes {
      background: rgba(56, 161, 105, 0.1);
      color: var(--accent-success);
      border: 1px solid var(--accent-success);
    }

    .recommendation-badge.recommend-no {
      background: rgba(229, 62, 62, 0.1);
      color: var(--accent-danger);
      border: 1px solid var(--accent-danger);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .refinance-calculator-container {
        padding: var(--space-sm);
      }

      .page-header h1 {
        font-size: var(--text-2xl);
      }

      .breakeven-layout {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }

      .section-header {
        flex-direction: column;
        gap: var(--space-md);
        align-items: center;
      }
    }

    @media (max-width: 480px) {
      .refinance-calculator-container {
        padding: var(--space-xs);
      }
      
      .page-header h1 {
        font-size: var(--text-xl);
      }
      
      .savings-card {
        padding: var(--space-md);
      }
    }
  `]
})
export class RefinanceCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  result: RefinanceResult | null = null;
  calculating = false;
  
  // Expose Math to template
  Math = Math;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      currentBalance: [250000, [Validators.required, Validators.min(1000)]],
      currentRate: [6.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      remainingYears: [25, [Validators.required, Validators.min(1), Validators.max(50)]],
      currentPayment: [1650, [Validators.required, Validators.min(100)]],
      newRate: [5.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      newTerm: [30, [Validators.required]],
      closingCosts: [5000, [Validators.required, Validators.min(0)]],
      cashOut: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    // Auto-calculate when form changes
    this.calculatorForm.valueChanges.subscribe(() => {
      if (this.calculatorForm.valid) {
        setTimeout(() => this.calculate(), 500); // Debounce
      }
    });
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

  private performCalculation(data: any): RefinanceResult {
    const currentLoan = this.calculateLoanDetails(
      data.currentBalance,
      data.currentRate,
      data.remainingYears
    );

    const newLoan = this.calculateLoanDetails(
      data.currentBalance + data.cashOut,
      data.newRate,
      data.newTerm
    );

    const savings = this.calculateSavings(currentLoan, newLoan, data.closingCosts);
    const breakEvenAnalysis = this.calculateBreakEven(savings, data.closingCosts);
    const recommendation = this.generateRecommendation(breakEvenAnalysis, savings);

    return {
      currentLoan,
      newLoan,
      savings,
      breakEvenAnalysis,
      recommendation
    };
  }

  private calculateLoanDetails(balance: number, rate: number, term: number): LoanDetails {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term * 12;
    
    const monthlyPayment = balance * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalCost = monthlyPayment * numberOfPayments;
    const totalInterest = totalCost - balance;

    return {
      balance,
      monthlyPayment,
      interestRate: rate,
      remainingTerm: term,
      totalInterest,
      totalCost
    };
  }

  private calculateSavings(currentLoan: LoanDetails, newLoan: LoanDetails, closingCosts: number): SavingsAnalysis {
    const monthlyPaymentSavings = currentLoan.monthlyPayment - newLoan.monthlyPayment;
    const totalInterestSavings = currentLoan.totalInterest - newLoan.totalInterest;
    const lifetimeSavings = totalInterestSavings - closingCosts;
    const percentageSavings = (lifetimeSavings / currentLoan.totalCost) * 100;

    return {
      monthlyPaymentSavings,
      totalInterestSavings,
      lifetimeSavings,
      percentageSavings
    };
  }

  private calculateBreakEven(savings: SavingsAnalysis, closingCosts: number): BreakEvenAnalysis {
    const breakEvenMonths = savings.monthlyPaymentSavings > 0 ? 
                           Math.ceil(closingCosts / savings.monthlyPaymentSavings) : 
                           999;

    const breakEvenPoint = breakEvenMonths < 999 ? 
                          `${Math.floor(breakEvenMonths / 12)} years, ${breakEvenMonths % 12} months` :
                          'Never';

    const worthRefinancing = breakEvenMonths <= 60 && savings.lifetimeSavings > 0; // 5 years or less

    return {
      closingCosts,
      breakEvenMonths,
      breakEvenPoint,
      worthRefinancing
    };
  }

  private generateRecommendation(breakEven: BreakEvenAnalysis, savings: SavingsAnalysis): string {
    if (breakEven.worthRefinancing) {
      return `✅ We recommend refinancing. You'll save $${Math.abs(savings.monthlyPaymentSavings).toLocaleString()} monthly and break even in ${breakEven.breakEvenMonths} months.`;
    } else if (breakEven.breakEvenMonths > 60) {
      return `❌ We don't recommend refinancing. Break-even period is too long (${breakEven.breakEvenMonths} months).`;
    } else {
      return `⚠️ Refinancing may not be beneficial. Consider your long-term plans and break-even period of ${breakEven.breakEvenMonths} months.`;
    }
  }

  reset() {
    this.calculatorForm.reset({
      currentBalance: 250000,
      currentRate: 6.5,
      remainingYears: 25,
      currentPayment: 1650,
      newRate: 5.5,
      newTerm: 30,
      closingCosts: 5000,
      cashOut: 0
    });
    this.result = null;
  }

  saveCalculation() {
    if (this.result) {
      // Save to localStorage or send to backend
      const calculationData = {
        ...this.calculatorForm.value,
        result: this.result,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`refinance-calc-${Date.now()}`, JSON.stringify(calculationData));
      // Show success message
    }
  }

  exportResults() {
    if (this.result) {
      // Create CSV or PDF export
      const data = {
        calculation: this.calculatorForm.value,
        results: this.result,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `refinance-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  shareResults() {
    if (this.result && navigator.share) {
      navigator.share({
        title: 'Refinancing Analysis Results',
        text: `My refinancing analysis shows ${this.result.savings.monthlyPaymentSavings > 0 ? 'savings' : 'costs'} of $${Math.abs(this.result.savings.monthlyPaymentSavings)} per month.`,
        url: window.location.href
      }).catch(console.error);
    }
  }
}