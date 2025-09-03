import React, { useState, useEffect } from 'react';
import { PiggyBank, TrendingDown, Clock, Calculator, Settings, RotateCcw, AlertCircle } from 'lucide-react';
import { LoanCalculator } from '../utils/loanCalculator';
import { LoanParameters } from '../types/loan';

interface PrepaymentCalculatorProps {
  params: LoanParameters;
  topUpValues?: {
    newEMI: number;
    newInterestRate: number;
    newTenure: number;
    totalLoanAmount: number;
  } | null;
}

export const PrepaymentCalculator: React.FC<PrepaymentCalculatorProps> = ({ 
  params,
  topUpValues
}) => {
  // Base selection state
  const [baseSelection, setBaseSelection] = useState<'original' | 'topup'>('original');
  
  // Original values from dashboard
  const originalEMI = LoanCalculator.calculateEMI(params.loanAmount, params.interestRate, params.tenure);
  const originalResult = LoanCalculator.calculateLoan(params);
  
  // Get base values based on selection
  const getBaseValues = () => {
    if (baseSelection === 'topup' && topUpValues) {
      const topUpResult = LoanCalculator.calculateLoan({
        ...params,
        loanAmount: topUpValues.totalLoanAmount,
        interestRate: topUpValues.newInterestRate,
        tenure: topUpValues.newTenure
      });
      return {
        baseLoanAmount: topUpValues.totalLoanAmount,
        baseEMI: topUpValues.newEMI,
        baseRate: topUpValues.newInterestRate,
        baseTenure: topUpValues.newTenure,
        baseResult: topUpResult
      };
    }
    return {
      baseLoanAmount: params.loanAmount,
      baseEMI: originalEMI,
      baseRate: params.interestRate,
      baseTenure: params.tenure,
      baseResult: originalResult
    };
  };
  
  const baseValues = getBaseValues();
  
  // Prepayment input states
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(0);
  const [remainingTenure, setRemainingTenure] = useState<number>(0);
  const [prepaymentCharges, setPrepaymentCharges] = useState<number>(0);
  const [reductionType, setReductionType] = useState<'reduce-tenure' | 'reduce-emi'>('reduce-tenure');
  
  // Update remaining tenure when base values change
  useEffect(() => {
    setRemainingTenure(baseValues.baseTenure);
  }, [baseValues.baseTenure]);

  const calculatePrepaymentImpact = () => {
    if (baseValues.baseLoanAmount === 0 || baseValues.baseRate === 0 || baseValues.baseTenure === 0 || lumpSumAmount === 0) {
      return {
        originalTotalInterest: baseValues.baseResult.totalInterest,
        originalTotalRepayment: baseValues.baseResult.totalRepayment,
        newTotalInterest: baseValues.baseResult.totalInterest,
        newTotalRepayment: baseValues.baseResult.totalRepayment,
        interestSaved: 0,
        tenureReduction: 0,
        newEMI: baseValues.baseEMI,
        newTenure: baseValues.baseTenure,
        totalSavings: 0
      };
    }

    // Calculate original schedule
    const originalSchedule = LoanCalculator.generateEMISchedule(
      baseValues.baseLoanAmount,
      baseValues.baseRate,
      baseValues.baseTenure
    );
    const originalTotalInterest = originalSchedule.reduce((sum, item) => sum + item.interest, 0);
    const originalTotalRepayment = originalTotalInterest + baseValues.baseLoanAmount;

    // Calculate with prepayment (assuming prepayment happens at month 1 for simplicity)
    const prepayments = [{
      month: 1,
      amount: lumpSumAmount,
      type: reductionType
    }];

    // Calculate new loan amount after prepayment
    const newLoanAmount = baseValues.baseLoanAmount - lumpSumAmount;
    
    // Calculate new schedule based on reduction type
    let newSchedule;
    let newEMI = baseValues.baseEMI;
    let newTenure = remainingTenure;
    
    if (reductionType === 'reduce-tenure') {
      // Keep EMI same, reduce tenure
      newEMI = baseValues.baseEMI;
      newTenure = LoanCalculator.calculateTenureFromEMI(newLoanAmount, baseValues.baseRate, newEMI);
      newSchedule = LoanCalculator.generateEMISchedule(newLoanAmount, baseValues.baseRate, newTenure);
    } else {
      // Keep tenure same, reduce EMI
      newTenure = remainingTenure;
      newEMI = LoanCalculator.calculateEMI(newLoanAmount, baseValues.baseRate, newTenure);
      newSchedule = LoanCalculator.generateEMISchedule(newLoanAmount, baseValues.baseRate, newTenure);
    }

    const newTotalInterest = newSchedule.reduce((sum, item) => sum + item.interest, 0);
    const newTotalRepayment = newTotalInterest + newLoanAmount;
    const interestSaved = originalTotalInterest - newTotalInterest;
    const tenureReduction = originalSchedule.length - newSchedule.length;
    const totalSavings = interestSaved - prepaymentCharges;

    return {
      originalTotalInterest,
      originalTotalRepayment,
      newTotalInterest,
      newTotalRepayment,
      interestSaved,
      tenureReduction,
      newEMI,
      newTenure: newSchedule.length,
      totalSavings
    };
  };

  const impact = calculatePrepaymentImpact();

  const resetToDefaults = () => {
    setLumpSumAmount(0);
    setRemainingTenure(baseValues.baseTenure);
    setPrepaymentCharges(0);
    setReductionType('reduce-tenure');
  };

  // Don't render if no loan data
  if (params.loanAmount === 0 || params.interestRate === 0 || params.tenure === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Prepayment Calculator</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Please enter loan details above to use the prepayment calculator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Prepayment Calculator</h3>
        </div>
        
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="space-y-8">
        {/* Base Selection */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Choose Base Loan for Prepayment
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative cursor-pointer">
              <input
                type="radio"
                name="baseSelection"
                value="original"
                checked={baseSelection === 'original'}
                onChange={(e) => setBaseSelection(e.target.value as 'original')}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                baseSelection === 'original'
                  ? 'border-blue-500 bg-blue-100 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-medium mb-2">📋 Original Loan</div>
                  <div className="text-sm space-y-1">
                    <div>Amount: ₹{params.loanAmount.toLocaleString('en-IN')}</div>
                    <div>EMI: ₹{originalEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div>Rate: {params.interestRate.toFixed(2)}%</div>
                    <div>Tenure: {params.tenure} months</div>
                  </div>
                </div>
              </div>
            </label>

            <label className={`relative cursor-pointer ${!topUpValues ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                name="baseSelection"
                value="topup"
                checked={baseSelection === 'topup'}
                onChange={(e) => topUpValues && setBaseSelection(e.target.value as 'topup')}
                disabled={!topUpValues}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                baseSelection === 'topup' && topUpValues
                  ? 'border-green-500 bg-green-100 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-medium mb-2">✨ Top-up Loan</div>
                  {topUpValues ? (
                    <div className="text-sm space-y-1">
                      <div>Amount: ₹{topUpValues.totalLoanAmount.toLocaleString('en-IN')}</div>
                      <div>EMI: ₹{topUpValues.newEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div>Rate: {topUpValues.newInterestRate.toFixed(2)}%</div>
                      <div>Tenure: {topUpValues.newTenure} months</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No top-up values available
                    </div>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Current Loan Summary */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            📊 Selected Loan Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Loan Amount</div>
              <div className="text-lg font-bold text-gray-900">₹{baseValues.baseLoanAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Current EMI</div>
              <div className="text-lg font-bold text-gray-900">₹{baseValues.baseEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Interest Rate</div>
              <div className="text-lg font-bold text-gray-900">{baseValues.baseRate.toFixed(2)}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Remaining Tenure</div>
              <div className="text-lg font-bold text-gray-900">{baseValues.baseTenure} months</div>
            </div>
          </div>
        </div>

        {/* Prepayment Input Fields */}
        <div className="space-y-6">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            💰 Prepayment Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Lump Sum Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={lumpSumAmount || ''}
                  onChange={(e) => setLumpSumAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="1000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="2,00,000.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Remaining Loan Tenure
              </label>
              <input
                type="number"
                value={remainingTenure || ''}
                onChange={(e) => setRemainingTenure(e.target.value === '' ? 0 : parseInt(e.target.value))}
                min={1}
                max={baseValues.baseTenure}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder={baseValues.baseTenure.toString()}
              />
              <div className="text-xs text-gray-500">Months remaining for loan repayment</div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prepayment Charges
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={prepaymentCharges || ''}
                  onChange={(e) => setPrepaymentCharges(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="100"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="5,000.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reduction Type
              </label>
              <select
                value={reductionType}
                onChange={(e) => setReductionType(e.target.value as 'reduce-tenure' | 'reduce-emi')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="reduce-tenure">Reduce Tenure</option>
                <option value="reduce-emi">Reduce EMI</option>
              </select>
            </div>
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="space-y-6">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            📊 Prepayment Impact Analysis
          </h4>

          {/* Before vs After Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before Prepayment */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-700 flex items-center gap-2 text-center">
                📋 Before Prepayment
              </h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600 mb-1">Current EMI</div>
                    <div className="text-xl font-bold text-red-800">₹{baseValues.baseEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600 mb-1">Total Interest</div>
                    <div className="text-xl font-bold text-red-800">₹{impact.originalTotalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600 mb-1">Total Repayment</div>
                    <div className="text-xl font-bold text-red-800">₹{impact.originalTotalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600 mb-1">Loan Tenure</div>
                    <div className="text-xl font-bold text-red-800">{baseValues.baseTenure} months</div>
                  </div>
                </div>
              </div>
            </div>

            {/* After Prepayment */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-700 flex items-center gap-2 text-center">
                ✨ After Prepayment
              </h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600 mb-1">
                      {reductionType === 'reduce-emi' ? 'New EMI' : 'Same EMI'}
                    </div>
                    <div className="text-xl font-bold text-green-800">₹{impact.newEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600 mb-1">New Total Interest</div>
                    <div className="text-xl font-bold text-green-800">₹{impact.newTotalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600 mb-1">New Total Repayment</div>
                    <div className="text-xl font-bold text-green-800">₹{(impact.newTotalRepayment + lumpSumAmount + prepaymentCharges).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600 mb-1">New Tenure</div>
                    <div className="text-xl font-bold text-green-800">{impact.newTenure} months</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Interest Saved</span>
              </div>
              <p className="text-xl font-bold text-green-800">₹{impact.interestSaved.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Tenure Reduction</span>
              </div>
              <p className="text-xl font-bold text-blue-800">{impact.tenureReduction} months</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Net Savings</span>
              </div>
              <p className={`text-xl font-bold ${impact.totalSavings >= 0 ? 'text-purple-800' : 'text-red-800'}`}>
                ₹{impact.totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-4">📋 Detailed Prepayment Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-700">
              <div className="space-y-2">
                <p><strong>Prepayment Details:</strong></p>
                <p>• Lump Sum Amount: ₹{lumpSumAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Remaining Tenure: {remainingTenure} months</p>
                <p>• Prepayment Charges: ₹{prepaymentCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Reduction Type: {reductionType === 'reduce-tenure' ? 'Reduce Tenure' : 'Reduce EMI'}</p>
                
                <p className="pt-2"><strong>Financial Impact:</strong></p>
                <p>• Interest Saved: ₹{impact.interestSaved.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Tenure Reduced: {impact.tenureReduction} months</p>
                <p>• Net Benefit: ₹{impact.totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="space-y-2">
                <p><strong>Before Prepayment:</strong></p>
                <p>• EMI: ₹{baseValues.baseEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Total Interest: ₹{impact.originalTotalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Total Repayment: ₹{impact.originalTotalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Tenure: {baseValues.baseTenure} months</p>
                
                <p className="pt-2"><strong>After Prepayment:</strong></p>
                <p>• EMI: ₹{impact.newEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Total Interest: ₹{impact.newTotalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Total Repayment: ₹{(impact.newTotalRepayment + lumpSumAmount + prepaymentCharges).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Tenure: {impact.newTenure} months</p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 How to Use This Calculator</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• <strong>Step 1:</strong> Select base loan (Original or Top-up) from the options above</p>
              <p>• <strong>Step 2:</strong> Enter the lump sum amount you want to pay against principal</p>
              <p>• <strong>Step 3:</strong> Enter the remaining tenure of your loan</p>
              <p>• <strong>Step 4:</strong> Add any prepayment charges your bank may levy</p>
              <p>• <strong>Step 5:</strong> Select reduction type - reduce tenure to save interest or reduce EMI for cash flow relief</p>
              <p>• <strong>Results:</strong> View the impact analysis to see interest savings and tenure reduction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};