import React, { useState } from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, XCircle, Briefcase, PiggyBank, Heart, Calendar, RotateCcw } from 'lucide-react';
import { LoanParameters, LoanCalculationResult } from '../types/loan';

interface LoanAssessmentProps {
  params: LoanParameters;
  result: LoanCalculationResult;
}

interface FinancialProfile {
  monthlyIncome: number;
  monthlyExpense: number;
  existingEMI: number;
  jobSecurity: 'excellent' | 'good' | 'average' | 'poor' | '';
  emergencyFund: number;
  insuranceCover: number;
}

export const LoanAssessment: React.FC<LoanAssessmentProps> = ({ params, result }) => {
  const [profile, setProfile] = useState<FinancialProfile>({
    monthlyIncome: 0,
    monthlyExpense: 0,
    existingEMI: 0,
    jobSecurity: '',
    emergencyFund: 0,
    insuranceCover: 0,
  });

  const resetProfile = () => {
    setProfile({
      monthlyIncome: 0,
      monthlyExpense: 0,
      existingEMI: 0,
      jobSecurity: '',
      emergencyFund: 0,
      insuranceCover: 0,
    });
  };

  const updateProfile = (key: keyof FinancialProfile, value: number | string) => {
    setProfile({ ...profile, [key]: value });
  };

  const assessLoan = () => {
    const scores = {
      emiAffordability: 0,
      interestRate: 0,
      tenure: 0,
      loanType: 0,
      financialStability: 0,
      riskCoverage: 0,
    };

    let totalScore = 0;
    let maxScore = 0;

    // 1. EMI Affordability (25 points)
    const totalEMI = result.emi + profile.existingEMI;
    const emiRatio = (totalEMI / profile.monthlyIncome) * 100;
    
    if (emiRatio <= 30) scores.emiAffordability = 25;
    else if (emiRatio <= 40) scores.emiAffordability = 20;
    else if (emiRatio <= 50) scores.emiAffordability = 15;
    else if (emiRatio <= 60) scores.emiAffordability = 10;
    else scores.emiAffordability = 0;
    
    maxScore += 25;

    // 2. Interest Rate Assessment (20 points)
    const rateRanges = {
      home: { excellent: 8.5, good: 10, average: 12 },
      vehicle: { excellent: 7, good: 10, average: 15 },
      personal: { excellent: 12, good: 16, average: 20 },
      education: { excellent: 9, good: 12, average: 15 },
      business: { excellent: 11, good: 15, average: 18 },
      gold: { excellent: 10, good: 13, average: 16 },
    };

    const range = rateRanges[params.loanType as keyof typeof rateRanges] || rateRanges.personal;
    
    if (params.interestRate <= range.excellent) scores.interestRate = 20;
    else if (params.interestRate <= range.good) scores.interestRate = 15;
    else if (params.interestRate <= range.average) scores.interestRate = 10;
    else scores.interestRate = 5;
    
    maxScore += 20;

    // 3. Tenure Assessment (15 points)
    const tenureYears = params.tenure / 12;
    const optimalTenure = {
      home: { min: 15, max: 25 },
      vehicle: { min: 3, max: 7 },
      personal: { min: 2, max: 5 },
      education: { min: 5, max: 15 },
      business: { min: 3, max: 10 },
      gold: { min: 1, max: 3 },
    };

    const optimal = optimalTenure[params.loanType as keyof typeof optimalTenure] || optimalTenure.personal;
    
    if (tenureYears >= optimal.min && tenureYears <= optimal.max) scores.tenure = 15;
    else if (tenureYears <= optimal.max + 5) scores.tenure = 10;
    else scores.tenure = 5;
    
    maxScore += 15;

    // 4. Loan Type & Category (15 points)
    if (params.loanCategory === 'secured') {
      if (['home', 'vehicle', 'gold'].includes(params.loanType)) scores.loanType = 15;
      else scores.loanType = 10;
    } else {
      if (['education', 'business'].includes(params.loanType)) scores.loanType = 10;
      else scores.loanType = 5;
    }
    
    maxScore += 15;

    // 5. Financial Stability (15 points)
    const disposableIncome = profile.monthlyIncome - profile.monthlyExpense - totalEMI;
    const stabilityRatio = (disposableIncome / profile.monthlyIncome) * 100;
    
    const jobSecurityScore = {
      excellent: 5,
      good: 4,
      average: 2,
      poor: 0,
    };
    
    let stabilityScore = jobSecurityScore[profile.jobSecurity as keyof typeof jobSecurityScore] || 0;
    
    if (stabilityRatio >= 20) stabilityScore += 10;
    else if (stabilityRatio >= 10) stabilityScore += 7;
    else if (stabilityRatio >= 5) stabilityScore += 5;
    else stabilityScore += 2;
    
    scores.financialStability = Math.min(15, stabilityScore);
    maxScore += 15;

    // 6. Risk Coverage (10 points)
    const emergencyMonths = profile.emergencyFund / (profile.monthlyExpense + totalEMI);
    const insuranceRatio = (profile.insuranceCover / params.loanAmount) * 100;
    
    let riskScore = 0;
    if (emergencyMonths >= 6) riskScore += 5;
    else if (emergencyMonths >= 3) riskScore += 3;
    else if (emergencyMonths >= 1) riskScore += 1;
    
    if (insuranceRatio >= 100) riskScore += 5;
    else if (insuranceRatio >= 50) riskScore += 3;
    else if (insuranceRatio >= 25) riskScore += 1;
    
    scores.riskCoverage = riskScore;
    maxScore += 10;

    totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const percentage = (totalScore / maxScore) * 100;

    return {
      scores,
      totalScore,
      maxScore,
      percentage,
      emiRatio,
      disposableIncome,
      emergencyMonths,
      insuranceRatio,
    };
  };

  const assessment = assessLoan();

  const getLoanGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: 'Excellent', color: 'green', icon: CheckCircle };
    if (percentage >= 65) return { grade: 'Good', color: 'blue', icon: CheckCircle };
    if (percentage >= 50) return { grade: 'Average', color: 'yellow', icon: AlertTriangle };
    if (percentage >= 35) return { grade: 'Poor', color: 'orange', icon: AlertTriangle };
    return { grade: 'Very Poor', color: 'red', icon: XCircle };
  };

  const gradeInfo = getLoanGrade(assessment.percentage);

  const getRecommendations = () => {
    const recommendations = [];
    
    if (assessment.emiRatio > 50) {
      recommendations.push('🚨 EMI ratio is too high. Consider reducing loan amount or increasing tenure.');
    }
    
    if (assessment.scores.interestRate < 15) {
      recommendations.push('💡 Try negotiating for a better interest rate with your bank.');
    }
    
    if (assessment.emergencyMonths < 3) {
      recommendations.push('⚠️ Build an emergency fund of at least 3-6 months expenses before taking this loan.');
    }
    
    if (assessment.insuranceRatio < 50) {
      recommendations.push('🛡️ Consider adequate life insurance coverage to protect your family.');
    }
    
    if (profile.jobSecurity === 'poor' || profile.jobSecurity === 'average') {
      recommendations.push('💼 Improve job security or consider a smaller loan amount.');
    }
    
    if (assessment.disposableIncome < 5000) {
      recommendations.push('💰 Ensure sufficient disposable income for unexpected expenses.');
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Don't render if no loan data
  if (params.loanAmount === 0 || params.interestRate === 0 || params.tenure === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loan Assessment</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Please enter loan details above to test loan quality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Loan Assessment Test</h3>
        </div>
        
        <button
          onClick={resetProfile}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="space-y-8">
        {/* Financial Profile Inputs */}
        <div className="space-y-6">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            📊 Your Financial Profile
          </h4>
          
          {/* Row 1: Income, Expenses, Existing EMI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={profile.monthlyIncome || ''}
                  onChange={(e) => updateProfile('monthlyIncome', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="75,000.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Monthly Expenses</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={profile.monthlyExpense || ''}
                  onChange={(e) => updateProfile('monthlyExpense', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="35,000.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Existing EMI</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={profile.existingEMI || ''}
                  onChange={(e) => updateProfile('existingEMI', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="15,000.00"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Job Security, Emergency Fund, Insurance Cover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Job Security</label>
              <select
                value={profile.jobSecurity}
                onChange={(e) => updateProfile('jobSecurity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <option value="">Select job security</option>
                <option value="excellent">Excellent (Government/PSU/Judiciary)</option>
                <option value="good">Good (MNC Employee/Professional)</option>
                <option value="average">Average (Private Employee/Businessman)</option>
                <option value="poor">Poor (Self-employed/Investor/Freelancer)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Emergency Fund</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={profile.emergencyFund || ''}
                  onChange={(e) => updateProfile('emergencyFund', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="2,00,000.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Insurance Cover</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  value={profile.insuranceCover || ''}
                  onChange={(e) => updateProfile('insuranceCover', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="50,00,000.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Results */}
        {(profile.monthlyIncome > 0 || params.loanAmount > 0) && (
          <div className="space-y-6">
            {/* Overall Grade */}
            <div className={`rounded-2xl p-6 border-2 ${
              gradeInfo.color === 'green' ? 'bg-green-50 border-green-200' :
              gradeInfo.color === 'blue' ? 'bg-blue-50 border-blue-200' :
              gradeInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              gradeInfo.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <gradeInfo.icon className={`w-8 h-8 ${
                    gradeInfo.color === 'green' ? 'text-green-600' :
                    gradeInfo.color === 'blue' ? 'text-blue-600' :
                    gradeInfo.color === 'yellow' ? 'text-yellow-600' :
                    gradeInfo.color === 'orange' ? 'text-orange-600' :
                    'text-red-600'
                  }`} />
                  <h4 className={`text-2xl font-bold ${
                    gradeInfo.color === 'green' ? 'text-green-800' :
                    gradeInfo.color === 'blue' ? 'text-blue-800' :
                    gradeInfo.color === 'yellow' ? 'text-yellow-800' :
                    gradeInfo.color === 'orange' ? 'text-orange-800' :
                    'text-red-800'
                  }`}>
                    {gradeInfo.grade} Loan
                  </h4>
                </div>
                <div className={`text-3xl font-bold mb-2 ${
                  gradeInfo.color === 'green' ? 'text-green-800' :
                  gradeInfo.color === 'blue' ? 'text-blue-800' :
                  gradeInfo.color === 'yellow' ? 'text-yellow-800' :
                  gradeInfo.color === 'orange' ? 'text-orange-800' :
                  'text-red-800'
                }`}>
                  {assessment.percentage.toFixed(1)}%
                </div>
                <div className={`text-sm ${
                  gradeInfo.color === 'green' ? 'text-green-600' :
                  gradeInfo.color === 'blue' ? 'text-blue-600' :
                  gradeInfo.color === 'yellow' ? 'text-yellow-600' :
                  gradeInfo.color === 'orange' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  Score: {assessment.totalScore}/{assessment.maxScore}
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-5 h-5 text-blue-600 font-bold">₹</span>
                  <span className="text-sm font-medium text-blue-700">EMI Affordability</span>
                </div>
                <div className="text-xl font-bold text-blue-800">{assessment.scores.emiAffordability}/25</div>
                <div className="text-xs text-blue-600 mt-1">EMI Ratio: {assessment.emiRatio.toFixed(1)}%</div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Interest Rate</span>
                </div>
                <div className="text-xl font-bold text-green-800">{assessment.scores.interestRate}/20</div>
                <div className="text-xs text-green-600 mt-1">Rate: {params.interestRate.toFixed(2)}%</div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Tenure</span>
                </div>
                <div className="text-xl font-bold text-purple-800">{assessment.scores.tenure}/15</div>
                <div className="text-xs text-purple-600 mt-1">Tenure: {(params.tenure/12).toFixed(1)} years</div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Loan Type</span>
                </div>
                <div className="text-xl font-bold text-indigo-800">{assessment.scores.loanType}/15</div>
                <div className="text-xs text-indigo-600 mt-1">{params.loanCategory} {params.loanType}</div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Financial Stability</span>
                </div>
                <div className="text-xl font-bold text-orange-800">{assessment.scores.financialStability}/15</div>
                <div className="text-xs text-orange-600 mt-1">Disposable: ₹{assessment.disposableIncome.toFixed(0)}</div>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Risk Coverage</span>
                </div>
                <div className="text-xl font-bold text-red-800">{assessment.scores.riskCoverage}/10</div>
                <div className="text-xs text-red-600 mt-1">Emergency: {assessment.emergencyMonths.toFixed(1)} months</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">EMI Ratio</div>
                  <div className={`text-lg font-bold ${
                    assessment.emiRatio <= 30 ? 'text-green-800' :
                    assessment.emiRatio <= 50 ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {assessment.emiRatio.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {assessment.emiRatio <= 30 ? 'Excellent' :
                     assessment.emiRatio <= 50 ? 'Acceptable' :
                     'High Risk'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Disposable Income</div>
                  <div className={`text-lg font-bold ${
                    assessment.disposableIncome >= 15000 ? 'text-green-800' :
                    assessment.disposableIncome >= 5000 ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    ₹{assessment.disposableIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">After all EMIs</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Emergency Fund</div>
                  <div className={`text-lg font-bold ${
                    assessment.emergencyMonths >= 6 ? 'text-green-800' :
                    assessment.emergencyMonths >= 3 ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {assessment.emergencyMonths.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Months coverage</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-1">Insurance Coverage</div>
                  <div className={`text-lg font-bold ${
                    assessment.insuranceRatio >= 100 ? 'text-green-800' :
                    assessment.insuranceRatio >= 50 ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {assessment.insuranceRatio.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Of loan amount</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-4 flex items-center gap-2">
                  💡 Recommendations for Better Loan Health
                </h4>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Criteria */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-4">📋 Assessment Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div className="space-y-2">
                  <p><strong>EMI Affordability (25 pts):</strong></p>
                  <p>• ≤30% of income: Excellent (25 pts)</p>
                  <p>• 31-40%: Good (20 pts)</p>
                  <p>• 41-50%: Average (15 pts)</p>
                  <p>• 51-60%: Poor (10 pts)</p>
                  <p>• &gt;60%: Very Poor (0 pts)</p>
                  
                  <p className="pt-2"><strong>Interest Rate (20 pts):</strong></p>
                  <p>• Based on loan type benchmarks</p>
                  <p>• Home: 8.5-12%, Personal: 12-20%</p>
                  
                  <p className="pt-2"><strong>Tenure (15 pts):</strong></p>
                  <p>• Optimal range per loan type</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Loan Type (15 pts):</strong></p>
                  <p>• Secured loans: Higher score</p>
                  <p>• Productive loans: Better rating</p>
                  
                  <p className="pt-2"><strong>Financial Stability (15 pts):</strong></p>
                  <p>• Job security + Disposable income</p>
                  <p>• &gt;20% disposable: Excellent</p>
                  
                  <p className="pt-2"><strong>Risk Coverage (10 pts):</strong></p>
                  <p>• Emergency fund: 6+ months ideal</p>
                  <p>• Insurance: 100%+ of loan amount</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};