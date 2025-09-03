import React from 'react';
import { Calculator, Percent, Calendar, FileText, Shield, CreditCard } from 'lucide-react';
import { LoanParameters } from '../types/loan';

interface LoanInputsProps {
  params: LoanParameters;
  onChange: (params: LoanParameters) => void;
}

// Loan Type Section (Left side - 60%)
export const LoanTypeSection: React.FC<LoanInputsProps> = ({ params, onChange }) => {
  const updateParam = (key: keyof LoanParameters, value: number | string) => {
    onChange({ ...params, [key]: value });
  };

  const loanTypes = [
    { value: 'home', label: 'Home Loan', icon: '🏠' },
    { value: 'personal', label: 'Personal Loan', icon: '👤' },
    { value: 'vehicle', label: 'Vehicle Loan', icon: '🚗' },
    { value: 'business', label: 'Business Loan', icon: '💼' },
    { value: 'gold', label: 'Gold Loan', icon: '🥇' },
    { value: 'education', label: 'Education Loan', icon: '🎓' },
    { value: 'health', label: 'Health Loan', icon: '🏥' },
    { value: 'marriage', label: 'Marriage Loan', icon: '💒' },
    { value: 'travel', label: 'Travel Loan', icon: '✈️' },
    { value: 'other', label: 'Other Loan', icon: '📋' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Loan Type</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {loanTypes.map((type) => (
          <label key={type.value} className="relative cursor-pointer">
            <input
              type="radio"
              name="loanType"
              value={type.value}
              checked={params.loanType === type.value}
              onChange={(e) => updateParam('loanType', e.target.value)}
              className="sr-only"
            />
            <div className={`p-3 rounded-xl border-2 transition-all duration-200 ${
              params.loanType === type.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
            }`}>
              <div className="text-center">
                <div className="text-lg mb-1">{type.icon}</div>
                <div className="text-xs font-medium">{type.label}</div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

// Loan Category Section (Right top - 40%)
export const LoanCategorySection: React.FC<LoanInputsProps> = ({ params, onChange }) => {
  const updateParam = (key: keyof LoanParameters, value: string) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Loan Category</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {['secured', 'unsecured'].map((category) => (
          <label key={category} className="relative cursor-pointer">
            <input
              type="radio"
              name="loanCategory"
              value={category}
              checked={params.loanCategory === category}
              onChange={(e) => updateParam('loanCategory', e.target.value)}
              className="sr-only"
            />
            <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              params.loanCategory === category
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
            }`}>
              <div className="text-center">
                <div className="font-medium capitalize">{category} Loan</div>
                <div className="text-sm opacity-75 mt-1">
                  {category === 'secured' ? 'Backed by collateral' : 'No collateral'}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

// Interest Type Section (Right bottom - 40%)
export const InterestTypeSection: React.FC<LoanInputsProps> = ({ params, onChange }) => {
  const updateParam = (key: keyof LoanParameters, value: string) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Percent className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Interest Type</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {['fixed', 'floating'].map((type) => (
          <label key={type} className="relative cursor-pointer">
            <input
              type="radio"
              name="interestType"
              value={type}
              checked={params.interestType === type}
              onChange={(e) => updateParam('interestType', e.target.value)}
              className="sr-only"
            />
            <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              params.interestType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
            }`}>
              <div className="text-center">
                <div className="font-medium capitalize">{type} Rate</div>
                <div className="text-sm opacity-75 mt-1">
                  {type === 'fixed' ? 'Rate stays constant' : 'Rate can change'}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

// Separate component for Basic Loan Details
export const BasicLoanDetails: React.FC<LoanInputsProps> = ({ params, onChange }) => {
  const updateParam = (key: keyof LoanParameters, value: number | string | boolean) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 4. Basic Loan Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Basic Loan Details</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={params.loanAmount || ''}
                onChange={(e) => updateParam('loanAmount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                max={10000000}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="25,00,000.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Interest Rate</label>
            <div className="relative">
              <input
                type="number"
                value={params.interestRate || ''}
                onChange={(e) => updateParam('interestRate', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step={0.1}
                max={30}
                className="w-full px-4 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="8.50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tenure</label>
            <div className="relative">
              <input
                type="number"
                value={params.tenure || ''}
                onChange={(e) => updateParam('tenure', e.target.value === '' ? 0 : parseInt(e.target.value))}
                max={480}
                className="w-full px-4 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="240"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Months</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={params.eligibleForTaxDeduction}
                onChange={(e) => updateParam('eligibleForTaxDeduction', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">This Loan is Eligible for Tax Deduction</span>
            </label>
          </div>
        </div>
      </div>

      {/* 5. Additional Charges */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Additional Charges</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Processing Charges</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={params.processingCharges || ''}
                onChange={(e) => updateParam('processingCharges', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="25,000.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">File Charges</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={params.fileCharges || ''}
                onChange={(e) => updateParam('fileCharges', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="5,000.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Insurance Charges</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={params.insuranceCharges || ''}
                onChange={(e) => updateParam('insuranceCharges', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="15,000.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Commission Charges</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={params.commissionCharges || ''}
                onChange={(e) => updateParam('commissionCharges', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="10,000.00"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};