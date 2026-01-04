import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const Analytics = () => {
    const { transactions, insights } = useFinance();
    const { t, language } = useTheme();

    // Month Selection Logic
    const months = useMemo(() => {
        const uniqueMonths = [...new Set(transactions.map(txn => txn.date.slice(0, 7)))];
        return uniqueMonths.sort().reverse();
    }, [transactions]);

    const [selectedMonth, setSelectedMonth] = useState(months[0] || new Date().toISOString().slice(0, 7));

    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => txn.date.startsWith(selectedMonth));
    }, [transactions, selectedMonth]);

    const previousMonth = useMemo(() => {
        const currentIndex = months.indexOf(selectedMonth);
        return months[currentIndex + 1] || null;
    }, [months, selectedMonth]);

    // Data Aggregation
    const stats = useMemo(() => {
        const income = filteredTransactions.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0);
        const expense = filteredTransactions.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0);

        const categoryData = filteredTransactions
            .filter(txn => txn.type === 'expense')
            .reduce((acc, txn) => {
                acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
                return acc;
            }, {});

        const chartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

        return { income, expense, chartData };
    }, [filteredTransactions]);

    const prevMonthStats = useMemo(() => {
        if (!previousMonth) return null;
        const prevTransactions = transactions.filter(txn => txn.date.startsWith(previousMonth));
        const expense = prevTransactions.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0);
        return { expense };
    }, [transactions, previousMonth]);

    // Monochrome Palette (Shades of Zinc/Gray)
    const COLORS = ['#a1a1aa', '#d4d4d8', '#71717a', '#e4e4e7', '#52525b'];

    const formatMonth = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const locale = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
        return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month - 1));
    };

    const expenseChange = useMemo(() => {
        if (!prevMonthStats) return null;
        const change = ((stats.expense - prevMonthStats.expense) / prevMonthStats.expense) * 100;
        return change.toFixed(1);
    }, [stats.expense, prevMonthStats]);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-8">
            {/* Header & Month Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">{t('analyticsSub')}</p>
                </div>

                <div className="flex items-center gap-2 bg-background p-1 rounded-lg border">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const idx = months.indexOf(selectedMonth);
                            if (idx < months.length - 1) setSelectedMonth(months[idx + 1]);
                        }}
                        disabled={months.indexOf(selectedMonth) === months.length - 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-1 font-medium min-w-[140px] text-center">
                        {formatMonth(selectedMonth)}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const idx = months.indexOf(selectedMonth);
                            if (idx > 0) setSelectedMonth(months[idx - 1]);
                        }}
                        disabled={months.indexOf(selectedMonth) === 0}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Monthly Budget</CardDescription>
                        <CardTitle className="text-2xl">₹{(50000 - stats.expense).toLocaleString()}</CardTitle>
                        <p className="text-xs text-muted-foreground">of ₹50,000 remaining</p>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t('totalIncome')}</CardDescription>
                        <CardTitle className="text-2xl text-green-600">₹{stats.income.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t('totalExpenses')}</CardDescription>
                        <CardTitle className="text-2xl text-red-600">₹{stats.expense.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-1 text-primary">
                            <Lightbulb className="w-4 h-4" />
                            <CardDescription className="font-bold uppercase tracking-wider text-[10px]">{t('smartTip')}</CardDescription>
                        </div>
                        <p className="text-sm font-medium leading-tight">
                            {parseFloat(expenseChange) > 10
                                ? t('tipShopping')
                                : t('tipSaving')}
                        </p>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Breakdown Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="w-5 h-5" />
                            {t('expenseBreakdown')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'currentColor', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {stats.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights for Selected Month */}
                <div className="space-y-4">
                    {insights.slice(0, 2).map((insight) => (
                        <Card key={insight.id} className="border-l-4 border-l-primary/50">
                            <CardContent className="p-4 flex gap-4">
                                <div className={cn(
                                    "p-2 rounded-lg h-fit",
                                    insight.type === 'alert' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'
                                )}>
                                    {insight.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">{insight.title}</h4>
                                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Categorization Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            {t('transactionsIn')} {formatMonth(selectedMonth)}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">{filteredTransactions.length} {t('entriesLabel')}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('description')}</TableHead>
                                <TableHead>{t('category')}</TableHead>
                                <TableHead>{t('aiTag')}</TableHead>
                                <TableHead className="text-right">{t('amount')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell className="font-medium">{txn.description}</TableCell>
                                    <TableCell>{txn.category}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {t(txn.aiTag) || t('unsorted')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={cn("text-right font-bold", txn.type === 'income' ? 'text-green-600' : 'text-foreground')}>
                                        {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Analytics;
