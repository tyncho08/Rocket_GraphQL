import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

interface RentVsBuyResult {
  buying: BuyingAnalysis;
  renting: RentingAnalysis;
  comparison: ComparisonAnalysis;
  breakEvenPoint: number;
  recommendation: RecommendationResult;
  yearlyComparison: YearlyData[];
}

interface BuyingAnalysis {
  monthlyPayment: number;
  totalMonthlyCost: number;
  downPayment: number;
  closingCosts: number;
  initialCashOutlay: number;
  yearlyAppreciation: number;
  equityBuilt: number;
  totalCost5Years: number;
  totalCost10Years: number;
  netWorth5Years: number;
  netWorth10Years: number;
}

interface RentingAnalysis {
  monthlyRent: number;
  totalMonthlyCost: number;
  initialDeposit: number;
  yearlyRentIncrease: number;
  totalCost5Years: number;
  totalCost10Years: number;
  investmentGrowth5Years: number;
  investmentGrowth10Years: number;
  netWorth5Years: number;
  netWorth10Years: number;
}

interface ComparisonAnalysis {
  monthlyDifference: number;
  cashOutlayDifference: number;
  fiveYearAdvantage: 'buy' | 'rent' | 'neutral';
  tenYearAdvantage: 'buy' | 'rent' | 'neutral';
  fiveYearSavings: number;
  tenYearSavings: number;
}

interface RecommendationResult {
  decision: 'buy' | 'rent' | 'neutral';
  confidence: number;
  primaryReason: string;
  considerations: string[];
}

interface YearlyData {
  year: number;
  buyingCumulativeCost: number;
  rentingCumulativeCost: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
}

