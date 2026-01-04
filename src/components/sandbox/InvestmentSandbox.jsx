import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Lock, TrendingUp, AlertCircle, Save, LineChart, PlayCircle, X, ChevronRight, ChevronLeft, Lightbulb, RefreshCw, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { blueprintService } from '../../services/blueprintService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const STEPS_MAP = {
    lumpsum: [
        {
            id: 'allocation',
            category: 'investment',
            field: 'allocationPct',
            label: 'Capital Allocation',
            description: "Decide how much of your investable surplus to commit.",
            impact: "Higher allocation means more wealth compounding, but less liquidity for emergencies.",
            targetValue: 60,
            typingSpeed: 50
        },
        {
            id: 'risk',
            category: 'investment',
            field: 'riskTolerance',
            label: 'Risk Profile',
            description: "Choose your investment style based on your horizon.",
            impact: "Higher risk offers higher potential returns but comes with market volatility.",
            targetValue: 'moderate',
            typingSpeed: 0
        }
    ],
    sip: [
        {
            id: 'sipAmount',
            category: 'investment',
            field: 'sipAmount',
            label: 'Monthly Contribution',
            description: "How much can you consistently invest every month?",
            impact: "Consistency is key. Even small amounts compound significantly over time.",
            targetValue: 5000,
            typingSpeed: 50
        },
        {
            id: 'risk',
            category: 'investment',
            field: 'riskTolerance',
            label: 'Risk Profile',
            description: "Choose where to allocate your monthly savings.",
            impact: "Aggressive SIPs work well for long horizons (10y+) due to rupee cost averaging.",
            targetValue: 'moderate',
            typingSpeed: 0
        }
    ],
    swp: [
        {
            id: 'swpWithdrawal',
            category: 'investment',
            field: 'swpWithdrawal',
            label: 'Monthly Withdrawal',
            description: "How much income do you need from your corpus?",
            impact: "High withdrawals deplete your capital faster than it can grow.",
            targetValue: 10000,
            typingSpeed: 50
        },
        {
            id: 'risk',
            category: 'investment',
            field: 'riskTolerance',
            label: 'Risk Profile',
            description: "Conservative is recommended for SWP to protect capital.",
            impact: "Volatile funds can deplete capital rapidly during market downturns.",
            targetValue: 'conservative',
            typingSpeed: 0
        }
    ]
};

// Helper Component for Simulation Highlight & Tooltip
const GuidedContainer = ({ stepIndex, simStep, onNext, onPrev, currentSteps, children, className, tooltipSide = 'right' }) => {
    const isActive = stepIndex === simStep;
    const stepInfo = currentSteps[stepIndex];

    return (
        <div className={`relative transition-all duration-300 ${isActive ? 'z-50 scale-105 ring-4 ring-primary ring-offset-4 rounded-lg bg-background shadow-xl' : ''} ${className}`}>
            {children}

            {isActive && stepInfo && (
                <div className={`absolute top-0 ${tooltipSide === 'right' ? 'left-full ml-6' : 'right-full mr-6'} w-80 p-0 bg-popover text-popover-foreground rounded-xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-300 z-50`}>
                    {/* Header */}
                    <div className="p-4 border-b border-border/50 bg-muted/50 rounded-t-xl">
                        <h4 className="font-bold text-sm flex items-center gap-2 text-primary">
                            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                            {stepInfo.label}
                        </h4>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3 bg-card">
                        <p className="text-sm text-card-foreground leading-relaxed font-medium">
                            {stepInfo.description}
                        </p>
                        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                            <p className="text-xs font-bold text-primary mb-1">Impact Analysis</p>
                            <p className="text-xs text-muted-foreground italic tracking-wide">
                                "{stepInfo.impact}"
                            </p>
                        </div>
                    </div>

                    {/* Footer / Controls */}
                    <div className="p-3 border-t border-border/50 bg-muted/50 rounded-b-xl flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={onPrev}
                                disabled={simStep === 0}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-8 px-4 text-xs gap-2"
                                onClick={onNext}
                            >
                                {simStep === currentSteps.length - 1 ? 'Finish' : 'Next'}
                                <span className="ml-1 text-[10px] opacity-70">(Space)</span>
                                <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                            Step {simStep + 1} / {currentSteps.length}
                        </span>
                    </div>

                    {/* Arrow Pointer */}
                    <div className={`absolute top-6 ${tooltipSide === 'right' ? '-left-2 border-l border-b' : '-right-2 border-r border-t'} w-4 h-4 bg-popover border-border rotate-45 transform`}></div>
                </div>
            )}
        </div>
    );
};

