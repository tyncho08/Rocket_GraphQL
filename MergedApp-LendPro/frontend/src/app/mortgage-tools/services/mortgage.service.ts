import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MortgageCalculation, MortgageCalculationResult } from '../../shared/models/mortgage.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MortgageService {
  private apiUrl = `${environment.apiUrl}/mortgage`;
  private calculationHistorySubject = new BehaviorSubject<MortgageCalculationResult[]>([]);
  public calculationHistory$ = this.calculationHistorySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCalculationHistory();
  }

  calculateMortgage(calculation: MortgageCalculation): Observable<MortgageCalculationResult> {
    return this.http.post<MortgageCalculationResult>(`${this.apiUrl}/calculate`, calculation)
      .pipe(
        tap(result => this.addToHistory(result))
      );
  }

  checkPreApproval(annualIncome: number, loanAmount: number, monthlyDebts: number): Observable<{isEligible: boolean}> {
    const request = {
      annualIncome,
      loanAmount,
      monthlyDebts
    };
    
    return this.http.post<{isEligible: boolean}>(`${this.apiUrl}/preapproval`, request);
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

  // Calculate debt-to-income ratio locally
  calculateDebtToIncomeRatio(monthlyIncome: number, monthlyDebts: number, monthlyPayment: number): number {
    return ((monthlyDebts + monthlyPayment) / monthlyIncome) * 100;
  }

  // Get current mortgage rates (mock data or external API)
  getCurrentRates(): Observable<{rate: number, term: number, type: string}[]> {
    // Mock rates - in real app would come from external API
    const mockRates = [
      { rate: 6.5, term: 30, type: '30-Year Fixed' },
      { rate: 6.25, term: 15, type: '15-Year Fixed' },
      { rate: 6.75, term: 30, type: '30-Year ARM' },
      { rate: 6.0, term: 15, type: '15-Year ARM' }
    ];

    return new Observable(observer => {
      setTimeout(() => observer.next(mockRates), 100);
    });
  }

  // History management
  private addToHistory(result: MortgageCalculationResult): void {
    const history = this.calculationHistorySubject.value;
    const newHistory = [result, ...history].slice(0, 10); // Keep last 10 calculations
    this.calculationHistorySubject.next(newHistory);
    this.saveCalculationHistory(newHistory);
  }

  private loadCalculationHistory(): void {
    const saved = localStorage.getItem('mortgage_calculation_history');
    if (saved) {
      try {
        const history = JSON.parse(saved);
        this.calculationHistorySubject.next(history);
      } catch (e) {
        console.error('Error loading calculation history', e);
      }
    }
  }

  private saveCalculationHistory(history: MortgageCalculationResult[]): void {
    try {
      localStorage.setItem('mortgage_calculation_history', JSON.stringify(history));
    } catch (e) {
      console.error('Error saving calculation history', e);
    }
  }

  clearHistory(): void {
    this.calculationHistorySubject.next([]);
    localStorage.removeItem('mortgage_calculation_history');
  }

  // Utility methods for mortgage calculations
  calculateTotalInterest(monthlyPayment: number, loanTermYears: number, loanAmount: number): number {
    return (monthlyPayment * loanTermYears * 12) - loanAmount;
  }

  calculateLtvRatio(loanAmount: number, propertyValue: number): number {
    return (loanAmount / propertyValue) * 100;
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `$${formatted}`;
  }

  // Format percentage for display
  formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }
}