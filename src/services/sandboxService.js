// sandboxService.js
// Advanced Simulation Engine
// Implements tightly coupled logic for Expenditure and Investment simulations.

// Default / Initial State
const DEFAULT_STATE = {
  inputs: {
    assets: {
      liquid: 150000,  // Cash, Savings
      locked: 800000   // PF, Property, etc.
    },
    income: {
      fixed: 85000,    // Salary
      variable: 0      // Bonus, Freelance
    },
    expenses: {
      fixed: 35000,    // Rent, EMI, Utilities (Mandatory)
      variable: 15000, // Dining, Entertainment (Discretionary)
      oneTime: 0       // The "Scenario Purchase"
    },
    constraints: {
      emergencyBufferMonths: 6 // Safety net requirement
    },
    investment: {
      type: 'lumpsum', // lumpsum, sip, swp
      riskTolerance: 'moderate', // conservative, moderate, aggressive
      allocationPct: 100, // % of surplus to invest (for lumpsum)
      sipAmount: 5000, // Monthly SIP Amount
      swpWithdrawal: 5000 // Monthly Withdrawal Amount
    }
  }
};

export const sandboxService = {
  // Factory: Get a fresh simulation state
  getInitialState: async (userData = null) => {
    if (userData) {
      return sandboxService._mapUserToSandbox(userData);
    }
    // Fallback if no user data provided
    await new Promise(r => setTimeout(r, 200));
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  },

  // Helper: Map Real User Data to Sandbox Schema
  _mapUserToSandbox: (userContextData) => {
    // Extract from Context Structure
    const { assets, transactions } = userContextData;

    // 1. Calculate Averages from Transactions
    // We'll take the last 3 months if available, or just all transactions
    const incomeTx = transactions.filter(t => t.type === 'income');
    // const expenseTx = transactions.filter(t => t.type === 'expense');

    // Simple average monthly (assuming transactions are somewhat recent/representative)
    // Fallback to 75000 if no salary found
    const latestSalary = incomeTx.find(t => t.category === 'Salary')?.amount || 75000;

    // We can iterate transactions to find average expenses but for now let's use a safe default
    // or try to sum known recurring expenses.
    // For simplicity in this iteration:
    const fixedExp = 35000;
    const varExp = 15000;

    return {
      inputs: {
        assets: {
          liquid: (assets.savings || 0) + (assets.investments || 0), // Assuming investments are liquid-ish
          locked: (assets.gold || 0) + (assets.other || 0) // Locked assets
        },
        income: {
          fixed: latestSalary,
          variable: 0
        },
        expenses: {
          fixed: fixedExp,
          variable: varExp,
          oneTime: 0
        },
        constraints: {
          emergencyBufferMonths: 6
        },
        investment: {
          type: 'lumpsum',
          riskTolerance: 'moderate',
          allocationPct: 100,
          sipAmount: 5000,
          swpWithdrawal: 5000
        }
      }
    };
  },

  // The Core Engine: Recalculates EVERYTHING based on inputs
  calculateScenario: (inputs) => {
    const { assets, income, expenses, constraints, investment } = inputs;

    // 1. Income & Expense Totals
    const totalMonthlyIncome = income.fixed + income.variable;
    const totalMonthlyExpenses = expenses.fixed + expenses.variable;
    // const totalExpensesIncludingOneTime = totalMonthlyExpenses + expenses.oneTime;

    // 2. Net Surplus (Disposable Income)
    const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;

    // 3. Asset Impact
    const remainingLiquidAssets = assets.liquid - expenses.oneTime;
    const totalNetWorth = remainingLiquidAssets + assets.locked;

    // 4. Financial Health Metrics
    const expenseToIncomeRatio = totalMonthlyIncome > 0 ? (totalMonthlyExpenses / totalMonthlyIncome) * 100 : 100;

    // Runway
    const runwayMonths = totalMonthlyExpenses > 0
      ? remainingLiquidAssets / totalMonthlyExpenses
      : 999;

    // 5. Risk Assessment & Score Calculation (0-100)
    let riskLevel = 'low';
    let riskFactors = [];

    // Dynamic Scoring System (More granular updates)
    let calculatedScore = 0;

    // A. Runway Score (Max 35)
    // 6 months = 30 points. 7+ months = 35 points.
    calculatedScore += Math.min(35, (runwayMonths / constraints.emergencyBufferMonths) * 30);

    // B. Savings Rate Score (Max 35)
    // 30% savings rate = 30 points.
    const savingsRate = totalMonthlyIncome > 0 ? (monthlySurplus / totalMonthlyIncome) * 100 : 0;
    calculatedScore += Math.min(35, Math.max(0, savingsRate));

    // C. Liquidity Health (Max 15)
    // Having 3x expenses in liquid assets is good.
    const liquidityRatio = totalMonthlyExpenses > 0 ? remainingLiquidAssets / totalMonthlyExpenses : 0;
    calculatedScore += Math.min(15, liquidityRatio * 3);

    // D. Efficiency Bonus (Max 15)
    // Lower expense ratio is better.
    if (expenseToIncomeRatio < 50) calculatedScore += 15;
    else if (expenseToIncomeRatio < 70) calculatedScore += 8;
    else if (expenseToIncomeRatio < 90) calculatedScore += 2;

    // Penalties
    if (remainingLiquidAssets < 0) calculatedScore -= 50; // Debt penalty

    // Final Integer Score
    let score = Math.round(Math.max(0, Math.min(100, calculatedScore)));

    // Determine Risk Level based on Logic (or Score)
    if (runwayMonths < constraints.emergencyBufferMonths) {
      riskLevel = 'high';
      riskFactors.push(`Runway (${runwayMonths.toFixed(1)}m) is below buffer target.`);
    }
    if (expenseToIncomeRatio > 80) {
      if (riskLevel !== 'high') riskLevel = 'medium';
      riskFactors.push(`Expenses consume ${expenseToIncomeRatio.toFixed(0)}% of income.`);
    }
    if (remainingLiquidAssets < 0) {
      riskLevel = 'critical';
      riskFactors.push('Liquid assets depleted! You are in debt.');
    }

    // 6. Investment Capacity (Asset-Based)
    // Formula: Net Liquid Assets (after one-time) - Emergency Buffer

    // A. Define Buffer Requirement
    const emergencyBufferAmount = totalMonthlyExpenses * constraints.emergencyBufferMonths;

    // B. Calculate Net Liquid Assets available (Liquid - OneTimePurchase)
    // already calculated as 'remainingLiquidAssets'

    // C. Calculate Investable Capacity (Stock)
    // We do NOT subtract liabilities directly, but buffer covers risk.
    const capacityRaw = remainingLiquidAssets - emergencyBufferAmount;
    const investmentCapacity = Math.max(0, capacityRaw);

    // 7. Investment Sandbox Inputs (Lump Sum / Asset-Based)
    // User Requirement: Use "Deployable Investment Capacity" (Liquid - Buffer) as the source.
    // This switches the simulation from "Monthly SIP" to "One-Time Investable Cash".

    const maxInvestable = investmentCapacity;

    // Note: investmentCapacity is already floored at 0 in Step 6.
    // No extra gatekeeper needed (if capacity < 0, maxInvestable is 0).

    let actualInvestment = 0;

    // SAFETY CHECK: Ensure investment object exists (migration safety)
    const invInput = investment || DEFAULT_STATE.inputs.investment;
    const invType = invInput.type || 'lumpsum';

    if (invType === 'sip') {
      actualInvestment = invInput.sipAmount || 0;
    } else {
      // For Lump Sum and SWP (SWP invests a lump sum effectively to withdraw from)
      actualInvestment = (maxInvestable * (invInput.allocationPct || 0)) / 100;
    }

    // 8. Investment Projections (Dynamic Mode)
    const projection = sandboxService._calculateProjections(actualInvestment, invInput.riskTolerance, invType, {
      monthlySurplus,
      maxInvestable,
      swpWithdrawal: invInput.swpWithdrawal || 0
    });

    return {
      valid: remainingLiquidAssets >= 0,
      financials: {
        totalIncome: totalMonthlyIncome,
        totalRecurringExpenses: totalMonthlyExpenses,
        monthlySurplus, // Still useful for recurring context
        remainingLiquidAssets,
        totalNetWorth,
        emergencyBufferAmount,
        investmentCapacity,
        isCapacityLimited: capacityRaw < 0
      },
      health: {
        score,
        runwayMonths: parseFloat(runwayMonths.toFixed(1)),
        expenseToIncomeRatio: parseFloat(expenseToIncomeRatio.toFixed(1)),
        riskLevel,
        riskFactors
      },
      investment: {
        maxInvestable,
        actualInvestment,
        projection,
        monthlySurplus // Ensure we pass this back for UI limits
      }
    };
  },

  // Internal Helper for Investment Math
  _calculateProjections: (amount, riskProfile, type = 'lumpsum', context = {}) => {
    // ROI Assumptions map
    const RATES = {
      conservative: { r: 0.07, vol: 'Low' }, // FD/Debt
      moderate: { r: 0.12, vol: 'Medium' },  // Balanced Funds
      aggressive: { r: 0.18, vol: 'High' }   // Small Cap/Crypto
    };

    const { r, vol } = RATES[riskProfile] || RATES.moderate;
    const monthlyRate = r / 12;
    const years = [1, 3, 5, 10];
    const growth = {};
    const graphData = [];

    // Calculate year-by-year for graph (0 to 10 years)

    // Initial Values
    let currentCorpus = 0;
    let totalInvested = 0;

    if (type === 'lumpsum' || type === 'swp') {
      // For SWP, we start with the 'amount' which is the Lump Sum Investable
      // Wait, 'amount' passed here for SWP should be the Corpus
      // In calculateScenario, we passed 'actualInvestment' which is calced from allocationPct
      currentCorpus = amount;
      totalInvested = amount;
    } else if (type === 'sip') {
      currentCorpus = 0;
      totalInvested = 0;
    }

    const { swpWithdrawal } = context;

    for (let month = 0; month <= 120; month++) {
      // Calculate at Month Start/End
      if (month > 0) {
        // Apply Growth
        currentCorpus = currentCorpus * (1 + monthlyRate);

        // Apply Flows
        if (type === 'sip') {
          currentCorpus += amount; // Add SIP Amount
          totalInvested += amount;
        } else if (type === 'swp') {
          currentCorpus -= swpWithdrawal; // Subtract SWP
          if (currentCorpus < 0) currentCorpus = 0;
        }
      }

      // Snapshot at Year Ends (Month 0, 12, 24...)
      if (month % 12 === 0) {
        const yr = month / 12;

        graphData.push({
          year: yr,
          totalValue: Math.round(currentCorpus),
          investedAmount: Math.round(totalInvested)
        });

        if (years.includes(yr)) {
          growth[yr] = Math.round(currentCorpus);
        }
      }
    }

    return {
      riskProfile,
      volatility: vol,
      projectedReturns: growth,
      graphData: graphData, // New Array for Charts
      ratesUsed: r * 100,
      type
    };
  }
};
