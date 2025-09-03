import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MortgageCalculatorComponent } from './mortgage-calculator.component';
import { MortgageService } from '../services/mortgage.service';
import { NotificationService } from '../../shared/services/notification.service';

describe('MortgageCalculatorComponent', () => {
  let component: MortgageCalculatorComponent;
  let fixture: ComponentFixture<MortgageCalculatorComponent>;
  let mockMortgageService: jasmine.SpyObj<MortgageService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create spy objects for dependencies
    mockMortgageService = jasmine.createSpyObj('MortgageService', [
      'calculateMortgage',
      'checkPreApproval',
      'calculateMonthlyPaymentLocal',
      'calculateTotalInterest',
      'calculateDebtToIncomeRatio',
      'getCurrentRates',
      'formatCurrency',
      'clearHistory'
    ]);

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning'
    ]);

    mockActivatedRoute = {
      queryParams: of({})
    };

    // Set up spy return values
    mockMortgageService.calculateMortgage.and.returnValue(of({
      monthlyPayment: 2500,
      loanAmount: 400000,
      totalInterest: 300000,
      totalPayment: 700000,
      amortizationSchedule: []
    }));

    mockMortgageService.checkPreApproval.and.returnValue(of({
      isEligible: true
    }));

    mockMortgageService.getCurrentRates.and.returnValue(of([
      { term: 30, rate: 6.5 },
      { term: 15, rate: 6.0 }
    ]));

    mockMortgageService.formatCurrency.and.returnValue('$2,500');
    mockMortgageService.calculateMonthlyPaymentLocal.and.returnValue(2500);
    mockMortgageService.calculateTotalInterest.and.returnValue(300000);
    mockMortgageService.calculateDebtToIncomeRatio.and.returnValue(28);

    // Set up property for calculationHistory$
    Object.defineProperty(mockMortgageService, 'calculationHistory$', {
      value: of([])
    });

    await TestBed.configureTestingModule({
      imports: [MortgageCalculatorComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: MortgageService, useValue: mockMortgageService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MortgageCalculatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    component.ngOnInit();
    
    expect(component.calculatorForm.get('propertyPrice')?.value).toBe(450000);
    expect(component.calculatorForm.get('downPayment')?.value).toBe(90000);
    expect(component.calculatorForm.get('interestRate')?.value).toBe(6.5);
    expect(component.calculatorForm.get('loanTermYears')?.value).toBe(30);
  });

  it('should calculate mortgage when form is valid', () => {
    component.ngOnInit();
    component.calculateMortgage();

    expect(mockMortgageService.calculateMortgage).toHaveBeenCalledWith({
      propertyPrice: 450000,
      downPayment: 90000,
      interestRate: 6.5,
      loanTermYears: 30
    });
  });

  it('should not calculate mortgage when form is invalid', () => {
    component.ngOnInit();
    component.calculatorForm.patchValue({ propertyPrice: null });
    
    component.calculateMortgage();

    expect(mockMortgageService.calculateMortgage).not.toHaveBeenCalled();
  });

  it('should show success notification on successful calculation', () => {
    component.ngOnInit();
    component.calculateMortgage();

    expect(mockNotificationService.success).toHaveBeenCalledWith(
      'Calculation Complete',
      'Your mortgage payment has been calculated'
    );
  });

  it('should calculate down payment percentage correctly', () => {
    component.ngOnInit();
    component.calculatorForm.patchValue({
      propertyPrice: 400000,
      downPayment: 80000
    });

    const percentage = component.getDownPaymentPercentage();
    expect(percentage).toBe(20);
  });

  it('should set loan term correctly', () => {
    component.ngOnInit();
    component.setLoanTerm(15);

    expect(component.calculatorForm.get('loanTermYears')?.value).toBe(15);
    expect(component.showCustomTerm).toBe(false);
  });

  it('should check pre-approval with valid data', () => {
    component.ngOnInit();
    component.result = {
      monthlyPayment: 2500,
      loanAmount: 400000,
      totalInterest: 300000,
      totalPayment: 700000,
      amortizationSchedule: []
    };
    
    component.preapprovalForm.patchValue({
      annualIncome: 100000,
      monthlyDebts: 1000
    });

    component.checkPreapproval();

    expect(mockMortgageService.checkPreApproval).toHaveBeenCalledWith(
      100000,
      400000,
      1000
    );
  });

  it('should show warning when pre-approval check fails validation', () => {
    component.ngOnInit();
    component.result = null;
    
    component.checkPreapproval();

    expect(mockNotificationService.warning).toHaveBeenCalledWith(
      'Missing Information',
      'Please calculate mortgage payment first and enter income details'
    );
  });

  it('should reset form to default values', () => {
    component.ngOnInit();
    
    // Change some values
    component.calculatorForm.patchValue({
      propertyPrice: 300000,
      downPayment: 60000
    });
    
    component.clearForm();

    expect(component.calculatorForm.get('propertyPrice')?.value).toBe(450000);
    expect(component.calculatorForm.get('downPayment')?.value).toBe(90000);
    expect(component.result).toBeNull();
    expect(component.preapprovalResult).toBeNull();
  });

  it('should load current rates on initialization', () => {
    component.ngOnInit();

    expect(mockMortgageService.getCurrentRates).toHaveBeenCalled();
  });

  it('should handle query parameters for property price', () => {
    mockActivatedRoute.queryParams = of({ propertyPrice: '500000' });
    
    component.ngOnInit();

    expect(component.calculatorForm.get('propertyPrice')?.value).toBe(500000);
    expect(component.calculatorForm.get('downPayment')?.value).toBe(100000); // 20% of 500000
  });

  it('should calculate principal and interest percentages', () => {
    component.result = {
      loanAmount: 400000,
      totalInterest: 300000,
      totalPayment: 700000,
      monthlyPayment: 2500,
      amortizationSchedule: []
    };

    const principalPercentage = component.getPrincipalPercentage();
    const interestPercentage = component.getInterestPercentage();

    expect(principalPercentage).toBeCloseTo(57.14, 1); // 400000 / 700000 * 100
    expect(interestPercentage).toBeCloseTo(42.86, 1);  // 300000 / 700000 * 100
  });

  it('should return limited schedule when showFullSchedule is false', () => {
    component.result = {
      monthlyPayment: 2500,
      loanAmount: 400000,
      totalInterest: 300000,
      totalPayment: 700000,
      amortizationSchedule: Array(360).fill(null).map((_, index) => ({
        paymentNumber: index + 1,
        paymentAmount: 2500,
        principalAmount: 1000,
        interestAmount: 1500,
        remainingBalance: 400000 - (index * 1000)
      }))
    };

    component.showFullSchedule = false;
    const displaySchedule = component.getDisplaySchedule();

    expect(displaySchedule.length).toBe(12); // First 12 payments
  });

  it('should return full schedule when showFullSchedule is true', () => {
    component.result = {
      monthlyPayment: 2500,
      loanAmount: 400000,
      totalInterest: 300000,
      totalPayment: 700000,
      amortizationSchedule: Array(360).fill(null).map((_, index) => ({
        paymentNumber: index + 1,
        paymentAmount: 2500,
        principalAmount: 1000,
        interestAmount: 1500,
        remainingBalance: 400000 - (index * 1000)
      }))
    };

    component.showFullSchedule = true;
    const displaySchedule = component.getDisplaySchedule();

    expect(displaySchedule.length).toBe(360); // All payments
  });

  it('should track by payment number', () => {
    const payment = {
      paymentNumber: 5,
      paymentAmount: 2500,
      principalAmount: 1000,
      interestAmount: 1500,
      remainingBalance: 395000
    };

    const trackingValue = component.trackByPayment(0, payment);
    expect(trackingValue).toBe(5);
  });

  it('should generate CSV export data correctly', () => {
    component.result = {
      monthlyPayment: 2500,
      loanAmount: 400000,
      totalInterest: 300000,
      totalPayment: 700000,
      amortizationSchedule: [
        {
          paymentNumber: 1,
          paymentAmount: 2500,
          principalAmount: 333.33,
          interestAmount: 2166.67,
          remainingBalance: 399666.67
        }
      ]
    };

    spyOn<any>(component, 'generateCSV').and.callThrough();
    
    component.exportSchedule();
    
    expect(component['generateCSV']).toHaveBeenCalled();
  });

  it('should mark form as touched when validation fails', () => {
    component.ngOnInit();
    component.calculatorForm.patchValue({ propertyPrice: null });
    
    component.calculateMortgage();

    expect(component.calculatorForm.get('propertyPrice')?.touched).toBe(true);
  });

  it('should clear calculation history', () => {
    component.clearHistory();
    expect(mockMortgageService.clearHistory).toHaveBeenCalled();
  });

  it('should handle calculation error gracefully', () => {
    mockMortgageService.calculateMortgage.and.returnValue(
      of().pipe(() => { throw new Error('Calculation failed'); })
    );
    
    component.ngOnInit();
    component.calculateMortgage();

    expect(mockNotificationService.error).toHaveBeenCalledWith(
      'Calculation Error',
      'Unable to calculate mortgage payment'
    );
  });

  afterEach(() => {
    fixture.destroy();
  });
});