@Component({
  selector: 'app-rent-vs-buy-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="rent-vs-buy-container">
      <div class="calculator-header">
        <h1>Rent vs Buy Calculator</h1>
        <p>Make an informed decision about renting versus buying a home</p>
        <a routerLink="/mortgage-tools" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Back to Mortgage Tools
        </a>
      </div>

      <div class="calculator-content">
        <div class="section-content">
          <form [formGroup]="calculatorForm" (ngSubmit)="calculate()">
            <!-- Property Details -->
            <div class="section-content">
              <div class="section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  Property Details
                </h2>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label for="homePrice">Home Purchase Price</label>
                  <input 
                    id="homePrice"
                    type="number" 
                    formControlName="homePrice"
                    placeholder="400000"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="monthlyRent">Monthly Rent</label>
                  <input 
                    id="monthlyRent"
                    type="number" 
                    formControlName="monthlyRent"
                    placeholder="2200"
                    class="form-control"
                  />
                </div>
              </div>
            </div>

            <!-- Buying Costs -->
            <div class="section-content">
              <div class="section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Buying Costs
                </h2>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label for="downPaymentPercent">Down Payment (%)</label>
                  <input 
                    id="downPaymentPercent"
                    type="number" 
                    min="0"
                    max="100"
                    formControlName="downPaymentPercent"
                    placeholder="20"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="interestRate">Mortgage Rate (%)</label>
                  <input 
                    id="interestRate"
                    type="number" 
                    step="0.01"
                    formControlName="interestRate"
                    placeholder="6.5"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="loanTerm">Loan Term (years)</label>
                  <select id="loanTerm" formControlName="loanTerm" class="form-control">
                    <option value="15">15 years</option>
                    <option value="30">30 years</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="closingCosts">Closing Costs ($)</label>
                  <input 
                    id="closingCosts"
                    type="number" 
                    formControlName="closingCosts"
                    placeholder="8000"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="propertyTaxRate">Property Tax Rate (%)</label>
                  <input 
                    id="propertyTaxRate"
                    type="number" 
                    step="0.01"
                    formControlName="propertyTaxRate"
                    placeholder="1.2"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="homeInsurance">Home Insurance (monthly)</label>
                  <input 
                    id="homeInsurance"
                    type="number" 
                    formControlName="homeInsurance"
                    placeholder="200"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="maintenance">Maintenance & Repairs (%/year)</label>
                  <input 
                    id="maintenance"
                    type="number" 
                    step="0.1"
                    formControlName="maintenance"
                    placeholder="1.5"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="hoaFees">HOA Fees (monthly)</label>
                  <input 
                    id="hoaFees"
                    type="number" 
                    formControlName="hoaFees"
                    placeholder="0"
                    class="form-control"
                  />
                </div>
              </div>
            </div>

            <!-- Market Assumptions -->
            <div class="section-content">
              <div class="section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                  Market Assumptions
                </h2>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label for="homeAppreciation">Home Appreciation (%/year)</label>
                  <input 
                    id="homeAppreciation"
                    type="number" 
                    step="0.1"
                    formControlName="homeAppreciation"
                    placeholder="3.0"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="rentIncrease">Rent Increase (%/year)</label>
                  <input 
                    id="rentIncrease"
                    type="number" 
                    step="0.1"
                    formControlName="rentIncrease"
                    placeholder="3.0"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="investmentReturn">Investment Return (%/year)</label>
                  <input 
                    id="investmentReturn"
                    type="number" 
                    step="0.1"
                    formControlName="investmentReturn"
                    placeholder="7.0"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="inflationRate">Inflation Rate (%/year)</label>
                  <input 
                    id="inflationRate"
                    type="number" 
                    step="0.1"
                    formControlName="inflationRate"
                    placeholder="2.5"
                    class="form-control"
                  />
                </div>
              </div>
            </div>

            <!-- Renting Costs -->
            <div class="section-content">
              <div class="section-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H9M16 17L21 12L16 7M21 12H9"/>
                  </svg>
                  Renting Costs
                </h2>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label for="securityDeposit">Security Deposit</label>
                  <input 
                    id="securityDeposit"
                    type="number" 
                    formControlName="securityDeposit"
                    placeholder="2200"
                    class="form-control"
                  />
                </div>
                
                <div class="form-group">
                  <label for="rentersInsurance">Renters Insurance (monthly)</label>
                  <input 
                    id="rentersInsurance"
                    type="number" 
                    formControlName="rentersInsurance"
                    placeholder="25"
                    class="form-control"
                  />
                </div>
              </div>
            </div>

            <div class="button-group-center">
              <button 
                type="submit" 
                class="btn btn-primary btn-lg"
                [disabled]="calculatorForm.invalid || calculating"
              >
                <svg *ngIf="!calculating" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                {{ calculating ? 'Analyzing...' : 'Compare Rent vs Buy' }}
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
          <!-- Quick Decision -->
          <div class="decision-card" [class]="'decision-' + result.recommendation.decision">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
                Our Recommendation
              </h2>
              <div class="confidence-meter">
                <div class="confidence-bar" [style.width.%]="result.recommendation.confidence"></div>
                <span class="confidence-text">{{ result.recommendation.confidence }}% confident</span>
              </div>
            </div>
            
            <div class="decision-result">
              <div class="decision-icon">
                <svg *ngIf="result.recommendation.decision === 'buy'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <svg *ngIf="result.recommendation.decision === 'rent'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="11" height="10" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"/>
                </svg>
                <svg *ngIf="result.recommendation.decision === 'neutral'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9 9H9.01"/>
                  <path d="M15 9H15.01"/>
                  <path d="M8 15H16"/>
                </svg>
              </div>
              <div class="decision-content">
                <h3 class="decision-title">
                  {{ result.recommendation.decision === 'buy' ? 'Buy the Home' : 
                     result.recommendation.decision === 'rent' ? 'Keep Renting' : 'It\'s a Tie' }}
                </h3>
                <p class="decision-reason">{{ result.recommendation.primaryReason }}</p>
              </div>
            </div>
            
            <div class="decision-considerations">
              <h4>Consider These Factors:</h4>
              <ul>
                <li *ngFor="let consideration of result.recommendation.considerations">{{ consideration }}</li>
              </ul>
            </div>
          </div>

          <!-- Cost Comparison -->
          <div class="section-content">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M12 2L13.09 8.26L22 9L17.5 13.74L18.18 21.02L12 17.77L5.82 21.02L6.5 13.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
                Cost Comparison
              </h2>
            </div>
            <div class="card-grid-lg">
              <div class="comparison-card">
                <div class="comparison-header buying">
                  <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                    Buying
                  </h3>
                  <div class="monthly-cost">\${{ result.buying.totalMonthlyCost | number:'1.0-0' }}/month</div>
                </div>
                <div class="cost-breakdown">
                  <div class="cost-item">
                    <span>Mortgage Payment:</span>
                    <span>\${{ result.buying.monthlyPayment | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Initial Cash Needed:</span>
                    <span>\${{ result.buying.initialCashOutlay | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>5-Year Net Worth:</span>
                    <span [class]="result.buying.netWorth5Years > 0 ? 'positive' : 'negative'">
                      \${{ result.buying.netWorth5Years | number:'1.0-0' }}
                    </span>
                  </div>
                  <div class="cost-item">
                    <span>10-Year Net Worth:</span>
                    <span [class]="result.buying.netWorth10Years > 0 ? 'positive' : 'negative'">
                      \${{ result.buying.netWorth10Years | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="comparison-card">
                <div class="comparison-header renting">
                  <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                      <rect x="3" y="11" width="11" height="10" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11"/>
                    </svg>
                    Renting
                  </h3>
                  <div class="monthly-cost">\${{ result.renting.totalMonthlyCost | number:'1.0-0' }}/month</div>
                </div>
                <div class="cost-breakdown">
                  <div class="cost-item">
                    <span>Monthly Rent:</span>
                    <span>\${{ result.renting.monthlyRent | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Initial Cash Needed:</span>
                    <span>\${{ result.renting.initialDeposit | number:'1.0-0' }}</span>
                  </div>
                  <div class="cost-item">
                    <span>5-Year Net Worth:</span>
                    <span [class]="result.renting.netWorth5Years > 0 ? 'positive' : 'negative'">
                      \${{ result.renting.netWorth5Years | number:'1.0-0' }}
                    </span>
                  </div>
                  <div class="cost-item">
                    <span>10-Year Net Worth:</span>
                    <span [class]="result.renting.netWorth10Years > 0 ? 'positive' : 'negative'">
                      \${{ result.renting.netWorth10Years | number:'1.0-0' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Break-Even Analysis -->
          <div class="section-content">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <path d="M12 3V21M21 12L3 12"/>
                </svg>
                Break-Even Analysis
              </h2>
            </div>
            <div class="breakeven-layout">
              <div class="breakeven-chart">
                <div class="breakeven-point">
                  <div class="breakeven-value">{{ result.breakEvenPoint }}</div>
                  <div class="breakeven-label">years to break even</div>
                </div>
              </div>
              <div class="breakeven-insights">
                <div class="insight-item">
                  <span class="insight-label">Monthly Difference:</span>
                  <span class="insight-value" [class]="result.comparison.monthlyDifference > 0 ? 'positive' : 'negative'">
                    {{ result.comparison.monthlyDifference > 0 ? 'Renting costs ' : 'Buying costs ' }}
                    \${{ Math.abs(result.comparison.monthlyDifference) | number:'1.0-0' }} more
                  </span>
                </div>
                <div class="insight-item">
                  <span class="insight-label">5-Year Advantage:</span>
                  <span class="insight-value">
                    {{ result.comparison.fiveYearAdvantage === 'buy' ? 'Buying' : 'Renting' }} 
                    saves \${{ Math.abs(result.comparison.fiveYearSavings) | number:'1.0-0' }}
                  </span>
                </div>
                <div class="insight-item">
                  <span class="insight-label">10-Year Advantage:</span>
                  <span class="insight-value">
                    {{ result.comparison.tenYearAdvantage === 'buy' ? 'Buying' : 'Renting' }} 
                    saves \${{ Math.abs(result.comparison.tenYearSavings) | number:'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Yearly Comparison Chart -->
          <div class="section-content">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
                10-Year Financial Projection
              </h2>
            </div>
            <div class="chart-container">
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color buying"></div>
                  <span>Buying Net Worth</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color renting"></div>
                  <span>Renting Net Worth</span>
                </div>
              </div>
              
              <div class="chart-grid">
                <div 
                  *ngFor="let data of result.yearlyComparison; let i = index"
                  class="chart-bar-group"
                  [style.width.%]="10"
                >
                  <div class="bar-container">
                    <div 
                      class="chart-bar buying"
                      [style.height.px]="getBarHeight(data.buyingNetWorth)"
                      [title]="'Year ' + data.year + ': $' + (data.buyingNetWorth | number:'1.0-0')"
                    ></div>
                    <div 
                      class="chart-bar renting"
                      [style.height.px]="getBarHeight(data.rentingNetWorth)"
                      [title]="'Year ' + data.year + ': $' + (data.rentingNetWorth | number:'1.0-0')"
                    ></div>
                  </div>
                  <div class="year-label">{{ data.year }}</div>
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
              Save Analysis
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
    .rent-vs-buy-container {
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
      color: rgba(255, 255, 255, 0.9);
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
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-lg);
    }

    .section-content {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      box-shadow: 0 2px 8px var(--shadow-light);
      border: 1px solid var(--border-light);
    }

    .form-container {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: 0 2px 8px var(--shadow-light);
      border: 1px solid var(--border-light);
      margin-bottom: var(--space-lg);
    }

    .form-sections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: var(--space-xl);
      margin-bottom: var(--space-xl);
    }

    .form-section {
      background: var(--background-secondary);
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
    }

    .section-header {
      margin-bottom: var(--space-md);
      text-align: left;
    }

    .section-header h3 {
      color: var(--primary-dark);
      font-size: var(--text-lg);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-md);
    }

    .form-grid-compact {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--space-xs);
      font-size: var(--text-sm);
    }

    .form-control {
      height: var(--height-input);
      padding: 0 var(--space-sm);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-sm);
      font-size: var(--text-base);
      background: var(--background-primary);
      color: var(--text-primary);
      transition: all 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-dark);
      box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
    }

    .form-actions {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      padding: var(--space-lg);
      border-top: 1px solid var(--border-light);
      margin-top: var(--space-lg);
    }

    .decision-card {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 12px var(--shadow-light);
      padding: var(--space-xl);
      margin-bottom: var(--space-xl);
      border-left: 4px solid;
    }

    .decision-card.decision-buy {
      border-left-color: var(--accent-success);
      background: linear-gradient(135deg, rgba(56, 161, 105, 0.05) 0%, var(--background-primary) 100%);
    }

    .decision-card.decision-rent {
      border-left-color: var(--primary-medium);
      background: linear-gradient(135deg, rgba(49, 130, 206, 0.05) 0%, var(--background-primary) 100%);
    }

    .decision-card.decision-neutral {
      border-left-color: var(--accent-warning);
      background: linear-gradient(135deg, rgba(214, 158, 46, 0.05) 0%, var(--background-primary) 100%);
    }

    .confidence-meter {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .confidence-bar {
      width: 100px;
      height: 8px;
      background: var(--accent-success);
      border-radius: var(--radius-sm);
      position: relative;
    }

    .confidence-text {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .decision-result {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      margin-bottom: var(--space-lg);
    }

    .decision-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: rgba(26, 54, 93, 0.1);
      border-radius: 50%;
      color: var(--primary-dark);
    }

    .decision-title {
      font-size: var(--text-xl);
      color: var(--primary-dark);
      margin-bottom: var(--space-xs);
      font-weight: 600;
    }

    .decision-reason {
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
      font-size: var(--text-base);
    }

    .decision-considerations h4 {
      color: var(--primary-dark);
      margin-bottom: var(--space-sm);
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .decision-considerations ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .decision-considerations li {
      padding: var(--space-xs) 0;
      color: var(--text-secondary);
      position: relative;
      padding-left: var(--space-lg);
      font-size: var(--text-sm);
    }

    .decision-considerations li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--primary-dark);
      font-weight: bold;
    }

    .comparison-card {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: all 0.2s ease;
    }

    .comparison-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px var(--shadow-medium);
    }

    .comparison-header {
      padding: var(--space-lg);
      text-align: center;
      color: var(--text-white);
    }

    .comparison-header.buying {
      background: linear-gradient(135deg, var(--accent-success) 0%, #2d7a4b 100%);
    }

    .comparison-header.renting {
      background: linear-gradient(135deg, var(--primary-medium) 0%, var(--primary-dark) 100%);
    }

    .comparison-header h3 {
      margin: 0 0 var(--space-sm) 0;
      font-size: var(--text-xl);
      font-weight: 600;
    }

    .monthly-cost {
      font-size: var(--text-2xl);
      font-weight: 700;
    }

    .cost-breakdown {
      padding: var(--space-lg);
    }

    .cost-item {
      display: flex;
      justify-content: space-between;
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border-light);
      font-size: var(--text-sm);
    }

    .cost-item:last-child {
      border-bottom: none;
    }

    .cost-item span:first-child {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .cost-item span:last-child {
      color: var(--text-primary);
      font-weight: 600;
    }

    .cost-item .positive {
      color: var(--accent-success);
    }

    .cost-item .negative {
      color: var(--accent-danger);
    }

    .card-grid-lg {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: var(--space-xl);
      margin-top: var(--space-lg);
    }

    .breakeven-layout {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--space-xl);
      align-items: start;
      margin-top: var(--space-lg);
    }

    .breakeven-chart {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--space-xl);
    }

    .breakeven-point {
      text-align: center;
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%);
      color: var(--text-white);
      padding: var(--space-xl);
      border-radius: 50%;
      width: 160px;
      height: 160px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .breakeven-value {
      font-size: var(--text-3xl);
      font-weight: 700;
      margin-bottom: var(--space-xs);
    }

    .breakeven-label {
      font-size: var(--text-sm);
      opacity: 0.9;
    }

    .breakeven-insights {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .insight-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding: var(--space-md);
      background: var(--background-secondary);
      border-radius: var(--radius-md);
    }

    .insight-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .insight-value {
      font-size: var(--text-base);
      color: var(--text-primary);
      font-weight: 600;
    }

    .insight-value.positive {
      color: var(--accent-success);
    }

    .insight-value.negative {
      color: var(--accent-danger);
    }

    .chart-container {
      margin-top: var(--space-lg);
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: var(--space-xl);
      margin-bottom: var(--space-lg);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: var(--radius-sm);
    }

    .legend-color.buying {
      background: var(--accent-success);
    }

    .legend-color.renting {
      background: var(--primary-medium);
    }

    .chart-grid {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 200px;
      background: var(--background-secondary);
      border-radius: var(--radius-md);
      padding: var(--space-md);
    }

    .chart-bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 8%;
    }

    .bar-container {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 150px;
      margin-bottom: var(--space-xs);
    }

    .chart-bar {
      width: 12px;
      border-radius: 2px 2px 0 0;
      min-height: 2px;
      transition: all 0.2s ease;
    }

    .chart-bar.buying {
      background: var(--accent-success);
    }

    .chart-bar.renting {
      background: var(--primary-medium);
    }

    .year-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .rent-vs-buy-container {
        padding: var(--space-sm);
      }

      .calculator-header {
        padding: var(--space-lg);
      }

      .calculator-header h1 {
        font-size: var(--text-2xl);
      }

      .form-sections-grid {\n        grid-template-columns: 1fr;\n        gap: var(--space-md);\n      }\n\n      .form-grid,\n      .form-grid-compact {\n        grid-template-columns: 1fr;\n        gap: var(--space-sm);\n      }\n\n      .form-section {\n        padding: var(--space-md);\n      }

      .card-grid-lg {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .breakeven-layout {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .breakeven-point {
        width: 120px;
        height: 120px;
        padding: var(--space-md);
      }

      .breakeven-value {
        font-size: var(--text-2xl);
      }

      .decision-result {
        flex-direction: column;
        text-align: center;
        gap: var(--space-md);
      }

      .decision-icon {
        width: 60px;
        height: 60px;
      }

      .chart-grid {
        height: 150px;
      }

      .bar-container {
        height: 100px;
      }

      .chart-bar {
        width: 8px;
      }

      .form-actions {
        flex-direction: column;
        align-items: center;
      }

      .form-actions .btn {
        width: 100%;
        max-width: 300px;
      }
    }

    .cost-item span:last-child {
      font-weight: 600;
      color: var(--text-primary);
    }

    .positive {
      color: var(--accent-success) !important;
    }

    .negative {
      color: var(--accent-danger) !important;
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

    .breakeven-point {
      text-align: center;
    }

    .breakeven-value {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--primary-dark);
    }

    .breakeven-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-top: var(--space-xs);
    }

    .breakeven-insights {
      display: grid;
      gap: var(--space-md);
    }

    .insight-item {
      display: flex;
      justify-content: space-between;
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border-light);
    }

    .insight-label {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: var(--text-sm);
    }

    .insight-value {
      font-weight: 600;
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .chart-container {
      background: var(--background-tertiary);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      border: 1px solid var(--border-light);
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: var(--space-xl);
      margin-bottom: var(--space-lg);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: var(--text-sm);
      font-weight: 500;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: var(--radius-xs);
    }

    .legend-color.buying {
      background: var(--accent-success);
    }

    .legend-color.renting {
      background: var(--primary-medium);
    }

    .chart-grid {
      display: flex;
      align-items: flex-end;
      gap: var(--space-xs);
      height: 200px;
      border-bottom: 2px solid var(--border-medium);
      border-left: 2px solid var(--border-medium);
      padding: var(--space-sm);
    }

    .chart-bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .bar-container {
      display: flex;
      gap: 2px;
      align-items: flex-end;
      height: 180px;
    }

    .chart-bar {
      width: 8px;
      border-radius: 2px 2px 0 0;
      min-height: 5px;
    }

    .chart-bar.buying {
      background: var(--accent-success);
    }

    .chart-bar.renting {
      background: var(--primary-medium);
    }

    .year-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: var(--space-xs);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .rent-vs-buy-container {
        padding: var(--space-sm);
      }

      .page-header h1 {
        font-size: var(--text-2xl);
      }

      .breakeven-layout {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }

      .decision-result {
        flex-direction: column;
        text-align: center;
        gap: var(--space-md);
      }

      .chart-legend {
        flex-direction: column;
        align-items: center;
        gap: var(--space-md);
      }
    }

    @media (max-width: 480px) {
      .rent-vs-buy-container {
        padding: var(--space-xs);
      }
      
      .page-header h1 {
        font-size: var(--text-xl);
      }
      
      .decision-card {
        padding: var(--space-md);
      }
    }
  `]
})
export class RentVsBuyCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  result: RentVsBuyResult | null = null;
  calculating = false;
  
  // Expose Math to template
  Math = Math;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      homePrice: [400000, [Validators.required, Validators.min(10000)]],
      monthlyRent: [2200, [Validators.required, Validators.min(100)]],
      downPaymentPercent: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      interestRate: [6.5, [Validators.required, Validators.min(0.1), Validators.max(20)]],
      loanTerm: [30, [Validators.required]],
      closingCosts: [8000, [Validators.required, Validators.min(0)]],
      propertyTaxRate: [1.2, [Validators.required, Validators.min(0)]],
      homeInsurance: [200, [Validators.required, Validators.min(0)]],
      maintenance: [1.5, [Validators.required, Validators.min(0)]],
      hoaFees: [0, [Validators.min(0)]],
      homeAppreciation: [3.0, [Validators.required]],
      rentIncrease: [3.0, [Validators.required]],
      investmentReturn: [7.0, [Validators.required]],
      inflationRate: [2.5, [Validators.required]],
      securityDeposit: [2200, [Validators.required, Validators.min(0)]],
      rentersInsurance: [25, [Validators.required, Validators.min(0)]]
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

  private performCalculation(data: any): RentVsBuyResult {
    const buying = this.calculateBuying(data);
    const renting = this.calculateRenting(data);
    const comparison = this.compareOptions(buying, renting);
    const breakEvenPoint = this.calculateBreakEven(buying, renting, data);
    const recommendation = this.generateRecommendation(buying, renting, comparison);
    const yearlyComparison = this.generateYearlyComparison(data, buying, renting);

    return {
      buying,
      renting,
      comparison,
      breakEvenPoint,
      recommendation,
      yearlyComparison
    };
  }

  private calculateBuying(data: any): BuyingAnalysis {
    const downPayment = data.homePrice * (data.downPaymentPercent / 100);
    const loanAmount = data.homePrice - downPayment;
    
    const monthlyRate = data.interestRate / 100 / 12;
    const numberOfPayments = data.loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const monthlyPropertyTax = (data.homePrice * (data.propertyTaxRate / 100)) / 12;
    const monthlyMaintenance = (data.homePrice * (data.maintenance / 100)) / 12;
    const totalMonthlyCost = monthlyPayment + monthlyPropertyTax + data.homeInsurance + monthlyMaintenance + data.hoaFees;

    const initialCashOutlay = downPayment + data.closingCosts;
    const yearlyAppreciation = data.homePrice * (data.homeAppreciation / 100);

    // 5-year calculations
    const totalCost5Years = totalMonthlyCost * 60 + initialCashOutlay;
    const homeValue5Years = data.homePrice * Math.pow(1 + data.homeAppreciation / 100, 5);
    const remainingBalance5Years = this.calculateRemainingBalance(loanAmount, monthlyRate, numberOfPayments, 60);
    const equityBuilt5Years = homeValue5Years - remainingBalance5Years;
    const netWorth5Years = equityBuilt5Years - totalCost5Years;

    // 10-year calculations
    const totalCost10Years = totalMonthlyCost * 120 + initialCashOutlay;
    const homeValue10Years = data.homePrice * Math.pow(1 + data.homeAppreciation / 100, 10);
    const remainingBalance10Years = this.calculateRemainingBalance(loanAmount, monthlyRate, numberOfPayments, 120);
    const equityBuilt10Years = homeValue10Years - remainingBalance10Years;
    const netWorth10Years = equityBuilt10Years - totalCost10Years;

    return {
      monthlyPayment,
      totalMonthlyCost,
      downPayment,
      closingCosts: data.closingCosts,
      initialCashOutlay,
      yearlyAppreciation,
      equityBuilt: equityBuilt5Years,
      totalCost5Years,
      totalCost10Years,
      netWorth5Years,
      netWorth10Years
    };
  }

  private calculateRenting(data: any): RentingAnalysis {
    const totalMonthlyCost = data.monthlyRent + data.rentersInsurance;
    const initialDeposit = data.securityDeposit;

    // 5-year calculations with rent increases
    let totalCost5Years = initialDeposit;
    let currentRent = data.monthlyRent;
    for (let year = 0; year < 5; year++) {
      totalCost5Years += (currentRent + data.rentersInsurance) * 12;
      currentRent *= (1 + data.rentIncrease / 100);
    }

    // 10-year calculations
    let totalCost10Years = initialDeposit;
    currentRent = data.monthlyRent;
    for (let year = 0; year < 10; year++) {
      totalCost10Years += (currentRent + data.rentersInsurance) * 12;
      currentRent *= (1 + data.rentIncrease / 100);
    }

    // Investment growth assuming investing the down payment difference
    const investmentPrincipal = data.homePrice * (data.downPaymentPercent / 100) + data.closingCosts;
    const investmentGrowth5Years = investmentPrincipal * Math.pow(1 + data.investmentReturn / 100, 5);
    const investmentGrowth10Years = investmentPrincipal * Math.pow(1 + data.investmentReturn / 100, 10);

    const netWorth5Years = investmentGrowth5Years - totalCost5Years;
    const netWorth10Years = investmentGrowth10Years - totalCost10Years;

    return {
      monthlyRent: data.monthlyRent,
      totalMonthlyCost,
      initialDeposit,
      yearlyRentIncrease: data.rentIncrease,
      totalCost5Years,
      totalCost10Years,
      investmentGrowth5Years,
      investmentGrowth10Years,
      netWorth5Years,
      netWorth10Years
    };
  }

  private compareOptions(buying: BuyingAnalysis, renting: RentingAnalysis): ComparisonAnalysis {
    const monthlyDifference = buying.totalMonthlyCost - renting.totalMonthlyCost;
    const cashOutlayDifference = buying.initialCashOutlay - renting.initialDeposit;
    
    const fiveYearSavings = buying.netWorth5Years - renting.netWorth5Years;
    const tenYearSavings = buying.netWorth10Years - renting.netWorth10Years;
    
    const fiveYearAdvantage = fiveYearSavings > 1000 ? 'buy' : fiveYearSavings < -1000 ? 'rent' : 'neutral';
    const tenYearAdvantage = tenYearSavings > 1000 ? 'buy' : tenYearSavings < -1000 ? 'rent' : 'neutral';

    return {
      monthlyDifference,
      cashOutlayDifference,
      fiveYearAdvantage,
      tenYearAdvantage,
      fiveYearSavings,
      tenYearSavings
    };
  }

  private calculateBreakEven(buying: BuyingAnalysis, renting: RentingAnalysis, data: any): number {
    // Simplified break-even calculation based on when net worth crosses over
    for (let year = 1; year <= 20; year++) {
      const buyingNetWorth = this.calculateNetWorthAtYear(buying, data, year);
      const rentingNetWorth = this.calculateRentingNetWorthAtYear(renting, data, year);
      
      if (buyingNetWorth > rentingNetWorth) {
        return year;
      }
    }
    return 20; // Max 20 years
  }

  private generateRecommendation(
    buying: BuyingAnalysis, 
    renting: RentingAnalysis, 
    comparison: ComparisonAnalysis
  ): RecommendationResult {
    let decision: 'buy' | 'rent' | 'neutral';
    let confidence: number;
    let primaryReason: string;
    const considerations: string[] = [];

    // Decision logic based on 5-year and 10-year advantages
    if (comparison.fiveYearAdvantage === 'buy' && comparison.tenYearAdvantage === 'buy') {
      decision = 'buy';
      confidence = 85;
      primaryReason = `Buying provides significant financial advantages in both 5 and 10-year scenarios, with potential savings of $${Math.abs(comparison.tenYearSavings).toLocaleString()} over 10 years.`;
    } else if (comparison.fiveYearAdvantage === 'rent' && comparison.tenYearAdvantage === 'rent') {
      decision = 'rent';
      confidence = 85;
      primaryReason = `Renting is more cost-effective in both short and long-term scenarios, potentially saving $${Math.abs(comparison.tenYearSavings).toLocaleString()} over 10 years.`;
    } else if (comparison.tenYearAdvantage === 'buy' && Math.abs(comparison.tenYearSavings) > 50000) {
      decision = 'buy';
      confidence = 70;
      primaryReason = `While renting may be cheaper initially, buying becomes significantly more advantageous over the long term.`;
    } else if (comparison.fiveYearAdvantage === 'rent' && comparison.monthlyDifference > 500) {
      decision = 'rent';
      confidence = 75;
      primaryReason = `Renting provides immediate monthly savings of $${Math.abs(comparison.monthlyDifference).toLocaleString()} and short-term financial flexibility.`;
    } else {
      decision = 'neutral';
      confidence = 60;
      primaryReason = `Both options have similar financial outcomes. Your personal circumstances and preferences should guide the decision.`;
    }

    // Add considerations
    if (comparison.monthlyDifference > 300) {
      considerations.push(`Buying requires $${Math.abs(comparison.monthlyDifference).toLocaleString()} more per month`);
    }
    if (buying.initialCashOutlay > 50000) {
      considerations.push(`Significant upfront investment required: $${buying.initialCashOutlay.toLocaleString()}`);
    }
    if (comparison.tenYearAdvantage === 'buy') {
      considerations.push('Long-term wealth building potential through home equity');
    }
    if (comparison.fiveYearAdvantage === 'rent') {
      considerations.push('Greater flexibility and lower maintenance responsibilities with renting');
    }

    return {
      decision,
      confidence,
      primaryReason,
      considerations
    };
  }

  private generateYearlyComparison(data: any, buying: BuyingAnalysis, renting: RentingAnalysis): YearlyData[] {
    const yearlyData: YearlyData[] = [];

    for (let year = 1; year <= 10; year++) {
      const buyingNetWorth = this.calculateNetWorthAtYear(buying, data, year);
      const rentingNetWorth = this.calculateRentingNetWorthAtYear(renting, data, year);

      yearlyData.push({
        year,
        buyingCumulativeCost: buying.totalMonthlyCost * 12 * year + buying.initialCashOutlay,
        rentingCumulativeCost: renting.totalMonthlyCost * 12 * year + renting.initialDeposit,
        buyingNetWorth,
        rentingNetWorth
      });
    }

    return yearlyData;
  }

  private calculateNetWorthAtYear(buying: BuyingAnalysis, data: any, year: number): number {
    const homeValue = data.homePrice * Math.pow(1 + data.homeAppreciation / 100, year);
    const totalCost = buying.totalMonthlyCost * 12 * year + buying.initialCashOutlay;
    return homeValue - totalCost;
  }

  private calculateRentingNetWorthAtYear(renting: RentingAnalysis, data: any, year: number): number {
    const investmentGrowth = (data.homePrice * (data.downPaymentPercent / 100) + data.closingCosts) * 
                            Math.pow(1 + data.investmentReturn / 100, year);
    const totalCost = renting.totalMonthlyCost * 12 * year + renting.initialDeposit;
    return investmentGrowth - totalCost;
  }

  private calculateRemainingBalance(principal: number, monthlyRate: number, totalPayments: number, paymentsMade: number): number {
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                          (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    const remainingPayments = totalPayments - paymentsMade;
    return monthlyPayment * ((Math.pow(1 + monthlyRate, remainingPayments) - 1) / monthlyRate) / 
           Math.pow(1 + monthlyRate, remainingPayments);
  }

  getBarHeight(value: number): number {
    if (!this.result) return 0;
    
    const maxValue = Math.max(
      ...this.result.yearlyComparison.map(d => Math.max(d.buyingNetWorth, d.rentingNetWorth))
    );
    const minValue = Math.min(
      ...this.result.yearlyComparison.map(d => Math.min(d.buyingNetWorth, d.rentingNetWorth))
    );
    
    const range = maxValue - minValue;
    const normalizedValue = (value - minValue) / range;
    return Math.max(5, normalizedValue * 160); // Min 5px, max 160px
  }

  reset() {
    this.calculatorForm.reset({
      homePrice: 400000,
      monthlyRent: 2200,
      downPaymentPercent: 20,
      interestRate: 6.5,
      loanTerm: 30,
      closingCosts: 8000,
      propertyTaxRate: 1.2,
      homeInsurance: 200,
      maintenance: 1.5,
      hoaFees: 0,
      homeAppreciation: 3.0,
      rentIncrease: 3.0,
      investmentReturn: 7.0,
      inflationRate: 2.5,
      securityDeposit: 2200,
      rentersInsurance: 25
    });
    this.result = null;
  }

  saveCalculation() {
    if (this.result) {
      const calculationData = {
        ...this.calculatorForm.value,
        result: this.result,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`rent-vs-buy-calc-${Date.now()}`, JSON.stringify(calculationData));
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
      link.download = `rent-vs-buy-analysis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  shareResults() {
    if (this.result && navigator.share) {
      const decision = this.result.recommendation.decision === 'buy' ? 'buying' : 
                      this.result.recommendation.decision === 'rent' ? 'renting' : 'both options are similar';
      
      navigator.share({
        title: 'Rent vs Buy Analysis Results',
        text: `My rent vs buy analysis recommends ${decision}. ${this.result.recommendation.primaryReason}`,
        url: window.location.href
      }).catch(console.error);
    }
  }
}