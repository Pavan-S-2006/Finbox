import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle, TrendingUp, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const StrategyAnalysis = ({ inputs, outputs }) => {
    const { health, financials } = outputs;
    const { constraints } = inputs;

    // --- "AI" LOGIC ENGINE ---
    const generateInsight = () => {
        const insights = [];
        let status = 'neutral'; // neutral, warning, success
        let headline = "Analyzing Strategy...";

        // 1. SAFETY ANALYSIS (Runway vs Buffer)
        if (health.runwayMonths < 1) {
            status = 'critical';
            headline = "CRITICAL: Immediate Insolvency Risk";
            insights.push("Your liquidity is non-existent. You are essentially operating on zero safety margin. One unexpected expense will force debt.");
        } else if (health.runwayMonths < constraints.emergencyBufferMonths) {
            status = 'warning';
            headline = "Vulnerable Strategy";
            const shortfall = constraints.emergencyBufferMonths - health.runwayMonths;
            insights.push(`You are ${shortfall.toFixed(1)} months short of your own safety target. Your current strategy prioritizes spending over security.`);
        } else {
            status = 'success';
            headline = "Solid Foundation";
            insights.push("Your defence is strong. You have successfully secured your emergency runway.");
        }

        // 2. EFFICIENCY ANALYSIS (Surplus & Growth)
        if (financials.monthlySurplus <= 0) {
            insights.push("Your cashflow is negative or zero. You are burning wealth rather than building it. Investment is impossible in this state.");
        } else {
            const savingsRate = (financials.monthlySurplus / financials.totalIncome) * 100;
            if (savingsRate > 30) {
                insights.push("Excellent efficiency! You are saving aggressive amounts (" + savingsRate.toFixed(0) + "%). This surplus is your wealth engine.");
            } else if (savingsRate < 10) {
                insights.push("Your savings rate is low (<10%). While you are safe, your wealth growth is sluggish.");
            }
        }

        // 3. LAZY CASH DETECTOR (Too much liquid vs invested)
        const excessiveBuffer = constraints.emergencyBufferMonths * 2;
        if (health.runwayMonths > excessiveBuffer && financials.investmentCapacity > 0) {
            insights.push("AI Observation: You might be holding too much cash. You have " + (health.runwayMonths).toFixed(1) + " months of runway, which is conservative. Consider deploying more into investments.");
        }

        // 4. ONE-TIME PURCHASE IMPACT
        if (inputs.expenses.oneTime > 0) {
            if (financials.investmentCapacity === 0) {
                insights.push(`The '${inputs.expenses.oneTimeName || 'Scenario Expense'}' purchase is blocking your ability to invest. It consumes your entire deployable surplus.`);
            }
        }

        return { headline, status, text: insights.join(" ") };
    };

    const analysis = generateInsight();

    const getGradient = (status) => {
        switch (status) {
            case 'success': return "from-green-500/10 via-emerald-500/5 to-transparent border-green-500/20";
            case 'warning': return "from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20";
            case 'critical': return "from-red-500/10 via-rose-500/5 to-transparent border-red-500/20";
            default: return "from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/20";
        }
    };

    return (
        <Card className={`border-2 bg-gradient-to-br ${getGradient(analysis.status)} relative overflow-hidden`}>
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-24 h-24" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-primary text-lg">
                        <Sparkles className="w-5 h-5 text-purple-500 fill-purple-500 animate-pulse" />
                        AI Strategy Analysis
                    </CardTitle>
                    <Badge variant={analysis.status === 'success' ? 'default' : analysis.status === 'critical' ? 'destructive' : 'secondary'}>
                        {analysis.status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <h3 className="font-bold text-xl mb-2">{analysis.headline}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {analysis.text}
                </p>
                {/* Simulated Typing/Cursor effect could go here for extra 'AI' feel */}
            </CardContent>
        </Card>
    );
};

export default StrategyAnalysis;