const InvestmentSandbox = forwardRef(({ inputs, outputs, onUpdate, onSimulationChange }, ref) => {
    const { investment } = inputs;
    const { investment: invResults, financials } = outputs; // access financials for monthly surplus
    const { maxInvestable, actualInvestment, projection } = invResults;
    const { monthlySurplus } = financials; // Get monthly surplus

    const invType = investment.type || 'lumpsum';
    const currentSteps = STEPS_MAP[invType] || STEPS_MAP.lumpsum;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);

    const [saving, setSaving] = useState(false);
    const [blueprintName, setBlueprintName] = useState('');

    // Simulation State
    const [simStep, setSimStep] = useState(null);
    const [initialState, setInitialState] = useState(null);

    useImperativeHandle(ref, () => ({
        toggleSimulation: () => {
            if (simStep === null) {
                startSimulation();
            } else {
                stopSimulation();
            }
        }
    }));

    useEffect(() => {
        if (onSimulationChange) {
            onSimulationChange(simStep !== null);
        }
    }, [simStep, onSimulationChange]);

    // Spacebar Navigation Logic
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (simStep !== null && (e.code === 'Space' || e.key === ' ')) {
                e.preventDefault();
                if (simStep < currentSteps.length - 1) {
                    setSimStep(prev => prev + 1);
                } else {
                    finishSimulation();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [simStep, currentSteps]);

    const startSimulation = () => {
        setInitialState(JSON.parse(JSON.stringify(inputs)));
        setSimStep(0);
    };

    const nextStep = () => {
        if (simStep < currentSteps.length - 1) {
            setSimStep(prev => prev + 1);
        } else {
            finishSimulation();
        }
    };

    const prevStep = () => {
        if (simStep > 0) {
            setSimStep(prev => prev - 1);
        }
    };

    const stopSimulation = () => {
        finishSimulation();
    };

    const finishSimulation = () => {
        setSimStep(null);
    };

    const handleSave = async () => {
        if (!blueprintName) return;
        setSaving(true);
        await blueprintService.saveBlueprint({ name: blueprintName }, { inputs, outputs });
        setSaving(false);
        setBlueprintName('');
        alert('Investment Scenario Saved!');
    };

    const handleTypeChange = (val) => {
        onUpdate('investment', 'type', val);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* OVERLAY for Dimming Background during Simulation */}
            {simStep !== null && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-[2px] z-40 transition-all duration-500" />
            )}

            {/* TYPE SELECTION (Disabled during simulation) */}
            <div className={`flex justify-center ${simStep !== null ? 'z-50 pointer-events-none opacity-80' : ''}`}>
                <Tabs value={invType} onValueChange={handleTypeChange} className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="lumpsum">One Time</TabsTrigger>
                        <TabsTrigger value="sip">SIP</TabsTrigger>
                        <TabsTrigger value="swp">SWP</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* LEFT: CONTROLS */}
                <div className={`space-y-6 ${simStep !== null ? 'z-50' : ''}`}>

                    {/* DYNAMIC INPUT CARD */}
                    <Card className={`border-l-4 border-l-primary/50 transition-all duration-500`}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    {invType === 'lumpsum' && <Lock className="w-5 h-5" />}
                                    {invType === 'sip' && <ArrowUpCircle className="w-5 h-5" />}
                                    {invType === 'swp' && <ArrowDownCircle className="w-5 h-5" />}
                                    {invType === 'lumpsum' ? 'Investment Capacity' : invType === 'sip' ? 'SIP Configuration' : 'SWP Configuration'}
                                </CardTitle>
                            </div>
                            <CardDescription>
                                {invType === 'lumpsum' && "Derived from Net Liquid Assets - Buffer."}
                                {invType === 'sip' && "Invest monthly surplus into wealth creation."}
                                {invType === 'swp' && "Withdraw monthly income from your corpus."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* BASE STAT DISPLAY */}
                            <div className="p-4 bg-muted text-center rounded-lg border">
                                <p className="text-xs font-medium uppercase text-muted-foreground">
                                    {invType === 'lumpsum' ? 'Investable Capacity' : invType === 'sip' ? 'Monthly Surplus' : 'Corpus Available'}
                                </p>
                                <p className="text-3xl font-bold mt-1">
                                    {invType === 'sip' ? formatCurrency(monthlySurplus) : formatCurrency(maxInvestable)}
                                </p>
                            </div>

                            {/* DYNAMIC INPUTS */}

                            {/* LUMPSUM INPUTS */}
                            {invType === 'lumpsum' && (
                                <GuidedContainer stepIndex={0} currentSteps={currentSteps} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <Label>Allocation %</Label>
                                        <span className="font-bold">{investment.allocationPct}%</span>
                                    </div>
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={[investment.allocationPct]}
                                        onValueChange={(val) => onUpdate('investment', 'allocationPct', val[0])}
                                        disabled={maxInvestable <= 0}
                                        className={maxInvestable <= 0 ? "opacity-50" : ""}
                                    />
                                    <div className="flex justify-between pt-2 border-t border-dashed">
                                        <span className="text-muted-foreground text-sm">Total Investment</span>
                                        <span className="font-bold">{formatCurrency(actualInvestment)}</span>
                                    </div>
                                </GuidedContainer>
                            )}

                            {/* SIP INPUTS */}
                            {invType === 'sip' && (
                                <GuidedContainer stepIndex={0} currentSteps={currentSteps} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <Label>Monthly SIP Amount</Label>
                                        <span className="font-bold">{formatCurrency(investment.sipAmount || 0)}</span>
                                    </div>
                                    <Slider
                                        min={0}
                                        max={Math.max(1000, monthlySurplus)}
                                        step={500}
                                        value={[investment.sipAmount || 0]}
                                        onValueChange={(val) => onUpdate('investment', 'sipAmount', val[0])}
                                    />
                                    <div className="flex justify-between pt-2 border-t border-dashed">
                                        <span className="text-muted-foreground text-sm">Annual Investment</span>
                                        <span className="font-bold">{formatCurrency((investment.sipAmount || 0) * 12)}</span>
                                    </div>
                                </GuidedContainer>
                            )}

                            {/* SWP INPUTS */}
                            {invType === 'swp' && (
                                <GuidedContainer stepIndex={0} currentSteps={currentSteps} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <Label>Monthly Withdrawal</Label>
                                        <span className="font-bold">{formatCurrency(investment.swpWithdrawal || 0)}</span>
                                    </div>
                                    <Slider
                                        min={0}
                                        max={Math.max(1000, maxInvestable / 12)} // Limit withdrawal to something reasonable? Or just maxInvestable
                                        step={500}
                                        value={[investment.swpWithdrawal || 0]}
                                        onValueChange={(val) => onUpdate('investment', 'swpWithdrawal', val[0])}
                                    />
                                    <div className="flex justify-between pt-2 border-t border-dashed">
                                        <span className="text-muted-foreground text-sm">Annual Withdrawal</span>
                                        <span className="font-bold">{formatCurrency((investment.swpWithdrawal || 0) * 12)}</span>
                                    </div>
                                </GuidedContainer>
                            )}

                        </CardContent>
                    </Card>

                    {/* RISK PROFILE (Shared across all types) */}
                    <Card className={`transition-all duration-500 ${(simStep !== null && simStep !== 1) ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}`}>
                        <CardHeader>
                            <CardTitle className="text-base">Risk Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GuidedContainer stepIndex={1} currentSteps={currentSteps} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-3">
                                {['conservative', 'moderate', 'aggressive'].map(type => (
                                    <Button
                                        key={type}
                                        variant={investment.riskTolerance === type ? "default" : "outline"}
                                        className="w-full justify-between h-auto py-3 px-4"
                                        onClick={() => onUpdate('investment', 'riskTolerance', type)}
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="capitalize font-semibold">{type}</span>
                                            <span className="text-[10px] opacity-80 font-normal">
                                                {type === 'conservative' && 'FDs, Debt Funds. Low Volatility. ~7%'}
                                                {type === 'moderate' && 'Balanced Funds. Med Volatility. ~12%'}
                                                {type === 'aggressive' && 'Small Cap. High Volatility. ~18%'}
                                            </span>
                                        </div>
                                        {investment.riskTolerance === type && <div className="h-2 w-2 rounded-full bg-background" />}
                                    </Button>
                                ))}
                            </GuidedContainer>
                        </CardContent>
                    </Card>

                    {/* SAVE SCENARIO */}
                    <Card className={`transition-all duration-500 ${simStep !== null ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Plan Name"
                                    value={blueprintName}
                                    onChange={(e) => setBlueprintName(e.target.value)}
                                    disabled={simStep !== null}
                                />
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !blueprintName || simStep !== null}
                                >
                                    <Save className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* RIGHT: PROJECTIONS */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="w-6 h-6" />
                            {invType === 'lumpsum' && 'Wealth Projection'}
                            {invType === 'sip' && 'SIP Growth Projection'}
                            {invType === 'swp' && 'Corpus Depletion Projection'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Check Valid Conditions */}
                        {(invType === 'lumpsum' && maxInvestable <= 0) || (invType === 'sip' && monthlySurplus <= 0) ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed text-sm">
                                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                                {invType === 'sip' ? (
                                    <>
                                        <p>No monthly surplus available.</p>
                                        <p>Reduce expenses to enable SIP.</p>
                                    </>
                                ) : (
                                    <>
                                        <p>No investable surplus.</p>
                                        <p>Increase liquid assets or reduce One-Time expenses.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* 10 Year Metric */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 3, 5, 10].map(yr => (
                                        <div key={yr} className="p-3 bg-muted/30 rounded-lg text-center border">
                                            <p className="text-xs text-muted-foreground mb-1">Year {yr}</p>
                                            <p className="font-bold text-sm">
                                                {formatCurrency(projection.projectedReturns[yr])}
                                            </p>
                                            {invType !== 'swp' && (
                                                <div className="text-[10px] text-green-600 mt-1 font-medium">
                                                    +{Math.round(((projection.projectedReturns[yr] - (actualInvestment * (invType === 'sip' ? (yr * 12) : 1))) / (actualInvestment * (invType === 'sip' ? (yr * 12) : 1))) * 100)}%
                                                </div>
                                            )}
                                            {invType === 'swp' && (
                                                <div className="text-[10px] text-red-600 mt-1 font-medium">
                                                    - {formatCurrency((investment.swpWithdrawal || 0) * 12 * yr)} withdrawn
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Chart Visualization (Recharts AreaChart) */}
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={projection.graphData}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis
                                                dataKey="year"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10 }}
                                                label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 10 }}
                                            />
                                            <YAxis
                                                hide={true}
                                            />
                                            <RechartsTooltip
                                                formatter={(value) => formatCurrency(value)}
                                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="totalValue"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorTotal)"
                                                name="Projected Value"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="investedAmount"
                                                stroke="hsl(var(--muted-foreground))"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorInvested)"
                                                name="Total Invested / Initial"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs flex gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                                    <p className="text-amber-900 dark:text-amber-100">
                                        <strong>Volatility Warning:</strong> You selected a <strong>{investment.riskTolerance}</strong> profile.
                                        Based on historic data, your portfolio value could fluctuate by <strong>
                                            {investment.riskTolerance === 'conservative' ? '3-5%' : investment.riskTolerance === 'moderate' ? '10-15%' : '20-30%'}
                                        </strong> annually.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});

export default InvestmentSandbox;
