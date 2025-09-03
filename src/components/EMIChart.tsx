import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { LoanCalculationResult } from '../types/loan';

interface EMIChartProps {
  result: LoanCalculationResult;
}

export const EMIChart: React.FC<EMIChartProps> = ({ result }) => {
  const pieData = [
    { name: 'Principal', value: result.totalRepayment - result.totalInterest, color: '#3b82f6' },
    { name: 'Interest', value: result.totalInterest, color: '#ef4444' },
  ];

  const yearlyData = result.schedule.reduce((acc, item, index) => {
    const year = Math.floor(index / 12) + 1;
    const existing = acc.find(d => d.year === year);
    
    if (existing) {
      existing.principal += item.principal;
      existing.interest += item.interest;
    } else {
      acc.push({
        year,
        principal: item.principal,
        interest: item.interest,
      });
    }
    
    return acc;
  }, [] as Array<{ year: number; principal: number; interest: number; }>);

  const COLORS = ['#3b82f6', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium">{`Year ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ₹${entry.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Breakdown</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600 text-center">Principal vs Interest</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Yearly Bar Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600 text-center">Yearly Payment Breakdown</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(2)}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="principal" stackId="a" fill="#3b82f6" name="Principal" radius={[0, 0, 4, 4]} />
                <Bar dataKey="interest" stackId="a" fill="#ef4444" name="Interest" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};