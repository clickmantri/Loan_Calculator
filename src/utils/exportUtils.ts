import jsPDF from 'jspdf';
import { LoanCalculationResult, EMIScheduleItem } from '../types/loan';

export class ExportUtils {
  static exportToPDF(result: LoanCalculationResult, loanAmount: number): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Loan EMI Schedule', 20, 30);
    
    // Loan Summary
    doc.setFontSize(12);
    doc.text(`Loan Amount: ₹${loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 50);
    doc.text(`EMI: ₹${result.emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 60);
    doc.text(`Total Interest: ₹${result.totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 70);
    doc.text(`Total Repayment: ₹${result.totalRepayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, 80);
    
    // Schedule Header
    doc.setFontSize(10);
    doc.text('Month', 20, 100);
    doc.text('EMI', 45, 100);
    doc.text('Principal', 70, 100);
    doc.text('Interest', 95, 100);
    doc.text('Balance', 120, 100);
    
    // Schedule Data
    result.schedule.slice(0, 50).forEach((item, index) => {
      const y = 110 + (index * 5);
      if (y > 280) return; // Page limit
      
      doc.text(item.month.toString(), 20, y);
      doc.text(`₹${item.emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 45, y);
      doc.text(`₹${item.principal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 70, y);
      doc.text(`₹${item.interest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 95, y);
      doc.text(`₹${item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 120, y);
    });
    
    doc.save('loan-schedule.pdf');
  }

  static exportToCSV(result: LoanCalculationResult): void {
    const headers = ['Month', 'EMI', 'Principal', 'Interest', 'Remaining Balance', 'Cumulative Interest'];
    
    const csvContent = [
      headers.join(','),
      ...result.schedule.map(item => [
        item.month,
        item.emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.principal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.interest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        item.cumulativeInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loan-schedule.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}