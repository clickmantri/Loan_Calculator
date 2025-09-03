import React, { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { LoanTypeSection, LoanCategorySection, InterestTypeSection, BasicLoanDetails } from './components/LoanInputs';
import { LoanSummary } from './components/LoanSummary';
import { EMIChart } from './components/EMIChart';
import { AmortizationTable } from './components/AmortizationTable';
import { PrepaymentCalculator } from './components/PrepaymentCalculator';
import { LoanAssessment } from './components/LoanAssessment';
import { DynamicAdjustments } from './components/DynamicAdjustments';
import { TopUpCalculator } from './components/TopUpCalculator';
import { InflationCalculator } from './components/InflationCalculator';
import { SIPComparison } from './components/SIPComparison';
import { LoanCalculator } from './utils/loanCalculator';
import { LoanParameters } from './types/loan';

const defaultParams: LoanParameters = {
  loanAmount: 0,
  interestRate: 0,
  tenure: 0,
  interestType: '',
  loanCategory: '',
  loanType: '',
  processingCharges: 0,
  fileCharges: 0,
  insuranceCharges: 0,
  commissionCharges: 0,
  eligibleForTaxDeduction: false,
  topUpAmount: 0,
  topUpRate: 0,
  topUpTenure: 0,
  principalPaid: 0,
  tenurePassed: 0,
  topUpCharges: 0,
  topUpChargesType: '',
};

const originalDefaultParams: LoanParameters = {
  loanAmount: 2500000,
  interestRate: 8.5,
  tenure: 240,
  interestType: 'fixed',
  loanCategory: 'secured',
  loanType: 'home',
  processingCharges: 25000,
  fileCharges: 5000,
  insuranceCharges: 15000,
  commissionCharges: 10000,
  eligibleForTaxDeduction: true,
  topUpAmount: 0,
  topUpRate: 8.5,
  topUpTenure: 240,
  principalPaid: 0,
  tenurePassed: 0,
  topUpCharges: 0,
  topUpChargesType: 'upfront',
};

function App() {
  const [params, setParams] = useState<LoanParameters>(defaultParams);
  const [originalParams] = useState<LoanParameters>(originalDefaultParams);
  const [topUpValues, setTopUpValues] = useState<{
    newEMI: number;
    newInterestRate: number;
    newTenure: number;
    totalLoanAmount: number;
  } | null>(null);

  const result = useMemo(() => {
    return LoanCalculator.calculateLoan(params);
  }, [params]);

  const remainingBalance = result.schedule.length > 0 
    ? result.schedule[Math.floor(result.schedule.length / 2)]?.balance || result.schedule[0].balance
    : params.loanAmount;

  const resetToDefaults = () => {
    setParams(defaultParams);
    setTopUpValues(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Reset Button */}
        <div className="flex justify-end">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>

        {/* 1: Loan Type - Full Width */}
        <LoanTypeSection params={params} onChange={setParams} />
        
        {/* 2-3: Loan Category and Interest Type - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoanCategorySection params={params} onChange={setParams} />
          <InterestTypeSection params={params} onChange={setParams} />
        </div>
        
        {/* 4-5: Basic Details and Charges */}
        <BasicLoanDetails params={params} onChange={setParams} />

        {/* 6: Loan Dashboard */}
        <LoanSummary 
          result={result} 
          loanAmount={params.loanAmount}
          loanCategory={params.loanCategory}
          loanType={params.loanType}
          eligibleForTaxDeduction={params.eligibleForTaxDeduction}
          params={params}
        />

        {/* 7: Payment Breakdown */}
        <EMIChart result={result} />

        {/* 8: EMI Schedule */}
        <AmortizationTable
          schedule={result.schedule}
          result={result}
          loanAmount={params.loanAmount}
        />

        {/* 8: Loan Assessment */}
        <LoanAssessment result={result} params={params} />

        {/* 9: Top-up Calculator */}
        <TopUpCalculator
          params={params}
          onTopUpValuesChange={setTopUpValues}
        />

        {/* 10: Dynamic Adjustments */}
        <DynamicAdjustments
          params={params}
          onChange={setParams}
          topUpValues={topUpValues}
        />

        {/* 11: Prepayment Calculator */}
        <PrepaymentCalculator
          params={params}
          topUpValues={topUpValues}
        />

        {/* 12: Inflation Calculator */}
        <InflationCalculator />

        {/* 13: SIP Comparison */}
        <SIPComparison />

      </div>
    </div>
  );
}

export default App;