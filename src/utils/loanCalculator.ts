import { LoanParameters, EMIScheduleItem, LoanCalculationResult, PrepaymentScenario } from '../types/loan';

export class LoanCalculator {
  static calculateEMI(principal: number, rate: number, tenure: number): number {
    const monthlyRate = rate / (12 * 100);
    const numberOfPayments = tenure;
    
    if (rate === 0) return principal / tenure;
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(emi * 100) / 100;
  }

  static calculateDisbursedAmount(loanAmount: number, charges: {
    processing: number;
    file: number;
    insurance: number;
    commission: number;
  }): number {
    const totalCharges = charges.processing + charges.file + charges.insurance + charges.commission;
    return loanAmount - totalCharges;
  }

  static generateEMISchedule(
    principal: number,
    rate: number,
    tenure: number,
    prepayments: PrepaymentScenario[] = []
  ): EMIScheduleItem[] {
    const schedule: EMIScheduleItem[] = [];
    let remainingBalance = principal;
    const monthlyRate = rate / (12 * 100);
    let emi = this.calculateEMI(principal, rate, tenure);
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    for (let month = 1; month <= tenure && remainingBalance > 0; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = emi - interestPayment;
      
      // Handle prepayments
      const prepayment = prepayments.find(p => p.month === month);
      let extraPayment = 0;
      
      if (prepayment) {
        extraPayment = prepayment.amount;
        if (prepayment.type === 'reduce-emi') {
          // Recalculate EMI for remaining tenure
          const remainingTenure = tenure - month + 1;
          emi = this.calculateEMI(remainingBalance - principalPayment - extraPayment, rate, remainingTenure);
        }
      }

      principalPayment += extraPayment;
      
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
        emi = interestPayment + principalPayment;
      }

      remainingBalance -= principalPayment;
      cumulativeInterest += interestPayment;
      cumulativePrincipal += principalPayment;

      schedule.push({
        month,
        emi: emi,
        principal: principalPayment,
        interest: interestPayment,
        balance: remainingBalance,
        cumulativeInterest: cumulativeInterest,
        cumulativePrincipal: cumulativePrincipal,
      });

      if (remainingBalance <= 0) break;
    }

