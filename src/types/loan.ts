export interface LoanParameters {
  loanAmount: number;
  interestRate: number;
  tenure: number; // in months
  interestType: 'fixed' | 'floating' | '';
  loanCategory: 'secured' | 'unsecured' | '';
  loanType: string;
  processingCharges: number;
  fileCharges: number;
  insuranceCharges: number;
  commissionCharges: number;
  eligibleForTaxDeduction: boolean;
  topUpAmount: number;
  topUpRate: number;
  topUpTenure: number;
  principalPaid: number;
  tenurePassed: number;
  topUpCharges: number;
  topUpChargesType: 'upfront' | 'added' | '';
}

export interface EMIScheduleItem {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface LoanCalculationResult {
  emi: number;
  totalRepayment: number;
  totalInterest: number;
  disbursedAmount: number;
  schedule: EMIScheduleItem[];
  taxBenefits: number;
  effectiveInterestRate: number;
}

export interface PrepaymentScenario {
  month: number;
  amount: number;
  type: 'reduce-tenure' | 'reduce-emi';
}