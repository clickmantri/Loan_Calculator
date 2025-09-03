import React, { useState, useEffect } from 'react';
import { Settings, Sliders, RotateCcw, Lightbulb, TrendingUp, TrendingDown, Minus, AlertCircle, Download, Upload } from 'lucide-react';
import { LoanParameters } from '../types/loan';
import { LoanCalculator } from '../utils/loanCalculator';

interface DynamicAdjustmentsProps {
  params: LoanParameters;
  onChange: (params: LoanParameters) => void;
  topUpValues?: {
    newEMI: number;
    newInterestRate: number;
    newTenure: number;
    totalLoanAmount: number;
  };
}

export const DynamicAdjustments: React.FC<DynamicAdjustmentsProps> = ({
  params,
  onChange,
  topUpValues
}) => {
  // Base selection state
  const [baseSelection, setBaseSelection] = useState<'original' | 'topup'>('original');
  
  // Original values from dashboard
  const originalEMI = LoanCalculator.calculateEMI(params.loanAmount, params.interestRate, params.tenure);
  const originalRate = params.interestRate;
  const originalTenure = params.tenure;
  const originalResult = LoanCalculator.calculateLoan({
    ...params,
    loanAmount: params.loanAmount,
    interestRate: params.interestRate,
    tenure: params.tenure
  });
  
  // Get base values based on selection
  const getBaseValues = () => {
    if (baseSelection === 'topup' && topUpValues) {
      return {
        baseEMI: topUpValues.newEMI,
        baseRate: topUpValues.newInterestRate,
        baseTenure: topUpValues.newTenure,
        baseLoanAmount: topUpValues.totalLoanAmount
      };
    }
    return {
      baseEMI: originalEMI,
      baseRate: originalRate,
      baseTenure: originalTenure,
      baseLoanAmount: params.loanAmount
    };
  };
  
  const baseValues = getBaseValues();
  
  // Adjusted values (user inputs)
  const [adjustedEMI, setAdjustedEMI] = useState<number>(baseValues.baseEMI);
  const [adjustedRate, setAdjustedRate] = useState<number>(baseValues.baseRate);
  const [adjustedTenure, setAdjustedTenure] = useState<number>(baseValues.baseTenure);
  
  // Modal states for user choices
  const [showEMIModal, setShowEMIModal] = useState<boolean>(false);
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [showTenureModal, setShowTenureModal] = useState<boolean>(false);
  
  // Pending values for modal decisions
  const [pendingEMI, setPendingEMI] = useState<number>(0);
  const [pendingRate, setPendingRate] = useState<number>(0);
  const [pendingTenure, setPendingTenure] = useState<number>(0);

  // Update adjusted values when base selection or params change
  useEffect(() => {
    const newBaseValues = getBaseValues();
    setAdjustedEMI(newBaseValues.baseEMI);
    setAdjustedRate(newBaseValues.baseRate);
    setAdjustedTenure(newBaseValues.baseTenure);
  }, [baseSelection, params.loanAmount, params.interestRate, params.tenure, topUpValues]);

  // Handle EMI change
  const handleEMIChange = (newEMI: number) => {
    if (newEMI === baseValues.baseEMI) {
      setAdjustedEMI(newEMI);
      return;
    }
    setPendingEMI(newEMI);
    setShowEMIModal(true);
  };

  // Handle Rate change
  const handleRateChange = (newRate: number) => {
    if (newRate === baseValues.baseRate) {
      setAdjustedRate(newRate);
      return;
    }
    setPendingRate(newRate);
    setShowRateModal(true);
  };

  // Handle Tenure change
  const handleTenureChange = (newTenure: number) => {
    if (newTenure === baseValues.baseTenure) {
      setAdjustedTenure(newTenure);
      return;
    }
    setPendingTenure(newTenure);
    setShowTenureModal(true);
  };

  // EMI Modal Actions
  const adjustEMIKeepRate = () => {
    // Calculate new tenure based on new EMI and current rate
    const newTenure = calculateTenureFromEMI(pendingEMI, adjustedRate);
    setAdjustedEMI(pendingEMI);
    setAdjustedTenure(newTenure);
    setShowEMIModal(false);
  };

  const adjustEMIKeepTenure = () => {
    // Calculate new rate based on new EMI and current tenure
    const newRate = calculateRateFromEMI(pendingEMI, adjustedTenure);
    setAdjustedEMI(pendingEMI);
    setAdjustedRate(newRate);
    setShowEMIModal(false);
  };

  // Rate Modal Actions
  const adjustRateKeepEMI = () => {
    // Calculate new tenure based on new rate and current EMI
    const newTenure = calculateTenureFromEMI(adjustedEMI, pendingRate);
    setAdjustedRate(pendingRate);
    setAdjustedTenure(newTenure);
    setShowRateModal(false);
  };

  const adjustRateKeepTenure = () => {
    // Calculate new EMI based on new rate and current tenure
    const newEMI = LoanCalculator.calculateEMI(params.loanAmount, pendingRate, adjustedTenure);
    setAdjustedRate(pendingRate);
    setAdjustedEMI(newEMI);
    setShowRateModal(false);
  };

  // Tenure Modal Actions
  const adjustTenureKeepEMI = () => {
    // Calculate new rate based on new tenure and current EMI
    const newRate = calculateRateFromEMI(adjustedEMI, pendingTenure);
    setAdjustedTenure(pendingTenure);
    setAdjustedRate(newRate);
    setShowTenureModal(false);
  };

  const adjustTenureKeepRate = () => {
    // Calculate new EMI based on new tenure and current rate
    const newEMI = LoanCalculator.calculateEMI(params.loanAmount, adjustedRate, pendingTenure);
    setAdjustedTenure(pendingTenure);
    setAdjustedEMI(newEMI);
    setShowTenureModal(false);
  };

  // Helper function to calculate tenure from EMI and rate
  const calculateTenureFromEMI = (emi: number, rate: number): number => {
    const principal = baseValues.baseLoanAmount;
    const monthlyRate = rate / (12 * 100);
    
    if (rate === 0) return Math.ceil(principal / emi);
    if (emi <= principal * monthlyRate) return 480; // Max tenure if EMI is too low
    
    const tenure = Math.log(1 + (principal * monthlyRate) / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate);
    return Math.max(1, Math.min(480, Math.ceil(tenure)));
  };

  // Helper function to calculate rate from EMI and tenure (using binary search)
  const calculateRateFromEMI = (emi: number, tenure: number): number => {
    const principal = baseValues.baseLoanAmount;
    let low = 0.1;
    let high = 30;
    let mid = 0;
    
    for (let i = 0; i < 100; i++) {
      mid = (low + high) / 2;
      const calculatedEMI = LoanCalculator.calculateEMI(principal, mid, tenure);
      
      if (Math.abs(calculatedEMI - emi) < 1) break;
      
      if (calculatedEMI < emi) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    return Math.max(0.1, Math.min(30, mid));
  };

  // Calculate results
  const baseResult = LoanCalculator.calculateLoan({
    ...params,
    loanAmount: baseValues.baseLoanAmount,
    interestRate: baseValues.baseRate,
    tenure: baseValues.baseTenure
  });
  const adjustedResult = LoanCalculator.calculateLoan({
    ...params,
    loanAmount: baseValues.baseLoanAmount,
    interestRate: adjustedRate,
    tenure: adjustedTenure
  });

  // Calculate differences
  const emiDifference = adjustedEMI - baseValues.baseEMI;
  const rateDifference = adjustedRate - baseValues.baseRate;
  const tenureDifference = adjustedTenure - baseValues.baseTenure;
  const totalInterestDifference = adjustedResult.totalInterest - baseResult.totalInterest;
  const totalRepaymentDifference = adjustedResult.totalRepayment - baseResult.totalRepayment;

  const resetToOriginal = () => {
    setAdjustedEMI(baseValues.baseEMI);
    setAdjustedRate(baseValues.baseRate);
    setAdjustedTenure(baseValues.baseTenure);
  };

  const handleBaseSelectionChange = (newBase: 'original' | 'topup') => {
    setBaseSelection(newBase);
    // Values will be updated by useEffect
  };

  const getDifferenceIcon = (difference: number) => {
    if (difference > 0) return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (difference < 0) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getDifferenceColor = (difference: number, isGoodWhenLower: boolean = true) => {
    if (difference === 0) return 'text-gray-600';
    if (isGoodWhenLower) {
      return difference > 0 ? 'text-red-600' : 'text-green-600';
    } else {
      return difference > 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const formatDifference = (difference: number, prefix: string = '₹', suffix: string = '') => {
    const sign = difference > 0 ? '+' : '';
    return `${sign}${prefix}${Math.abs(difference).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Sliders className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loan Adjustment Calculator</h3>
        </div>
        
        <button
          onClick={resetToOriginal}
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
            Choose Base Values for Adjustment
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative cursor-pointer">
              <input
                type="radio"
                name="baseSelection"
                value="original"
                checked={baseSelection === 'original'}
                onChange={(e) => handleBaseSelectionChange(e.target.value as 'original')}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                baseSelection === 'original'
                  ? 'border-blue-500 bg-blue-100 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-medium mb-2">📋 Original Loan Values</div>
                  <div className="text-sm space-y-1">
                    <div>EMI: ₹{originalEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div>Rate: {originalRate.toFixed(2)}%</div>
                    <div>Tenure: {originalTenure} months</div>
                    <div>Amount: ₹{params.loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                onChange={(e) => topUpValues && handleBaseSelectionChange(e.target.value as 'topup')}
                disabled={!topUpValues}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                baseSelection === 'topup' && topUpValues
                  ? 'border-green-500 bg-green-100 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="font-medium mb-2">✨ Top-up Loan Values</div>
                  {topUpValues ? (
                    <div className="text-sm space-y-1">
                      <div>EMI: ₹{topUpValues.newEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div>Rate: {topUpValues.newInterestRate.toFixed(2)}%</div>
                      <div>Tenure: {topUpValues.newTenure} months</div>
                      <div>Amount: ₹{topUpValues.totalLoanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EMI Adjustment */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              💰 EMI Adjustment
            </h4>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-sm font-medium text-gray-600 mb-1">Base EMI</div>
                <div className="text-lg font-bold text-gray-900">₹{baseValues.baseEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Adjusted EMI</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={adjustedEMI || ''}
                    onChange={(e) => setAdjustedEMI(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    onBlur={(e) => handleEMIChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEMIChange(e.target.value === '' ? 0 : parseFloat((e.target as HTMLInputElement).value));
                      }
                    }}
                    step="100"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                     placeholder={baseValues.baseEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  />
                </div>
              </div>
              
              <div className={`flex items-center gap-2 text-sm font-medium ${getDifferenceColor(emiDifference)}`}>
                {getDifferenceIcon(emiDifference)}
                <span>{formatDifference(emiDifference)}</span>
              </div>
            </div>
          </div>

          {/* Rate Adjustment */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              📈 Interest Rate Adjustment
            </h4>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-sm font-medium text-gray-600 mb-1">Base Rate</div>
                <div className="text-lg font-bold text-gray-900">{baseValues.baseRate.toFixed(2)}%</div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Adjusted Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    value={adjustedRate || ''}
                    onChange={(e) => setAdjustedRate(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    onBlur={(e) => handleRateChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRateChange(e.target.value === '' ? 0 : parseFloat((e.target as HTMLInputElement).value));
                      }
                    }}
                    step="0.1"
                    min="1"
                    max="30"
                    className="w-full px-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                     placeholder={baseValues.baseRate.toFixed(2)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 text-sm font-medium ${getDifferenceColor(rateDifference)}`}>
                {getDifferenceIcon(rateDifference)}
                <span>{formatDifference(rateDifference, '', '%')}</span>
              </div>
            </div>
          </div>

          {/* Tenure Adjustment */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              📅 Tenure Adjustment
            </h4>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-sm font-medium text-gray-600 mb-1">Base Tenure</div>
                <div className="text-lg font-bold text-gray-900">{baseValues.baseTenure} Months</div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Adjusted Tenure</label>
                <div className="relative">
                  <input
                    type="number"
                    value={adjustedTenure || ''}
                    onChange={(e) => setAdjustedTenure(e.target.value === '' ? 0 : parseInt(e.target.value))}
                    onBlur={(e) => handleTenureChange(e.target.value === '' ? 0 : parseInt(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTenureChange(e.target.value === '' ? 0 : parseInt((e.target as HTMLInputElement).value));
                      }
                    }}
                    min="12"
                    max="480"
                    className="w-full px-4 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                     placeholder={baseValues.baseTenure.toString()}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Months</span>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 text-sm font-medium ${getDifferenceColor(tenureDifference)}`}>
                {getDifferenceIcon(tenureDifference)}
                <span>{formatDifference(tenureDifference, '', ' Months')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instruction Message */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-center gap-2">
            <span className="text-blue-600 text-lg">⌨️</span>
            <p className="text-blue-800 font-medium text-center">
              Adjust the Values and Hit Enter
            </p>
          </div>
        </div>

        {/* Comparative Analysis */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Comparative Analysis
          </h4>

          {/* Main Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Parameter</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Base</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Adjusted</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Difference</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">Monthly EMI</td>
                  <td className="py-3 px-4 text-center text-gray-700">₹{baseValues.baseEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-center text-gray-700">₹{adjustedEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className={`py-3 px-4 text-center font-medium ${getDifferenceColor(emiDifference)}`}>
                    {formatDifference(emiDifference, '₹')}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">
                    {adjustedEMI > baseValues.baseEMI ? 'Higher monthly burden' : adjustedEMI < baseValues.baseEMI ? 'Lower monthly burden' : 'No change'}
                  </td>
                </tr>
                
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">Interest Rate</td>
                  <td className="py-3 px-4 text-center text-gray-700">{baseValues.baseRate.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-center text-gray-700">{adjustedRate.toFixed(2)}%</td>
                  <td className={`py-3 px-4 text-center font-medium ${getDifferenceColor(rateDifference)}`}>
                    {formatDifference(rateDifference, '', '%')}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">
                    {rateDifference > 0 ? 'Higher interest cost' : rateDifference < 0 ? 'Lower interest cost' : 'No change'}
                  </td>
                </tr>
                
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">Loan Tenure</td>
                  <td className="py-3 px-4 text-center text-gray-700">{baseValues.baseTenure} months</td>
                  <td className="py-3 px-4 text-center text-gray-700">{adjustedTenure} months</td>
                  <td className={`py-3 px-4 text-center font-medium ${getDifferenceColor(tenureDifference)}`}>
                    {formatDifference(tenureDifference, '', ' months')}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">
                    {tenureDifference > 0 ? 'Longer repayment period' : tenureDifference < 0 ? 'Shorter repayment period' : 'No change'}
                  </td>
                </tr>
                
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">Total Interest</td>
                  <td className="py-3 px-4 text-center text-gray-700">₹{baseResult.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-center text-gray-700">₹{adjustedResult.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className={`py-3 px-4 text-center font-medium ${getDifferenceColor(totalInterestDifference)}`}>
                    {formatDifference(totalInterestDifference, '₹')}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">
                    {totalInterestDifference > 0 ? 'Higher total cost' : totalInterestDifference < 0 ? 'Interest savings' : 'No change'}
                  </td>
                </tr>
                
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">Total Repayment</td>
                  <td className="py-3 px-4 text-center text-gray-700">₹{baseResult.totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 text-center text-gray-700">₹{adjustedResult.totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className={`py-3 px-4 text-center font-medium ${getDifferenceColor(totalRepaymentDifference)}`}>
                    {formatDifference(totalRepaymentDifference, '₹')}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">
                    {totalRepaymentDifference > 0 ? 'Higher total outflow' : totalRepaymentDifference < 0 ? 'Total savings' : 'No change'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-xl p-4 border-2 ${
              totalInterestDifference < 0 ? 'bg-green-50 border-green-200' : 
              totalInterestDifference > 0 ? 'bg-red-50 border-red-200' : 
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-sm font-medium mb-1 ${
                  totalInterestDifference < 0 ? 'text-green-700' : 
                  totalInterestDifference > 0 ? 'text-red-700' : 
                  'text-gray-700'
                }`}>
                  Interest Impact
                </div>
                <div className={`text-xl font-bold ${
                  totalInterestDifference < 0 ? 'text-green-800' :
                  totalInterestDifference > 0 ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  {formatDifference(totalInterestDifference, '₹')}
                </div>
                <div className={`text-xs mt-1 ${
                  totalInterestDifference < 0 ? 'text-green-600' :
                  totalInterestDifference > 0 ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {totalInterestDifference < 0 ? 'You save on interest' :
                   totalInterestDifference > 0 ? 'Additional interest cost' :
                   'No change in interest'}
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border-2 ${
              adjustedEMI < baseValues.baseEMI ? 'bg-green-50 border-green-200' :
              adjustedEMI > baseValues.baseEMI ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-sm font-medium mb-1 ${
                  adjustedEMI < baseValues.baseEMI ? 'text-green-700' :
                  adjustedEMI > baseValues.baseEMI ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  EMI Impact
                </div>
                <div className={`text-xl font-bold ${
                  adjustedEMI < baseValues.baseEMI ? 'text-green-800' :
                  adjustedEMI > baseValues.baseEMI ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  {formatDifference(emiDifference, '₹')}
                </div>
                <div className={`text-xs mt-1 ${
                  adjustedEMI < baseValues.baseEMI ? 'text-green-600' :
                  adjustedEMI > baseValues.baseEMI ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {adjustedEMI < baseValues.baseEMI ? 'Lower monthly burden' :
                   adjustedEMI > baseValues.baseEMI ? 'Higher monthly burden' :
                   'Same monthly payment'}
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border-2 ${
              tenureDifference < 0 ? 'bg-green-50 border-green-200' :
              tenureDifference > 0 ? 'bg-orange-50 border-orange-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-sm font-medium mb-1 ${
                  tenureDifference < 0 ? 'text-green-700' :
                  tenureDifference > 0 ? 'text-orange-700' :
                  'text-gray-700'
                }`}>
                  Tenure Impact
                </div>
                <div className={`text-xl font-bold ${
                  tenureDifference < 0 ? 'text-green-800' :
                  tenureDifference > 0 ? 'text-orange-800' :
                  'text-gray-800'
                }`}>
                  {formatDifference(tenureDifference, '', ' months')}
                </div>
                <div className={`text-xs mt-1 ${
                  tenureDifference < 0 ? 'text-green-600' :
                  tenureDifference > 0 ? 'text-orange-600' :
                  'text-gray-600'
                }`}>
                  {tenureDifference < 0 ? 'Faster loan closure' :
                   tenureDifference > 0 ? 'Extended repayment' :
                   'Same repayment period'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <h5 className="font-medium text-blue-800">Smart Tips</h5>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Shorter Tenure:</strong> Pay higher EMI to save significantly on total interest</p>
            <p>• <strong>Rate Negotiation:</strong> Use this calculator to evaluate offers from different lenders</p>
            <p>• <strong>Optimal Balance:</strong> Find the sweet spot between affordable EMI and total interest cost</p>
          </div>
        </div>
      </div>

      {/* EMI Change Modal */}
      {showEMIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">EMI Adjustment</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You've changed the EMI to ₹{Math.round(pendingEMI).toLocaleString('en-IN')}. 
              Which parameter would you like to adjust to accommodate this change?
            </p>
            <div className="space-y-3">
              <button
                onClick={adjustEMIKeepRate}
                className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-200"
              >
                <div className="font-medium text-blue-800">Keep Interest Rate ({adjustedRate.toFixed(2)}%)</div>
                <div className="text-sm text-blue-600">Adjust tenure to match new EMI</div>
              </button>
              <button
                onClick={adjustEMIKeepTenure}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors duration-200"
              >
                <div className="font-medium text-green-800">Keep Tenure ({adjustedTenure} months)</div>
                <div className="text-sm text-green-600">Adjust interest rate to match new EMI</div>
              </button>
              <button
                onClick={() => setShowEMIModal(false)}
                className="w-full p-3 text-center bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors duration-200"
              >
                <div className="font-medium text-gray-800">Cancel</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Change Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Interest Rate Adjustment</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You've changed the interest rate to {pendingRate.toFixed(2)}%. 
              Which parameter would you like to adjust to accommodate this change?
            </p>
            <div className="space-y-3">
              <button
                onClick={adjustRateKeepEMI}
                className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-200"
              >
                <div className="font-medium text-blue-800">Keep EMI (₹{Math.round(adjustedEMI).toLocaleString('en-IN')})</div>
                <div className="text-sm text-blue-600">Adjust tenure to match new rate</div>
              </button>
              <button
                onClick={adjustRateKeepTenure}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors duration-200"
              >
                <div className="font-medium text-green-800">Keep Tenure ({adjustedTenure} months)</div>
                <div className="text-sm text-green-600">Adjust EMI to match new rate</div>
              </button>
              <button
                onClick={() => setShowRateModal(false)}
                className="w-full p-3 text-center bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors duration-200"
              >
                <div className="font-medium text-gray-800">Cancel</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenure Change Modal */}
      {showTenureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tenure Adjustment</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You've changed the tenure to {pendingTenure} months. 
              Which parameter would you like to adjust to accommodate this change?
            </p>
            <div className="space-y-3">
              <button
                onClick={adjustTenureKeepEMI}
                className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-200"
              >
                <div className="font-medium text-blue-800">Keep EMI (₹{Math.round(adjustedEMI).toLocaleString('en-IN')})</div>
                <div className="text-sm text-blue-600">Adjust interest rate to match new tenure</div>
              </button>
              <button
                onClick={adjustTenureKeepRate}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors duration-200"
              >
                <div className="font-medium text-green-800">Keep Interest Rate ({adjustedRate.toFixed(2)}%)</div>
                <div className="text-sm text-green-600">Adjust EMI to match new tenure</div>
              </button>
              <button
                onClick={() => setShowTenureModal(false)}
                className="w-full p-3 text-center bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors duration-200"
              >
                <div className="font-medium text-gray-800">Cancel</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};