    return schedule;
  }

  static calculatePreClosureCharges(remainingBalance: number, penaltyRate: number = 2): number {
    return (remainingBalance * penaltyRate) / 100;
  }

  static calculateLateFees(emiAmount: number, daysLate: number, penaltyRate: number = 2): number {
    const monthlyPenalty = (emiAmount * penaltyRate) / 100;
    return (monthlyPenalty * daysLate) / 30;
  }

  static calculateTaxBenefits(principalRepayment: number, interestPayment: number): number {
    const maxPrincipalBenefit = Math.min(principalRepayment, 150000); // Section 80C - ₹1.5L limit
    const maxInterestBenefit = Math.min(interestPayment, 200000); // Section 24 - ₹2L limit for home loans
    const taxRate = 0.30; // Assuming 30% tax bracket
    
    return (maxPrincipalBenefit + maxInterestBenefit) * taxRate;
  }

  static isEligibleForTaxBenefits(loanType: string): boolean {
    const eligibleTypes = ['home', 'education'];
    return eligibleTypes.includes(loanType);
  }

  static calculateInflationAdjustedValue(amount: number, years: number, inflationRate: number = 6): number {
    return amount * Math.pow(1 + inflationRate / 100, years);
  }

  static calculateSIPComparison(monthlyAmount: number, rate: number, tenure: number): {
    finalValue: number;
    totalInvestment: number;
    returns: number;
  } {
    const monthlyRate = rate / (12 * 100);
    const totalInvestment = monthlyAmount * tenure;
    
    if (rate === 0) {
      return {
        finalValue: totalInvestment,
        totalInvestment,
        returns: 0
      };
    }
    
    const finalValue = monthlyAmount * (Math.pow(1 + monthlyRate, tenure) - 1) / monthlyRate;
    const returns = finalValue - totalInvestment;
    
    return {
      finalValue: finalValue,
      totalInvestment: totalInvestment,
      returns: returns
    };
  }

  static getLoanCategoryBenefits(category: 'secured' | 'unsecured', type: string): {
    interestRateRange: string;
    maxAmount: string;
    tenure: string;
    taxBenefits: string;
  } {
    const benefits = {
      secured: {
        home: {
          interestRateRange: '8.5% - 12%',
          maxAmount: 'Up to ₹10 Cr',
          tenure: 'Up to 30 years',
          taxBenefits: 'Principal: ₹1.5L, Interest: ₹2L'
        },
        vehicle: {
          interestRateRange: '7% - 15%',
          maxAmount: 'Up to ₹1 Cr',
          tenure: 'Up to 7 years',
          taxBenefits: 'Limited benefits'
        },
        gold: {
          interestRateRange: '10% - 16%',
          maxAmount: 'Up to 75% of gold value',
          tenure: 'Up to 3 years',
          taxBenefits: 'No specific benefits'
        }
      },
      unsecured: {
        personal: {
          interestRateRange: '12% - 24%',
          maxAmount: 'Up to ₹40L',
          tenure: 'Up to 5 years',
          taxBenefits: 'No benefits'
        },
        education: {
          interestRateRange: '9% - 15%',
          maxAmount: 'Up to ₹1.5 Cr',
          tenure: 'Up to 15 years',
          taxBenefits: 'Interest deduction available'
        },
        business: {
          interestRateRange: '11% - 20%',
          maxAmount: 'Up to ₹5 Cr',
          tenure: 'Up to 10 years',
          taxBenefits: 'Business expense deduction'
        }
      }
    };

    const defaultBenefit = {
      interestRateRange: '10% - 18%',
      maxAmount: 'Varies by lender',
      tenure: 'Up to 7 years',
      taxBenefits: 'Limited or no benefits'
    };

    return benefits[category]?.[type as keyof typeof benefits.secured] || defaultBenefit;
  }

  static mergeTopUpLoan(
    originalLoan: LoanParameters,
    topUpAmount: number,
    topUpRate: number,
    topUpTenure: number
  ): LoanCalculationResult {
    const totalAmount = originalLoan.loanAmount + topUpAmount;
    const blendedRate = (
      (originalLoan.loanAmount * originalLoan.interestRate) + 
      (topUpAmount * topUpRate)
    ) / totalAmount;
    
    const mergedParams: LoanParameters = {
      ...originalLoan,
      loanAmount: totalAmount,
      interestRate: blendedRate,
      tenure: Math.max(originalLoan.tenure, topUpTenure),
    };

    return this.calculateLoan(mergedParams);
  }

  static calculateLoan(params: LoanParameters): LoanCalculationResult {
    const disbursedAmount = this.calculateDisbursedAmount(params.loanAmount, {
      processing: params.processingCharges,
      file: params.fileCharges,
      insurance: params.insuranceCharges,
      commission: params.commissionCharges,
    });

    const emi = this.calculateEMI(params.loanAmount, params.interestRate, params.tenure);
    const schedule = this.generateEMISchedule(params.loanAmount, params.interestRate, params.tenure);
    
    const totalRepayment = schedule.reduce((sum, item) => sum + item.emi, 0);
    const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);
    const totalPrincipal = schedule.reduce((sum, item) => sum + item.principal, 0);
    
    const taxBenefits = this.isEligibleForTaxBenefits(params.loanType) 
      ? this.calculateTaxBenefits(totalPrincipal, totalInterest) 
      : 0;
    const effectiveInterestRate = (totalInterest / params.loanAmount) * 100;

    return {
      emi,
      totalRepayment: totalRepayment,
      totalInterest: totalInterest,
      disbursedAmount,
      schedule,
      taxBenefits: taxBenefits,
      effectiveInterestRate: effectiveInterestRate,
    };
  }

  static calculateTenureFromEMI(principal: number, rate: number, emi: number): number {
    const monthlyRate = rate / (12 * 100);
    
    if (rate === 0) return Math.ceil(principal / emi);
    if (emi <= principal * monthlyRate) return 480; // Max tenure if EMI is too low
    
    const tenure = Math.log(1 + (principal * monthlyRate) / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate);
    return Math.max(1, Math.min(480, Math.ceil(tenure)));
  }
}