import React from 'react';
import { TrendingUp, Calendar, PiggyBank, Shield, Calculator, Building, FileText } from 'lucide-react';
import { LoanCalculationResult } from '../types/loan';
import { LoanCalculator } from '../utils/loanCalculator';

interface LoanSummaryProps {
  result: LoanCalculationResult;
  loanAmount: number;
  loanCategory: string;
  loanType: string;
  eligibleForTaxDeduction: boolean;
  params: LoanParameters;
}

export const LoanSummary: React.FC<LoanSummaryProps> = ({ result, loanAmount, loanCategory, loanType, eligibleForTaxDeduction, params }) => {
  const getLoanTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      home: '🏠',
      vehicle: '🚗',
      gold: '🥇',
      education: '🎓',
      travel: '✈️',
      marriage: '💒',
      business: '💼',
      personal: '👤',
      health: '🏥',
      other: '📋',
    };
    return icons[type] || '📋';
  };

  const totalCharges = result.totalRepayment - loanAmount - result.totalInterest;
  const actualTotalCharges = params.processingCharges + params.fileCharges + params.insuranceCharges + params.commissionCharges;

  const summaryItems = [
    {
      label: 'Loan Detail',
      value: `${getLoanTypeIcon(loanType)} ${loanType.charAt(0).toUpperCase() + loanType.slice(1)}`,
      icon: Building,
      color: 'slate',
      description: `${loanCategory.charAt(0).toUpperCase() + loanCategory.slice(1)} loan`
    },
    {
      label: 'Disbursement Amount',
      value: `₹${result.disbursedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: () => <span className="text-lg font-bold">₹</span>,
      color: 'green',
      description: 'Amount you receive'
    },
    {
      label: 'Monthly EMI',
      value: `₹${result.emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Calculator,
      color: 'blue',
      description: 'Fixed monthly payment'
    },
    {
      label: 'Total Charges Paid',
      value: `₹${actualTotalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FileText,
      color: 'red',
      description: 'Processing & other charges'
    },
    {
      label: 'Total Interest Paid',
      value: `₹${result.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'orange',
      description: 'Total interest paid'
    },
    {
      label: 'Total Repayment',
      value: `₹${result.totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: PiggyBank,
      color: 'purple',
      description: 'Total amount to be paid'
    },
    {
      label: 'Effective Loan Rate',
      value: `${result.effectiveInterestRate.toFixed(2)}%`,
      icon: Calendar,
      color: 'indigo',
      description: 'Including all charges'
    }
  ];

  // Add tax benefits only for eligible loans
  if (eligibleForTaxDeduction && LoanCalculator.isEligibleForTaxBenefits(loanType)) {
    summaryItems.splice(6, 0, {
      label: 'Tax Benefits',
      value: `₹${result.taxBenefits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Shield,
      color: 'emerald',
      description: 'Annual tax savings'
    });
  } else {
    summaryItems.splice(6, 0, {
      label: 'Tax Benefits',
      value: '₹0',
      icon: Shield,
      color: 'gray',
      description: 'Not applicable'
    });
  }

  const getColorClasses = (color: string) => {
    const colors = {
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[color as keyof typeof colors] || colors.slate;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Loan Dashboard</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(item.color)}`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
            <p className="text-lg font-bold text-gray-900 break-words">{item.value}</p>
            <p className="text-xs text-gray-500">{item.description}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};