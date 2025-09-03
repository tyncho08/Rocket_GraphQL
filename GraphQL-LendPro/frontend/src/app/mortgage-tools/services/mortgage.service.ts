import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { CALCULATE_MORTGAGE_QUERY, CHECK_PREAPPROVAL_QUERY } from '../../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class MortgageService {
  private calculationHistorySubject = new BehaviorSubject<any[]>([]);
  public calculationHistory$ = this.calculationHistorySubject.asObservable();

  constructor(private apollo: Apollo) {
    this.loadCalculationHistory();
  }

  calculateMortgage(calculation: any): Observable<any> {
    return this.apollo.query({
      query: CALCULATE_MORTGAGE_QUERY,
      variables: {
        input: {
          propertyPrice: calculation.propertyPrice,
          downPayment: calculation.downPayment,
          interestRate: calculation.interestRate,
          loanTermYears: calculation.loanTermYears
        }
      }
    }).pipe(
      map(result => (result.data as any).calculateMortgage),
      tap(result => this.addToHistory(result))
    );
  }

  checkPreApproval(annualIncome: number, loanAmount: number, monthlyDebts: number): Observable<any> {
    return this.apollo.query({
      query: CHECK_PREAPPROVAL_QUERY,
      variables: {
        input: {
          annualIncome,
          loanAmount,
          monthlyDebts
        }
      }
    }).pipe(
      map(result => (result.data as any).checkPreApproval)
    );
  }

  // Local calculation for instant feedback (before API call)
  calculateMonthlyPaymentLocal(loanAmount: number, interestRate: number, loanTermYears: number): number {
    if (interestRate === 0) {
      return loanAmount / (loanTermYears * 12);
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return monthlyPayment;
  }

  private addToHistory(result: any): void {
    const history = this.calculationHistorySubject.value;
    const newHistory = [result, ...history.slice(0, 9)]; // Keep only last 10
    this.calculationHistorySubject.next(newHistory);
    this.saveCalculationHistory(newHistory);
  }

  private loadCalculationHistory(): void {
    const saved = localStorage.getItem('mortgage-calculation-history');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        this.calculationHistorySubject.next(history);
      } catch (e) {
        console.warn('Failed to load calculation history');
      }
    }
  }

  private saveCalculationHistory(history: any[]): void {
    try {
      localStorage.setItem('mortgage-calculation-history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save calculation history');
    }
  }

  clearHistory(): void {
    this.calculationHistorySubject.next([]);
    localStorage.removeItem('mortgage-calculation-history');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  calculateTotalInterest(monthlyPayment: number, loanTermYears: number, loanAmount: number): number {
    return (monthlyPayment * loanTermYears * 12) - loanAmount;
  }

  calculateLoanToValueRatio(loanAmount: number, propertyValue: number): number {
    return (loanAmount / propertyValue) * 100;
  }

  calculateDebtToIncomeRatio(monthlyPayment: number, monthlyIncome: number): number {
    return (monthlyPayment / monthlyIncome) * 100;
  }

  getCurrentRates(): Observable<any> {
    // Return mock rates - in a real app this would fetch from an API
    return new Observable(observer => {
      observer.next({
        thirtyYear: 7.25,
        fifteenYear: 6.85,
        fiveOneArm: 6.45,
        fhaRate: 6.95,
        vaRate: 6.75,
        jumboRate: 7.35,
        lastUpdated: new Date()
      });
      observer.complete();
    });
  }

  getPreApprovalAmount(annualIncome: number, monthlyDebts: number, downPayment: number): number {
    // Basic pre-approval calculation based on 28/36 rule
    const monthlyIncome = annualIncome / 12;
    const maxHousingPayment = monthlyIncome * 0.28;
    const maxTotalDebt = monthlyIncome * 0.36;
    const maxMortgagePayment = Math.min(maxHousingPayment, maxTotalDebt - monthlyDebts);
    
    // Estimate loan amount based on typical rates and terms
    const estimatedRate = 0.07 / 12; // 7% annual rate
    const termMonths = 360; // 30 years
    const maxLoanAmount = maxMortgagePayment * ((Math.pow(1 + estimatedRate, termMonths) - 1) / 
      (estimatedRate * Math.pow(1 + estimatedRate, termMonths)));
    
    return maxLoanAmount + downPayment;
  }
}