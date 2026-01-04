import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import {
  Wallet, TrendingUp, TrendingDown, Activity, AlertCircle,
  ArrowUpRight, ArrowDownRight, Plus, MoreHorizontal, DollarSign,
  PieChart as PieIcon, CreditCard, Trash2, HelpCircle, ChevronLeft, ChevronRight, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Tooltip, XAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { netWorth, assets, liabilities, healthScore, transactions, setAssets, setLiabilities, setActiveTab } = useFinance();
  const { t } = useTheme();

  /* Modal State */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'assets' or 'liabilities'
  const [showScoreHelper, setShowScoreHelper] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [editData, setEditData] = useState({});
  const [newItemParams, setNewItemParams] = useState({ name: '', value: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);

  /* Handlers */
  const handleOpenModal = (type) => {
    setModalType(type);
    setEditData(type === 'assets' ? { ...assets } : { ...liabilities });
    setModalOpen(true);
    setIsAddingNew(false);
    setNewItemParams({ name: '', value: '' });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  const handleValueChange = (key, value) => {
    setEditData(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleSaveChanges = () => {
    if (modalType === 'assets') setAssets(editData);
    else setLiabilities(editData);
    handleCloseModal();
  };

  const handleAddNewItem = () => {
    if (newItemParams.name && newItemParams.value) {
      setEditData(prev => ({ ...prev, [newItemParams.name]: Number(newItemParams.value) }));
      setNewItemParams({ name: '', value: '' });
      setIsAddingNew(false);
    }
  };

  const handleDeleteItem = (key) => {
    const newData = { ...editData };
    delete newData[key];
    setEditData(newData);
  };

  const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);

  // Budget Calc
  const monthlyBudget = 50000;
  // Use local date for current month comparison too, to be consistent
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date && t.date.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + t.amount, 0);
  const budgetPercent = Math.min(100, Math.round((currentMonthExpenses / monthlyBudget) * 100));

  /* Monochrome Chart Colors */
  const CHART_COLORS = ['#a1a1aa', '#d4d4d8', '#71717a', '#e4e4e7', '#52525b'];

  const getChartData = (data) => {
    return Object.entries(data).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };

  const assetsData = getChartData(assets);
  const liabilitiesData = getChartData(liabilities);

  // Sparkline Simulation
  const sparklineData = [
    { value: netWorth * 0.92 }, { value: netWorth * 0.95 }, { value: netWorth * 0.93 },
    { value: netWorth * 0.97 }, { value: netWorth * 0.98 }, { value: netWorth * 0.96 },
    { value: netWorth },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthVariant = (score) => {
    if (score >= 80) return "default"; // Black/Primary
    if (score >= 50) return "secondary"; // Gray
    return "destructive"; // Red/Error
  };

  const calculateMonthlyAverages = () => {
    if (!transactions || transactions.length === 0) return { avgIncome: 0, avgExpense: 0 };

    const incomeByMonth = {};
    const expenseByMonth = {};
    const allMonths = new Set();

    transactions.forEach(t => {
      if (!t.date) return;
      const month = t.date.substring(0, 7);
      allMonths.add(month);
      if (t.type === 'income') {
        incomeByMonth[month] = (incomeByMonth[month] || 0) + t.amount;
      } else {
        expenseByMonth[month] = (expenseByMonth[month] || 0) + t.amount;
      }
    });

    const monthCount = allMonths.size || 1;

    // Calculate total sums
    const totalIncome = Object.values(incomeByMonth).reduce((sum, val) => sum + val, 0);
    const totalExpense = Object.values(expenseByMonth).reduce((sum, val) => sum + val, 0);

    return {
      avgIncome: totalIncome / monthCount,
      avgExpense: totalExpense / monthCount
    };
  };

  const { avgIncome, avgExpense } = calculateMonthlyAverages();

  // Report Generation Logic
  const getReportData = (selectedMonth) => {
    const [year, month] = selectedMonth.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1);
    const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

    const monthTxns = transactions.filter(t => t.date && t.date.startsWith(selectedMonth));
    const income = monthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Top Expense Category
    const catMap = {};
    monthTxns.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    // Sort and get top
    const topCategoryEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry ? { name: topCategoryEntry[0], amount: topCategoryEntry[1] } : { name: 'None', amount: 0 };

    return { monthName, income, expenses, savings, savingsRate, topCategory, txnCount: monthTxns.length };
  };

  const report = getReportData(reportMonth);

  const changeReportMonth = (increment) => {
    const [yearStr, monthStr] = reportMonth.split('-');
    const date = new Date(Number(yearStr), Number(monthStr) - 1 + increment);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setReportMonth(`${newYear}-${newMonth}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
          <p className="text-muted-foreground">{t('financialOverview')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowReportModal(true)}>
            <Activity className="w-4 h-4" /> Reports
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setActiveTab('entry')}>
            <Plus className="w-4 h-4" /> Quick Add
          </Button>
        </div>
      </div>

      {/* Budget Alert Banner */}
      {budgetPercent > 80 && (
        <div className={cn(
          "rounded-xl border p-4 flex items-start gap-4",
          budgetPercent > 90 ? "bg-destructive/10 border-destructive/20" : "bg-primary/5 border-primary/10"
        )}>
          <AlertCircle className={cn("w-5 h-5 mt-0.5", budgetPercent > 90 ? "text-destructive" : "text-primary")} />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Monthly Budget Alert</h4>
            <p className="text-sm text-muted-foreground mt-1">
              You've spent {budgetPercent}% of your monthly budget (₹{currentMonthExpenses.toLocaleString()} / ₹{monthlyBudget.toLocaleString()}).
            </p>
            <Progress value={budgetPercent} className="h-1.5 mt-3 bg-background/50" indicatorClassName={budgetPercent > 90 ? "bg-destructive" : "bg-primary"} />
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Net Worth Card (Large) */}
        <Card className="md:col-span-2 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <CardHeader>
            <CardDescription>Total Net Worth</CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-4xl md:text-5xl font-bold tracking-tighter">
                {formatCurrency(netWorth)}
              </CardTitle>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 gap-1">
                <TrendingUp className="w-3 h-3" /> +5.2%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[200px] w-full mt-auto pb-0 px-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  fill="url(#lineGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card className="flex flex-col justify-center items-center text-center p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-20 cursor-pointer text-muted-foreground hover:text-primary transition-colors" onClick={() => setShowScoreHelper(true)}>
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-muted/50" />
          <div className="relative z-10 space-y-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" className="text-muted" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor"
                  className={cn("transition-all duration-1000", healthScore >= 80 ? "text-primary" : "text-destructive")}
                  strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(healthScore / 100) * 440} 440`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold tracking-tighter">{healthScore}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Health Score</span>
              </div>
            </div>
            <div>
              <Badge variant={getHealthVariant(healthScore)} className="px-4 py-1">
                {healthScore >= 80 ? t('healthExcellent') : t('healthNeedsAttention')}
              </Badge>
              <p className="text-xs text-muted-foreground mt-3 max-w-[200px] mx-auto">
                Based on your assets, liabilities, and spending habits.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6 w-full text-left border-t pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Avg. Income</p>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(avgIncome)}/mo</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Avg. Expenses</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(avgExpense)}/mo</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Assets & Liabilities Split */}
        <div className="md:col-span-3 grid md:grid-cols-2 gap-6">

          {/* Assets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" /> {t('assets')}
                </CardTitle>
                <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleOpenModal('assets')}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] flex items-center justify-between gap-4">
                <ResponsiveContainer width={120} height="100%">
                  <PieChart>
                    <Pie data={assetsData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value">
                      {assetsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <ScrollArea className="h-[150px] flex-1 pr-4">
                  <div className="space-y-3">
                    {assetsData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Liabilities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" /> {t('liabilities')}
                </CardTitle>
                <div className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleOpenModal('liabilities')}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] flex items-center justify-between gap-4">
                <ResponsiveContainer width={120} height="100%">
                  <PieChart>
                    <Pie data={liabilitiesData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value">
                      {liabilitiesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <ScrollArea className="h-[150px] flex-1 pr-4">
                  <div className="space-y-3">
                    {liabilitiesData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t('recentTransactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {transactions.slice(0, 5).map((t, i) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-full ring-1 ring-inset",
                      t.type === 'income' ? "bg-green-500/10 text-green-600 ring-green-500/20" : "bg-red-500/10 text-red-600 ring-red-500/20"
                    )}>
                      {t.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-medium text-sm leading-none">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.date} • {t.category}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-mono font-medium",
                    t.type === 'income' ? "text-green-600" : "text-foreground"
                  )}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/5 px-6 py-4">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground" onClick={() => setActiveTab('analytics')}>
              View All Transactions
            </Button>
          </CardFooter>
        </Card>

      </div>

      {/* Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {modalType === 'assets' ? 'Assets' : 'Liabilities'}</DialogTitle>
            <DialogDescription>
              Manage your financial items here. Changes reflect immediately in your net worth.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-4 py-2">
              {Object.entries(editData).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <Label className="w-1/3 truncate text-xs uppercase text-muted-foreground font-semibold">{key}</Label>
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                      className="pl-6 h-9"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteItem(key)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Separator className="my-4" />

              {isAddingNew ? (
                <div className="space-y-3 p-3 bg-muted/40 rounded-lg border border-dashed animate-in slide-in-from-top-2">
                  <Input
                    placeholder="Item Name"
                    value={newItemParams.name}
                    onChange={(e) => setNewItemParams(p => ({ ...p, name: e.target.value }))}
                    className="h-8 text-xs"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-xs text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newItemParams.value}
                      onChange={(e) => setNewItemParams(p => ({ ...p, value: e.target.value }))}
                      className="pl-6 h-8 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="w-full h-7 text-xs" onClick={handleAddNewItem}>Add</Button>
                    <Button size="sm" variant="ghost" className="w-full h-7 text-xs" onClick={() => setIsAddingNew(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full border-dashed text-muted-foreground" onClick={() => setIsAddingNew(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add New Item
                </Button>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Health Score Formula Modal */}
      <Dialog open={showScoreHelper} onOpenChange={setShowScoreHelper}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Health Score Formula
            </DialogTitle>
            <DialogDescription>
              Your Financial Health Score (0-100) is calculated based on three key pillars:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg p-3 bg-muted/50 border space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">1. Debt-to-Asset Ratio</span>
                <Badge variant="outline">Max +/- 15 pts</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                We compare your total liabilities to your assets. A ratio below 20% boosts your score, while high debt lowers it.
              </p>
            </div>

            <div className="rounded-lg p-3 bg-muted/50 border space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">2. Savings Ratio</span>
                <Badge variant="outline">Max +/- 20 pts</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Percentage of income saved monthly. Saving &gt;30% of your income yields the maximum points.
              </p>
            </div>

            <div className="rounded-lg p-3 bg-muted/50 border space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">3. Emergency Fund & Stability</span>
                <Badge variant="outline">Max +/- 15 pts</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                We check if your liquid savings cover at least 3-6 months of average expenses.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>Base score starts at 50.</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowScoreHelper(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Financial Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Activity className="w-6 h-6 text-primary" />
                Financial Executive Summary
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Comprehensive monthly financial analysis
              </DialogDescription>
            </div>
            <div className="flex items-center bg-muted rounded-lg p-1 mr-6">
              <Button variant="ghost" size="icon" onClick={() => changeReportMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="min-w-[120px] text-center font-medium text-sm">
                {report.monthName}
              </span>
              <Button variant="ghost" size="icon" onClick={() => changeReportMonth(1)} disabled={reportMonth >= currentMonthKey}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-4 rounded-lg flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-400">About this Report</h4>
                <p className="text-sm text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
                  This executive summary provides a snapshot of your monthly financial health. Use it to track net savings, identify major expense leaks, and adjust your budget for the upcoming month. A healthy savings rate (&gt;20%) is key to long-term wealth building.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Key Metrics */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-card border shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Net Savings</p>
                    <div className="mt-2">
                      <span className={cn("text-2xl font-bold", report.savings >= 0 ? "text-green-600" : "text-red-600")}>
                        {formatCurrency(report.savings)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {report.savingsRate > 0 ? `+${report.savingsRate.toFixed(1)}% savings rate` : 'No savings yet'}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-card border shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Top Expense</p>
                    <div className="mt-2 flex flex-col">
                      <span className="text-xl font-bold text-foreground truncate">{report.topCategory.name}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(report.topCategory.amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-card border shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Cash Flow Analysis</span>
                    <span className="text-muted-foreground text-xs">{formatCurrency(report.income)} in / {formatCurrency(report.expenses)} out</span>
                  </div>
                  <div className="h-6 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="h-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                      style={{ width: `${Math.min(100, (report.savings / (report.income || 1)) * 100)}%` }}
                    >
                      {report.savingsRate > 5 && `${report.savingsRate.toFixed(0)}%`}
                    </div>
                    <div
                      className="h-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                      style={{ width: `${Math.min(100, (report.expenses / (report.income || 1)) * 100)}%` }}
                    >
                      {(100 - report.savingsRate) > 5 && `${(100 - report.savingsRate).toFixed(0)}%`}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Saved</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Spent</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Advisor & Details */}
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 h-full flex flex-col">
                  <h4 className="font-semibold text-base mb-3 flex items-center gap-2 text-primary">
                    <Wallet className="w-4 h-4" />
                    Advisor Insight
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                    "{report.savingsRate >= 20
                      ? `Excellent work this month! A ${report.savingsRate.toFixed(1)}% savings rate places you in a strong financial position. Consider moving ₹${(report.savings * 0.5).toLocaleString()} into your investment portfolio to maximize returns.`
                      : `Your spending is high relative to income this month (${(100 - report.savingsRate).toFixed(1)}% utilization). The largest impact comes from ${report.topCategory.name}. Try setting a stricter limit for this category next month.`}"
                  </p>

                  <div className="mt-auto pt-6">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Month Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b pb-2 border-dashed">
                        <span>Total Transactions</span>
                        <span className="font-mono">{report.txnCount}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 border-dashed">
                        <span>Avg. Daily Spend</span>
                        <span className="font-mono">{formatCurrency(report.expenses / 30)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>Close</Button>
            <Button className="gap-2" onClick={() => setShowReportModal(false)}>
              <TrendingUp className="w-4 h-4" />
              Download Formal Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Dashboard;
