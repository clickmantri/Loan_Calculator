import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calculator, PiggyBank, DollarSign, Calendar, AlertCircle, RotateCcw, Settings } from 'lucide-react';
import { LoanParameters } from '../types/loan';
import { LoanCalculator } from '../utils/loanCalculator';

interface TopUpValues {
  newEMI: number;
  newInterestRate: number;
  newTenure: number;
  totalLoanAmount: number;
}

interface TopUpCalculatorProps {
  params: LoanParameters;
  onTopUpValuesChange?: (values: TopUpValues | null) => void;
}

export const TopUpCalculator: React.FC<TopUpCalculatorProps> = ({ params, onTopUpValuesChange }) => {
  // Original loan values from dashboard
  const originalEMI = LoanCalculator.calculateEMI(params.loanAmount, params.interestRate, params.tenure);
  const originalSchedule = LoanCalculator.generateEMISchedule(params.loanAmount, params.interestRate, params.tenure);
  
  // User input states with proper initial values
  const [emisPaid, setEmisPaid] = useState<number>(0);
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [topUpCharges, setTopUpCharges] = useState<number>(0);
  const [newTenure, setNewTenure] = useState<number>(params.tenure);
  const [newEMI, setNewEMI] = useState<number>(originalEMI);
  const [newInterestRate, setNewInterestRate] = useState<number>(params.interestRate);

  // Modal states for dynamic adjustments
  const [showEMIModal, setShowEMIModal] = useState<boolean>(false);
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [showTenureModal, setShowTenureModal] = useState<boolean>(false);
  
  // Pending values for modal decisions
  const [pendingEMI, setPendingEMI] = useState<number>(0);
  const [pendingRate, setPendingRate] = useState<number>(0);
  const [pendingTenure, setPendingTenure] = useState<number>(0);

  // Calculate current loan status based on EMIs paid
  const calculateCurrentStatus = () => {
    if (emisPaid === 0 || emisPaid > originalSchedule.length) {
      return {
        principalPaid: 0,
        principalRemaining: params.loanAmount,
        interestPaid: 0,
        interestRemaining: originalSchedule.reduce((sum, item) => sum + item.interest, 0),
        tenureCovered: 0,
        tenureRemaining: params.tenure
      };
    }

    const paidSchedule = originalSchedule.slice(0, emisPaid);
    const principalPaid = paidSchedule.reduce((sum, item) => sum + item.principal, 0);
    const interestPaid = paidSchedule.reduce((sum, item) => sum + item.interest, 0);
    const principalRemaining = params.loanAmount - principalPaid;
    
    const remainingSchedule = originalSchedule.slice(emisPaid);
    const interestRemaining = remainingSchedule.reduce((sum, item) => sum + item.interest, 0);
    const tenureRemaining = params.tenure - emisPaid;

    return {
      principalPaid,
      principalRemaining,
      interestPaid,
      interestRemaining,
      tenureCovered: emisPaid,
      tenureRemaining
    };
  };

  const currentStatus = calculateCurrentStatus();

  // Simple auto-update logic
  useEffect(() => {
    // When EMIs paid changes, update new tenure
    if (emisPaid > 0 && emisPaid <= params.tenure) {
      const remainingTenure = params.tenure - emisPaid;
      setNewTenure(remainingTenure);
    } else {
      setNewTenure(params.tenure);
    }
  }, [emisPaid, params.tenure]);

  // When top-up amount changes, update EMI only if there's a top-up amount
  useEffect(() => {
    if (topUpAmount > 0) {
      const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
      if (totalLoanAmount > 0 && newTenure > 0) {
        const calculatedEMI = LoanCalculator.calculateEMI(totalLoanAmount, newInterestRate, newTenure);
        setNewEMI(calculatedEMI);
      }
    } else {
      // When no top-up, EMI should be same as original for remaining loan
      if (currentStatus.tenureRemaining > 0) {
        const remainingEMI = LoanCalculator.calculateEMI(currentStatus.principalRemaining, params.interestRate, currentStatus.tenureRemaining);
        setNewEMI(remainingEMI);
      } else {
        setNewEMI(originalEMI);
      }
    }
  }, [topUpAmount, currentStatus.principalRemaining, currentStatus.tenureRemaining, newTenure, newInterestRate, params.interestRate, originalEMI]);

  // Send top-up values to parent component whenever they change
  useEffect(() => {
    if (onTopUpValuesChange) {
      if (topUpAmount > 0) {
        onTopUpValuesChange({
          newEMI,
          newInterestRate,
          newTenure,
          totalLoanAmount: currentStatus.principalRemaining + topUpAmount,
        });
      } else {
        onTopUpValuesChange(null);
      }
    }
  }, [newEMI, newInterestRate, newTenure, topUpAmount, currentStatus.principalRemaining, onTopUpValuesChange]);
  // Reset values when params change
  useEffect(() => {
    setNewTenure(params.tenure);
    setNewEMI(originalEMI);
    setNewInterestRate(params.interestRate);
    setEmisPaid(0);
    setTopUpAmount(0);
    setTopUpCharges(0);
  }, [params.loanAmount, params.interestRate, params.tenure, originalEMI]);

  // Handle field changes with automatic adjustments
  const handleTenureChange = (newTenureValue: number) => {
    if (Math.abs(newTenureValue - newTenure) < 1) return;
    setPendingTenure(newTenureValue);
    setShowTenureModal(true);
  };

  const handleEMIChange = (newEMIValue: number) => {
    if (Math.abs(newEMIValue - newEMI) < 1) return;
    setPendingEMI(newEMIValue);
    setShowEMIModal(true);
  };

  const handleRateChange = (newRateValue: number) => {
    if (Math.abs(newRateValue - newInterestRate) < 0.01) return;
    setPendingRate(newRateValue);
    setShowRateModal(true);
  };

  // EMI Modal Actions
  const adjustEMIKeepRate = () => {
    const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
    const newTenureValue = calculateTenureFromEMI(pendingEMI, newInterestRate, totalLoanAmount);
    setNewEMI(pendingEMI);
    setNewTenure(newTenureValue);
    setShowEMIModal(false);
  };

  const adjustEMIKeepTenure = () => {
    const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
    const newRateValue = calculateRateFromEMI(pendingEMI, newTenure, totalLoanAmount);
    setNewEMI(pendingEMI);
    setNewInterestRate(newRateValue);
    setShowEMIModal(false);
  };

  // Tenure Modal Actions
  const adjustTenureKeepEMI = () => {
    const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
    const newRateValue = calculateRateFromEMI(newEMI, pendingTenure, totalLoanAmount);
    setNewTenure(pendingTenure);
    setNewInterestRate(newRateValue);
    setShowTenureModal(false);
  };

  const adjustTenureKeepRate = () => {
    const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
    const newEMIValue = LoanCalculator.calculateEMI(totalLoanAmount, newInterestRate, pendingTenure);
    setNewTenure(pendingTenure);
    setNewEMI(newEMIValue);
    setShowTenureModal(false);
  };

  // Helper function for tenure calculation
  const calculateTenureFromEMI = (emi: number, rate: number, principal: number): number => {
    const monthlyRate = rate / (12 * 100);
    
    if (rate === 0) return Math.ceil(principal / emi);
    if (emi <= principal * monthlyRate) return 480;
    
    const tenure = Math.log(1 + (principal * monthlyRate) / (emi - principal * monthlyRate)) / Math.log(1 + monthlyRate);
    return Math.max(1, Math.min(480, Math.ceil(tenure)));
  };

  const calculateRateFromEMI = (emi: number, tenure: number, principal: number): number => {
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

  // Modal action handlers for Rate
  const adjustRateKeepEMI = () => {
    const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
    const newTenureValue = calculateTenureFromEMI(newEMI, pendingRate, totalLoanAmount);
    setNewInterestRate(pendingRate);
    setNewTenure(newTenureValue);
    setShowRateModal(false);
  };

  const adjustRateKeepTenure = () => {
    const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
    const newEMIValue = LoanCalculator.calculateEMI(totalLoanAmount, pendingRate, newTenure);
    setNewInterestRate(pendingRate);
    setNewEMI(newEMIValue);
    setShowRateModal(false);
  };

  // Calculate top-up details
  const calculateTopUpDetails = () => {
    const totalLoanAmount = currentStatus.principalRemaining + topUpAmount;
    
    if (totalLoanAmount === 0) {
      return {
        newTotalLoanAmount: currentStatus.principalRemaining,
        calculatedEMI: 0,
        newTotalInterest: currentStatus.interestRemaining,
        newTotalRepayment: currentStatus.principalRemaining + currentStatus.interestRemaining,
        actualTenure: currentStatus.tenureRemaining,
        topUpOnlyEMI: 0,
        topUpOnlyInterest: 0,
        separateEMI: 0,
        separateTotalCost: 0
      };
    }

    const calculatedEMI = newEMI;
    
    const newSchedule = LoanCalculator.generateEMISchedule(totalLoanAmount, newInterestRate, newTenure);
    const newTotalInterest = newSchedule.reduce((sum, item) => sum + item.interest, 0);
    const newTotalRepayment = newTotalInterest + totalLoanAmount;

    // Calculate separate loan option
    const originalRemainingEMI = currentStatus.tenureRemaining > 0 
      ? LoanCalculator.calculateEMI(currentStatus.principalRemaining, params.interestRate, currentStatus.tenureRemaining)
      : 0;
    const topUpOnlyEMI = topUpAmount > 0 
      ? LoanCalculator.calculateEMI(topUpAmount, newInterestRate, newTenure)
      : 0;
    const topUpOnlySchedule = topUpAmount > 0 
      ? LoanCalculator.generateEMISchedule(topUpAmount, newInterestRate, newTenure)
      : [];
    const topUpOnlyInterest = topUpOnlySchedule.reduce((sum, item) => sum + item.interest, 0);
    const separateEMI = originalRemainingEMI + topUpOnlyEMI;
    const separateTotalCost = currentStatus.principalRemaining + currentStatus.interestRemaining + topUpAmount + topUpOnlyInterest;

    return {
      newTotalLoanAmount: totalLoanAmount,
      calculatedEMI,
      newTotalInterest,
      newTotalRepayment,
      actualTenure: newTenure,
      topUpOnlyEMI,
      topUpOnlyInterest,
      separateEMI,
      separateTotalCost
    };
  };

  const topUpDetails = calculateTopUpDetails();

  // Reset function
  const resetToDefaults = () => {
    setEmisPaid(0);
    setTopUpAmount(0);
    setTopUpCharges(0);
    setNewTenure(params.tenure);
    setNewEMI(originalEMI);
    setNewInterestRate(params.interestRate);
  };

  // Don't render if no loan data
  if (params.loanAmount === 0 || params.interestRate === 0 || params.tenure === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loan Top-up Calculator</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Please enter loan details above to use the top-up calculator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loan Top-up Calculator</h3>
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
        {/* Original Loan Summary */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            📋 Original Loan Details (Imported from Dashboard)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Loan Amount</div>
              <div className="text-lg font-bold text-gray-900">₹{params.loanAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Interest Rate</div>
              <div className="text-lg font-bold text-gray-900">{params.interestRate.toFixed(2)}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Tenure</div>
              <div className="text-lg font-bold text-gray-900">{params.tenure} months</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Original EMI</div>
              <div className="text-lg font-bold text-gray-900">₹{originalEMI.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-6">
          {/* Row 1: EMIs Paid, Top-up Amount, Top-up Charges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                EMIs Paid So Far
              </label>
              <input
                type="number"
                value={emisPaid || ''}
                onChange={(e) => setEmisPaid(e.target.value === '' ? 0 : parseInt(e.target.value))}
                min={0}
                max={params.tenure}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder=""
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Top-up Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={topUpAmount || ''}
                  onChange={(e) => setTopUpAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder=""
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Top-up Charges
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={topUpCharges || ''}
                  onChange={(e) => setTopUpCharges(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder=""
                />
              </div>
            </div>
          </div>

          {/* Row 2: New Tenure, New EMI, New Interest Rate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Tenure (months)
              </label>
              <input
                type="number"
                value={newTenure}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                placeholder="Enter tenure"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New EMI (Auto-calculated)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={newEMI || ''}
                  readOnly
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                  placeholder="Enter EMI"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Interest Rate (%) - Auto-calculated
              </label>
              <input
                type="number"
                value={newInterestRate || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                placeholder="Enter rate"
              />
            </div>
          </div>

          {/* Instruction Note */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600 text-lg">🔒</span>
              <p className="text-green-800 font-medium text-center">
                New values are auto-calculated based on your inputs above
              </p>
            </div>
          </div>
        </div>

        {/* Current Loan Status - Reorganized into 2 rows */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            📊 Current Loan Status
          </h4>
          
          {/* Row 1: Principal Paid, Interest Paid, Tenure Covered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <PiggyBank className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Principal Paid</span>
              </div>
              <p className="text-xl font-bold text-green-800">₹{currentStatus.principalPaid.toFixed(2)}</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Interest Paid</span>
              </div>
              <p className="text-xl font-bold text-blue-800">₹{currentStatus.interestPaid.toFixed(2)}</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Tenure Covered</span>
              </div>
              <p className="text-xl font-bold text-purple-800">{currentStatus.tenureCovered} months</p>
            </div>
          </div>
          
          {/* Row 2: Principal Left, Interest Left, Tenure Left */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <PiggyBank className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Principal Remaining</span>
              </div>
              <p className="text-xl font-bold text-orange-800">₹{currentStatus.principalRemaining.toFixed(2)}</p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Interest Remaining</span>
              </div>
              <p className="text-xl font-bold text-red-800">₹{currentStatus.interestRemaining.toFixed(2)}</p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Tenure Remaining</span>
              </div>
              <p className="text-xl font-bold text-indigo-800">{currentStatus.tenureRemaining} months</p>
            </div>
          </div>
        </div>

        {/* Top-up Impact Analysis - Always Visible */}
        <div className="space-y-6">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            🔄 Top-up Impact Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before Top-up */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-700 flex items-center gap-2 text-center">
                📋 Current
              </h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-1">Remaining Principal</div>
                    <div className="text-xl font-bold text-gray-800">₹{currentStatus.principalRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-1">Remaining Interest</div>
                    <div className="text-xl font-bold text-gray-800">₹{currentStatus.interestRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-1">Remaining Tenure</div>
                    <div className="text-xl font-bold text-gray-800">{currentStatus.tenureRemaining} months</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-1">Current EMI</div>
                    <div className="text-xl font-bold text-gray-800">₹{(currentStatus.tenureRemaining > 0 
                      ? LoanCalculator.calculateEMI(currentStatus.principalRemaining, params.interestRate, currentStatus.tenureRemaining)
                      : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* After Top-up */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-700 flex items-center gap-2 text-center">
                ✨ New
              </h5>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600 mb-1">New Total Loan</div>
                    <div className="text-xl font-bold text-blue-800">₹{topUpDetails.newTotalLoanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-orange-600 mb-1">New Total Interest</div>
                    <div className="text-xl font-bold text-orange-800">₹{topUpDetails.newTotalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-600 mb-1">New Tenure</div>
                    <div className="text-xl font-bold text-purple-800">{newTenure} months</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600 mb-1">New EMI</div>
                    <div className="text-xl font-bold text-green-800">₹{topUpDetails.calculatedEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top-up Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
            <div className="text-center">
              <h4 className="font-bold text-lg mb-4 text-blue-800">
                📊 Top-up Loan Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-blue-600 mb-1">Top-up Amount</div>
                  <div className="text-xl font-bold text-blue-800">₹{topUpAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-600 mb-1">Top-up Charges</div>
                  <div className="text-xl font-bold text-blue-800">₹{topUpCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-600 mb-1">New EMI</div>
                  <div className="text-xl font-bold text-blue-800">₹{topUpDetails.calculatedEMI.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-600 mb-1">Total Cost</div>
                  <div className="text-xl font-bold text-blue-800">₹{(topUpDetails.newTotalRepayment + topUpCharges).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">💡 Top-up Loan Tips</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Auto-fill:</strong> Remaining tenure auto-fills when you enter EMIs paid</p>
            <p>• <strong>EMI Adjustment:</strong> Use the adjustment button to manually modify parameters</p>
            <p>• <strong>Dynamic Adjustments:</strong> Change any parameter and choose which others to adjust</p>
            <p>• <strong>Eligibility:</strong> Usually available after 12-24 months of regular payments</p>
            <p>• <strong>Interest Rate:</strong> Often lower than personal loans but may be higher than original home loan</p>
            <p>• <strong>Processing:</strong> Faster approval as existing loan performance is considered</p>
            <p>• <strong>Tax Benefits:</strong> May be available if used for home improvement/purchase</p>
          </div>
        </div>
      </div>

      {/* Dynamic Adjustment Modals */}
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
              Adjust the Values and Hit Enter
            </p>
            <div className="space-y-3">
              <button
                onClick={adjustRateKeepEMI}
                className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-200"
              >
                <div className="font-medium text-blue-800">Keep EMI (₹{newEMI.toFixed(2)})</div>
                <div className="text-sm text-blue-600">Adjust tenure to match new rate</div>
              </button>
              <button
                onClick={adjustRateKeepTenure}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors duration-200"
              >
                <div className="font-medium text-green-800">Keep Tenure ({newTenure} months)</div>
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
                <div className="font-medium text-blue-800">Keep Interest Rate ({newInterestRate.toFixed(2)}%)</div>
                <div className="text-sm text-blue-600">Adjust tenure to match new EMI</div>
              </button>
              <button
                onClick={adjustEMIKeepTenure}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors duration-200"
              >
                <div className="font-medium text-green-800">Keep Tenure ({newTenure} months)</div>
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
                <div className="font-medium text-blue-800">Keep EMI (₹{Math.round(newEMI).toLocaleString('en-IN')})</div>
                <div className="text-sm text-blue-600">Adjust interest rate to match new tenure</div>
              </button>
              <button
                onClick={adjustTenureKeepRate}
                className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors duration-200"
              >
                <div className="font-medium text-green-800">Keep Interest Rate ({newInterestRate.toFixed(2)}%)</div>
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