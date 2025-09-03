import React, { useState } from 'react';
import { TrendingUp, Calendar, Calculator, RotateCcw } from 'lucide-react';

interface InflationCalculatorProps {}

export const InflationCalculator: React.FC<InflationCalculatorProps> = () => {
  // Independent state for inflation calculator
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [emi, setEmi] = useState<number>(0);
  const [tenure, setTenure] = useState<number>(0);
  const [inflationRate, setInflationRate] = useState<number>(6);
  
  const totalRepayment = emi * tenure;
  const years = Math.ceil(tenure / 12);
  
  // Calculate inflation-adjusted loan amount (what the loan amount would be worth today)
  const inflationAdjustedLoanAmount = loanAmount * Math.pow(1 + inflationRate / 100, years);
  
  // Calculate inflation-adjusted total repayment (progressive adjustment as EMIs are paid over time)
  const calculateProgressiveInflationAdjustment = () => {
    let totalAdjustedRepayment = 0;
    const monthlyInflationRate = inflationRate / (12 * 100);
    
    for (let month = 1; month <= tenure; month++) {
      const monthsFromStart = month - 1;
      const adjustedEMI = emi * Math.pow(1 + monthlyInflationRate, monthsFromStart);
      totalAdjustedRepayment += adjustedEMI;
    }
    
    return totalAdjustedRepayment;
  };
  
  const inflationAdjustedTotalRepayment = calculateProgressiveInflationAdjustment();
  
  // Real comparison: Inflation-adjusted loan amount vs inflation-adjusted total repayment
  const realCostDifference = inflationAdjustedTotalRepayment - inflationAdjustedLoanAmount;
  const realInterestCost = realCostDifference;

  const resetToDefaults = () => {
    setLoanAmount(0);
    setEmi(0);
    setTenure(0);
    setInflationRate(6);
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Inflation Impact Calculator</h3>
        </div>
        
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={loanAmount || ''}
                onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="20,00,000.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Monthly EMI</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={emi || ''}
                onChange={(e) => setEmi(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="39,100.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loan Tenure</label>
            <div className="relative">
              <input
                type="number"
                value={tenure || ''}
                onChange={(e) => setTenure(e.target.value === '' ? 0 : parseInt(e.target.value))}
                className="w-full px-4 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="72"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Months</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Inflation Rate</label>
            <div className="relative">
              <input
                type="number"
                value={inflationRate || ''}
                onChange={(e) => setInflationRate(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                min="0"
                max="20"
                className="w-full px-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="6.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-5 h-5 text-blue-600 font-bold">₹</span>
              <span className="text-sm font-medium text-blue-700">Original Loan</span>
            </div>
            <p className="text-xl font-bold text-blue-800">₹{loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-blue-600 mt-1">Amount borrowed</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Inflation Adjusted Loan</span>
            </div>
            <p className="text-xl font-bold text-orange-800">₹{inflationAdjustedLoanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-orange-600 mt-1">Today's equivalent value</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Total Repayment</span>
            </div>
            <p className="text-xl font-bold text-purple-800">₹{totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-purple-600 mt-1">Nominal amount paid</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Adjusted Repayment</span>
            </div>
            <p className="text-xl font-bold text-green-800">₹{inflationAdjustedTotalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-green-600 mt-1">Progressive inflation adjusted</p>
          </div>
        </div>

        {/* Real Cost Analysis */}
        <div className={`rounded-xl p-6 border-2 ${
          realInterestCost > 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="text-center">
            <h4 className={`font-bold text-lg mb-2 ${
              realInterestCost > 0 ? 'text-red-800' : 'text-green-800'
            }`}>
              Real Cost After Inflation Adjustment
            </h4>
            <p className={`text-2xl font-bold ${
              realInterestCost > 0 ? 'text-red-800' : 'text-green-800'
            }`}>
              ₹{Math.abs(realInterestCost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-sm mt-2 ${
              realInterestCost > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {realInterestCost > 0 
                ? 'Real cost of borrowing after adjusting both loan amount and repayments for inflation'
                : 'You actually benefited from inflation on this loan'
              }
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">📊 Inflation Impact Analysis</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Loan Period:</strong> {years} years ({tenure} months)</p>
            <p>• <strong>Inflation Rate:</strong> {inflationRate}% per annum</p>
            <p>• <strong>Original Loan Value Today:</strong> ₹{inflationAdjustedLoanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>• <strong>Progressive Repayment Adjustment:</strong> Each EMI adjusted for inflation from payment date</p>
            <p>• <strong>Real Interest Cost:</strong> ₹{realInterestCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (inflation-adjusted)</p>
          </div>
        </div>
      </div>
    </div>
  );
};