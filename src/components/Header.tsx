import React from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Indian Loan Calculator</h1>
            <p className="text-blue-100 text-lg">Calculate EMIs, plan prepayments, and optimize your loan strategy</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Smart Calculations</span>
            </div>
            <p className="text-blue-100 text-sm mt-2">Advanced EMI, prepayment & tax benefit calculations</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5" />
              <span className="font-medium">Dynamic Adjustments</span>
            </div>
            <p className="text-blue-100 text-sm mt-2">Real-time parameter adjustments with visual feedback</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Export Ready</span>
            </div>
            <p className="text-blue-100 text-sm mt-2">Download detailed schedules in PDF or CSV format</p>
          </div>
        </div>
      </div>
    </div>
  );
};