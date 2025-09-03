import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { EMIScheduleItem } from '../types/loan';
import { ExportUtils } from '../utils/exportUtils';

interface AmortizationTableProps {
  schedule: EMIScheduleItem[];
  result: any;
  loanAmount: number;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ 
  schedule, 
  result, 
  loanAmount 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = schedule.slice(startIndex, endIndex);

  const handleExportPDF = () => {
    ExportUtils.exportToPDF(result, loanAmount);
  };

  const handleExportCSV = () => {
    ExportUtils.exportToCSV(result);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Table className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">EMI Schedule</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Month</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">EMI</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">Principal</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">Interest</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">Balance</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.month} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.month}</td>
                <td className="py-3 px-4 text-sm text-gray-700 text-right">₹{item.emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">₹{item.principal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-sm text-red-600 text-right font-medium">₹{item.interest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-3 px-4 text-sm text-gray-700 text-right">₹{item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, schedule.length)} of {schedule.length} payments
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNum = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors duration-200 ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};