export interface MortgageCalculation {
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
}

export interface MortgageCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
  amortizationSchedule: AmortizationScheduleItem[];
  calculatedAt?: Date;
}

export interface AmortizationScheduleItem {
  paymentNumber: number;
  paymentAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
}

export interface LoanApplication {
  id?: number;
  userId?: number;
  userName?: string;
  loanAmount: number;
  propertyValue: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  annualIncome: number;
  employmentStatus: string;
  employer?: string;
  status?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLoanApplication {
  [key: string]: any;
  loanAmount: number;
  propertyValue: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  annualIncome: number;
  employmentStatus: string;
  employer?: string;
  notes?: string;
  propertyAddress?: string;
  loanPurpose?: string;
  propertyType?: string;
  occupancyType?: string;
  employerName?: string;
  jobTitle?: string;
  workStartDate?: string;
  monthlyDebts?: number;
  creditScore?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  ssn?: string;
  dateOfBirth?: string;
  currentAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  residencyStatus?: string;
  previousAddress?: string;
  monthsAtCurrentAddress?: number;
  monthsAtPreviousAddress?: number;
  housingPayment?: number;
  co_borrower_firstName?: string;
  co_borrower_lastName?: string;
  co_borrower_email?: string;
  co_borrower_phone?: string;
  co_borrower_ssn?: string;
  co_borrower_dateOfBirth?: string;
  co_borrower_annualIncome?: number;
  co_borrower_employmentStatus?: string;
  co_borrower_employerName?: string;
  co_borrower_jobTitle?: string;
  co_borrower_workStartDate?: string;
  militaryService?: string;
  veteranStatus?: string;
  firstTimeHomeBuyer?: boolean;
  giftFunds?: boolean;
  giftFundsAmount?: number;
  giftFundsSource?: string;
  additionalIncome?: number;
  additionalIncomeSource?: string;
  maritalStatus?: string;
}