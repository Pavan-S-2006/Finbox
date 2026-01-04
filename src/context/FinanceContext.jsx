import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { parseReceipt } from '../utils/receiptParser';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

// --- Voice Parsing Helper Constants & Functions ---

// --- Voice Parsing Helper Constants & Functions ---
import { parseVoiceInput as parseVoiceInputHelper } from '../utils/voiceParser';
import {
  createUserDocument,
  getUserData,
  subscribeToUserData,
  subscribeToTransactions,
  addTransactionToFirestore,
  updateTransactionInFirestore,
  deleteTransactionFromFirestore
} from '../services/firestoreService';



export const FinanceProvider = ({ children }) => {
  // User authentication from AuthContext
  const { currentUser, login: authLogin, signup: authSignup, logout: authLogout, loading: authLoading } = useAuth();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync AuthContext with local state
  useEffect(() => {
    let unsubscribeUser;
    let unsubscribeTransactions;

    const initializeUser = async () => {
      // Failsafe timeout to prevent infinite loading
      const timer = setTimeout(() => {
        console.warn("FinanceContext initialization timed out, forcing load completion");
        setIsLoading(false);
      }, 2500);

      try {
        if (!authLoading && currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);

          // Ensure Firestore document exists
          await createUserDocument(currentUser, { displayName: currentUser.displayName });

          // Subscribe to User Data (Assets, Liabilities, etc.)
          unsubscribeUser = subscribeToUserData(currentUser.uid, (userData) => {
            if (userData) {
              setAssets(userData.assets || { savings: 0, gold: 0, investments: 0, other: 0 });
              setLiabilities(userData.liabilities || { loans: 0, creditCard: 0, other: 0 });

              // Sync full user data (including familyLink)
              setUser(prev => ({ ...prev, ...userData }));
            }
          });

          // Subscribe to Transactions
          unsubscribeTransactions = subscribeToTransactions(currentUser.uid, (txs) => {
            setTransactions(txs);
          });
        } else if (!authLoading && !currentUser) {
          setUser(null);
          setIsAuthenticated(false);
          setTransactions([]);
          setAssets({ savings: 0, gold: 0, investments: 0, other: 0 });
          setLiabilities({ loans: 0, creditCard: 0, other: 0 });
        }
      } catch (error) {
        console.error("Error initializing user data:", error);
      } finally {
        clearTimeout(timer);
        setIsLoading(false);
      }
    };

    initializeUser();

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeTransactions) unsubscribeTransactions();
    };
  }, [currentUser, authLoading]);

  // Financial data
  const [netWorth, setNetWorth] = useState(0);
  const [assets, setAssets] = useState({
    savings: 0,
    gold: 0,
    investments: 0,
    other: 0,
  });
  const [liabilities, setLiabilities] = useState({
    loans: 0,
    creditCard: 0,
    other: 0,
  });

  // Health score
  const [healthScore, setHealthScore] = useState(0);

  // Transactions
  const [transactions, setTransactions] = useState([]);

  // AI & Insights
  const [insights, setInsights] = useState([]);

  // Sandbox state
  const [sandboxMode, setSandboxMode] = useState(false);
  const [simulatedBalance, setSimulatedBalance] = useState(netWorth);

  // Legacy/Nominee data
  const [nominees, setNominees] = useState([]);
  const [vaultDocuments, setVaultDocuments] = useState([]);

  // Financial literacy data
  const [lessons, setLessons] = useState([
    { id: 1, title: 'Understanding Inflation', duration: '30 sec', completed: false },
    { id: 2, title: 'Power of Compound Interest', duration: '45 sec', completed: true },
    { id: 3, title: 'Emergency Fund Basics', duration: '40 sec', completed: false },
    { id: 4, title: 'Debt Management Strategies', duration: '60 sec', completed: false },
  ]);

  // Insurance recommendations
  const [recommendations, setRecommendations] = useState([
    { id: 1, type: 'Health Insurance', priority: 'high', reason: 'Age > 30, no current coverage' },
    { id: 2, type: 'Term Life Insurance', priority: 'medium', reason: 'Dependent family members' },
    { id: 3, type: 'Government Pension Scheme', priority: 'low', reason: 'Long-term retirement planning' },
  ]);

  // Active tab (persist across refreshes)
  const [activeTab, setActiveTab] = useState(() =>
    localStorage.getItem('financeActiveTab') || 'home'
  );

  // Authentication Proxies
  const login = async (email, password) => {
    try {
      await authLogin(email, password);
      // State update handled by useEffect
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };


  const signup = async (email, password, fullName, isFamilyMember = false) => {
    try {
      let familyLink = null;

      // 1. If Family Member, verify invite BEFORE creating auth account
      if (isFamilyMember) {
        // Need to import legacyService here or use a helper
        const { legacyService } = await import('../services/legacyService');
        const invite = await legacyService.checkInvite(email);

        if (!invite) {
          throw new Error("No pending invitation found for this email. Please ask the main user to add you as a member first.");
        }

        // Prepare link data
        familyLink = {
          mainUserId: invite.inviterUid,
          isFamilyMember: true,
          permission: invite.permission
        };
      }

      // 2. Create Auth User
      const userCredential = await authSignup(email, password, fullName);

      // 3. Create Firestore Document with family link if applicable
      if (userCredential && userCredential.user) {
        await createUserDocument(userCredential.user, {
          displayName: fullName,
          familyLink: familyLink // Store the link
        });

        // 4. Update Invite Status if family member
        if (isFamilyMember && familyLink) {
          const { legacyService } = await import('../services/legacyService');
          // We might need a method to update invite status to 'accepted'
          // For now, the existence of the user doc implies acceptance, 
          // but strictly we should update the invite doc status if we want to track it
          // Let's rely on the check logic for now.
        }
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('financeActiveTab');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // AI Categorization Helper (Legacy fallback or used by parsing)
  const predictCategory = (description) => {
    // This is kept for backward compatibility if needed, or we can use detectCategory
    // For now, I'll keep the old logic or redirect to detectCategory if I wanted,
    // but the Prompt requested specific pipeline for *Voice*.
    // I will leave this as is for manual entry categorization if used there.

    const desc = description.toLowerCase();

    // Food & Dining
    if (desc.includes('food') || desc.includes('grocery') || desc.includes('restaurant') ||
      desc.includes('zomato') || desc.includes('swiggy') || desc.includes('blinkit') ||
      desc.includes('starbucks') || desc.includes('mcdonald')) return ['Food', 'Essential'];

    // Transport
    if (desc.includes('fuel') || desc.includes('uber') || desc.includes('ola') ||
      desc.includes('petrol') || desc.includes('diesel') || desc.includes('metro') ||
      desc.includes('rapido')) return ['Transport', 'Essential'];

    // Utilities & Bills
    if (desc.includes('bill') || desc.includes('electricity') || desc.includes('recharge') ||
      desc.includes('water') || desc.includes('gas') || desc.includes('internet') ||
      desc.includes('jio') || desc.includes('airtel')) return ['Utilities', 'Essential'];

    // Entertainment & Subscriptions
    if (desc.includes('netflix') || desc.includes('movie') || desc.includes('subscription') ||
      desc.includes('prime') || desc.includes('spotify') || desc.includes('hotstar') ||
      desc.includes('gaming') || desc.includes('sony')) return ['Entertainment', 'Discretionary'];

    // Shopping
    if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('flipkart') ||
      desc.includes('myntra') || desc.includes('clothing') || desc.includes('shoes')) return ['Shopping', 'Discretionary'];

    // Investments & Finance
    if (desc.includes('zerodha') || desc.includes('groww') || desc.includes('stock') ||
      desc.includes('mutual fund') || desc.includes('sip') || desc.includes('crypto')) return ['Investments', 'Investments'];

    // Income
    if (desc.includes('salary') || desc.includes('freelance') || desc.includes('dividend') ||
      desc.includes('interest credit')) return ['Salary', 'Income'];

    return ['General', 'Discretionary'];
  };

  // Generate Insights
  const generateInsights = useCallback(() => {
    const newInsights = [];
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
    const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);

    // Insight 1: Spending Analysis (Discretionary)
    const discretionary = expenses.filter(t => t.aiTag === 'Discretionary').reduce((sum, t) => sum + t.amount, 0);
    const discretionaryPercent = totalExpense > 0 ? Math.round((discretionary / totalExpense) * 100) : 0;

    if (discretionaryPercent > 35) {
      newInsights.push({
        id: 'i1',
        title: 'High Discretionary Spending',
        description: `Your non-essential spending is at ${discretionaryPercent}%. To reach your goals faster, try reducing Shopping or Entertainment by 10%.`,
        type: 'alert'
      });
    } else {
      newInsights.push({
        id: 'i1',
        title: 'Optimized Spending',
        description: `Impressive! Non-essential spending is under control (${discretionaryPercent}%). This discipline is key to wealth building.`,
        type: 'success'
      });
    }

    // Insight 2: Savings Rate
    const savingsRate = income > 0 ? Math.round(((income - totalExpense) / income) * 100) : 0;
    if (savingsRate < 20) {
      newInsights.push({
        id: 'i2',
        title: 'Savings Boost Needed',
        description: `Current savings rate: ${savingsRate}%. Ideal: 20-30%. Automating a small SIP of ₹2,000 could bridge this gap.`,
        type: 'warning'
      });
    } else if (savingsRate >= 40) {
      newInsights.push({
        id: 'i2',
        title: 'Super Saver Status',
        description: `Your ${savingsRate}% savings rate is in the top 5% of users. Consider diversified investments to maximize these gains.`,
        type: 'success'
      });
    }

    // Insight 3: Emergency Fund
    const monthlyBurn = totalExpense || 30000; // Mock average if no transactions
    const savingsInCash = assets.savings || 0;
    const monthsCovered = (savingsInCash / monthlyBurn).toFixed(1);

    if (monthsCovered < 3) {
      newInsights.push({
        id: 'i3',
        title: 'Emergency Fund Alert',
        description: `Your liquid savings cover ${monthsCovered} months of expenses. Aim for 6 months (₹${(monthlyBurn * 6).toLocaleString()}) for true safety.`,
        type: 'alert'
      });
    }

    // Insight 4: Debt-to-Income Ratio
    const monthlyDebtService = (liabilities.loans / 60) + (liabilities.creditCard); // Simplified monthly estimate
    const dti = income > 0 ? Math.round((monthlyDebtService / income) * 100) : 0;

    if (dti > 40) {
      newInsights.push({
        id: 'i4',
        title: 'Debt Management',
        description: `Debt-to-Income is high (${dti}%). Prioritize clearing the Credit Card debt first to avoid high interest compounding.`,
        type: 'warning'
      });
    }

    setInsights(newInsights);
  }, [transactions, assets, liabilities]);

  // Add transaction
  const addTransaction = async (transaction) => {
    console.log("addTransaction called with:", transaction);
    if (!user) {
      console.error("addTransaction failed: No user found");
      return;
    }

    let category = transaction.category;
    let aiTag = transaction.aiTag;

    if (!category) {
      const prediction = predictCategory(transaction.description);
      category = prediction[0];
      aiTag = prediction[1];
    }

    if (!aiTag) {
      const prediction = predictCategory(transaction.description);
      aiTag = prediction[1];
    }

    const newTransaction = {
      ...transaction,
      category: category,
      aiTag: aiTag,
      paymentSource: transaction.paymentSource || 'budget',
      date: transaction.date || new Date().toISOString(),
    };

    try {
      await addTransactionToFirestore(user.uid, newTransaction);
      // State updates handled by subscription
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  // Update transaction
  const updateTransaction = async (updatedTransaction) => {
    if (!user) return;
    try {
      await updateTransactionInFirestore(user.uid, updatedTransaction);
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    if (!user) return;
    try {
      await deleteTransactionFromFirestore(user.uid, transactionId);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  // NEW Voice Parsing Function using the Pipeline
  const parseVoiceInput = (text) => {
    return parseVoiceInputHelper(text);
  };

  // Receipt/File parsing logic
  const parseReceiptInput = (ocrData) => {
    // Uses the advanced pipeline in utils/receiptParser.js
    // ocrData is { text, blocks, annotations } from googleAi.js
    const parsed = parseReceipt(ocrData);
    return {
      ...parsed,
      id: Date.now(), // Generate tempoary ID for preview
      aiTag: 'Essential', // Default tag, can be refined
    };
  };

  // Calculate health score (0-100)
  const calculateHealthScore = useCallback(() => {
    const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
    const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 75000;
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    let score = 50; // Starting baseline

    // 1. Debt-to-Asset Ratio (Max +15 or -15)
    const daRatio = totalLiabilities / totalAssets;
    if (daRatio < 0.2) score += 15;
    else if (daRatio < 0.4) score += 5;
    else if (daRatio > 0.6) score -= 15;

    // 2. Savings Ratio (Max +20 or -10)
    const savingsRatio = income > 0 ? (income - expenses) / income : 0;
    if (savingsRatio > 0.3) score += 20;
    else if (savingsRatio > 0.2) score += 10;
    else if (savingsRatio < 0.1) score -= 10;

    // 3. Emergency Fund (Max +15 or -15)
    const monthlyBurn = expenses / (transactions.length / 5) || 30000;
    const monthsCovered = assets.savings / monthlyBurn;
    if (monthsCovered >= 6) score += 15;
    else if (monthsCovered >= 3) score += 5;
    else score -= 15;

    setHealthScore(Math.max(0, Math.min(100, score)));
  }, [assets, liabilities, transactions]);

  // Finance Snack logic
  const [financeSnack, setFinanceSnack] = useState("Small savings today lead to big freedom tomorrow.");
  const financeTips = [
    "Small savings today lead to big freedom tomorrow.",
    "Rule of 72: Divide 72 by interest rate to see how fast your money doubles.",
    "Pay yourself first: Automate 20% of your salary to savings before spending.",
    "An emergency fund should cover at least 6 months of living expenses.",
    "Index funds are often better than picking individual stocks for long-term growth.",
    "Beware of lifestyle creep: Don't increase spending just because your income rises."
  ];

  const updateFinanceSnack = () => {
    const randomIndex = Math.floor(Math.random() * financeTips.length);
    setFinanceSnack(financeTips[randomIndex]);
  };

  // Sandbox simulation
  const simulatePurchase = (amount) => {
    setSimulatedBalance(netWorth - amount);
  };

  const resetSimulation = () => {
    setSimulatedBalance(netWorth);
  };

  useEffect(() => {
    // Initial load handled by AuthContext sync
    updateFinanceSnack();
  }, []);

  // Removed local storage user persistence as firebase handles it
  /*
  useEffect(() => {
    if (user) {
      localStorage.setItem('financeUser', JSON.stringify(user));
    }
  }, [user]);
  */

  // Persist activeTab across refreshes
  useEffect(() => {
    localStorage.setItem('financeActiveTab', activeTab);
  }, [activeTab]);

  // Sync Net Worth
  useEffect(() => {
    const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
    const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);
    setNetWorth(totalAssets - totalLiabilities);
    calculateHealthScore();
  }, [assets, liabilities, transactions, calculateHealthScore]);

  // Update Insights when transactions change
  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    netWorth,
    assets,
    setAssets,
    liabilities,
    setLiabilities,
    healthScore,
    transactions,
    insights,
    financeSnack,
    updateFinanceSnack,
    sandboxMode,
    setSandboxMode,
    simulatedBalance,
    nominees,
    setNominees,
    vaultDocuments,
    setVaultDocuments,
    lessons,
    recommendations,
    activeTab,
    setActiveTab,
    login,
    signup,
    logout,
    updateUser,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    parseVoiceInput,
    parseReceiptInput,
    calculateHealthScore,
    simulatePurchase,
    resetSimulation,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
