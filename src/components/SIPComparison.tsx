import React, { useState } from 'react';
import { TrendingUp, PiggyBank, BarChart3, Calculator, RotateCcw } from 'lucide-react';

interface SIPComparisonProps {}

export const SIPComparison: React.FC<SIPComparisonProps> = () => {
  // Independent state for SIP comparison
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [emi, setEmi] = useState<number>(0);
  const [tenure, setTenure] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [sipRate, setSipRate] = useState<number>(12);
  const [compoundingFrequency, setCompoundingFrequency] = useState<'monthly' | 'quarterly' | 'half-yearly' | 'annually'>('monthly');
  const [inflationRate, setInflationRate] = useState<number>(6);
  
  const totalRepayment = emi * tenure;
  const getCompoundingPeriods = () => {
    switch (compoundingFrequency) {
      case 'monthly': return 12;
      case 'quarterly': return 4;
      case 'half-yearly': return 2;
      case 'annually': return 1;
      default: return 12;
    }
  };

  const calculateSIP = () => {
    const periodsPerYear = getCompoundingPeriods();
    const monthlyRate = sipRate / (12 * 100);
    const totalInvestment = emi * tenure;
    
    if (sipRate === 0) {
      return {
        finalValue: totalInvestment,
        totalInvestment,
        returns: 0
      };
    }
    
    const finalValue = emi * (Math.pow(1 + monthlyRate, tenure) - 1) / monthlyRate;
    const returns = finalValue - totalInvestment;
    
    return {
      finalValue: Math.round(finalValue),
      totalInvestment: Math.round(totalInvestment),
      returns: Math.round(returns)
    };
  };

  const sipResult = calculateSIP();
  const years = Math.ceil(tenure / 12);
  
  // Calculate inflation-adjusted values
  const calculateInflationAdjustedValue = (amount: number, years: number, rate: number) => {
    return amount * Math.pow(1 + rate / 100, years);
  };
  
  const loanInflationAdjusted = calculateInflationAdjustedValue(totalRepayment, years, inflationRate);
  const sipInflationAdjusted = calculateInflationAdjustedValue(sipResult.finalValue, years, inflationRate);
  
  const advantage = sipResult.finalValue - totalRepayment;
  const inflationAdjustedAdvantage = sipInflationAdjusted - loanInflationAdjusted;

  const resetToDefaults = () => {
    setLoanAmount(0);
    setEmi(0);
    setTenure(0);
    setInterestRate(0);
    setSipRate(12);
    setCompoundingFrequency('monthly');
    setInflationRate(6);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">SIP vs Loan Comparison</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={loanAmount || ''}
                onChange={(e) => setLoanAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
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
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
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
                className="w-full px-4 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="72"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Months</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loan Interest Rate</label>
            <div className="relative">
              <input
                type="number"
                value={interestRate || ''}
                onChange={(e) => setInterestRate(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full px-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="12.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">SIP Return Rate</label>
            <div className="relative">
              <input
                type="number"
                value={sipRate || ''}
                onChange={(e) => setSipRate(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                min="1"
                max="30"
                className="w-full px-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="12.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Compounding Frequency
            </label>
            <select
              value={compoundingFrequency}
              onChange={(e) => setCompoundingFrequency(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half Yearly</option>
              <option value="annually">Annually</option>
            </select>
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
                className="w-full px-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="6.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loan Scenario */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-red-600" />
              Taking Loan
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-red-700 mb-1">Loan Amount</div>
                  <div className="text-lg font-bold text-red-800">₹{loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-red-700 mb-1">Monthly EMI</div>
                  <div className="text-lg font-bold text-red-800">₹{emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-red-700 mb-1">Interest Rate</div>
                  <div className="text-lg font-bold text-red-800">{interestRate.toFixed(2)}%</div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-red-700 mb-1">Tenure</div>
                  <div className="text-lg font-bold text-red-800">{tenure} Months</div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-red-700 mb-1">Total Repayment</div>
                  <div className="text-lg font-bold text-red-800">₹{totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-red-700 mb-1">Inflation Adjusted</div>
                  <div className="text-lg font-bold text-red-800">₹{loanInflationAdjusted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          </div>

          {/* SIP Scenario */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Investing in SIP
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700 mb-1">Total Investment</div>
                  <div className="text-lg font-bold text-green-800">₹{sipResult.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700 mb-1">Monthly Investment</div>
                  <div className="text-lg font-bold text-green-800">₹{emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700 mb-1">Expected Return</div>
                  <div className="text-lg font-bold text-green-800">{sipRate.toFixed(2)}%</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700 mb-1">Returns Earned</div>
                  <div className="text-lg font-bold text-green-800">₹{sipResult.returns.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700 mb-1">Final Value</div>
                  <div className="text-lg font-bold text-green-800">₹{sipResult.finalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700 mb-1">Inflation Adjusted</div>
                  <div className="text-lg font-bold text-green-800">₹{sipInflationAdjusted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Result */}
        <div className={`rounded-xl p-6 border-2 ${
          advantage > 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="text-center">
            <h4 className={`font-bold text-lg mb-2 ${
              advantage > 0 ? 'text-green-800' : 'text-red-800'
            }`}>
              {advantage > 0 ? 'SIP Investment Advantage' : 'Loan is Better Choice'}
            </h4>
            <p className={`text-2xl font-bold ${
              advantage > 0 ? 'text-green-800' : 'text-red-800'
            }`}>
              ₹{Math.abs(advantage).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-lg font-medium mt-2 ${
              inflationAdjustedAdvantage > 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              Inflation Adjusted: ₹{Math.abs(inflationAdjustedAdvantage).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-sm mt-2 ${
              advantage > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {advantage > 0 
                ? 'You could earn more by investing the EMI amount in SIP'
                : 'Taking the loan is financially better than investing the EMI amount'
              }
            </p>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-blue-800">📊 Detailed Analysis Summary</h4>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Loan Details:</p>
                <p>• Loan Amount: ₹{loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Interest Rate: {interestRate.toFixed(2)}% p.a.</p>
                <p>• Monthly EMI: ₹{emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Total Repayment: ₹{totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Total Interest: ₹{(totalRepayment - loanAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="font-medium mb-1">SIP Details:</p>
                <p>• Monthly Investment: ₹{emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Expected Return: {sipRate}% p.a.</p>
                <p>• Total Investment: ₹{sipResult.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Final Value: ₹{sipResult.finalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Returns Earned: ₹{sipResult.returns.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p>• Investment Period: {Math.ceil(tenure / 12)} years ({tenure} months)</p>
              <p>• Compounding: {compoundingFrequency.charAt(0).toUpperCase() + compoundingFrequency.slice(1)}</p>
              <p>• Inflation Rate: {inflationRate}% per annum</p>
              <p>• Net Advantage: ₹{Math.abs(advantage).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {advantage > 0 ? '(SIP Better)' : '(Loan Better)'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};