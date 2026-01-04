import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TrendingUp, Activity, AlertTriangle, Save, DollarSign, Wallet, Lightbulb, CheckCircle, XCircle, Scale, Brain, PlayCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { blueprintService } from '../../services/blueprintService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const SIMULATION_STEPS = [
    {
        id: 'liquidItems',
        category: 'assets',
        field: 'liquid',
        label: 'Liquid Assets',
        description: "Cash, Savings, Stocks - Money you can access instantly.",
        impact: "It is responsible for your 'Runway' duration. Higher liquid assets mean you can survive longer without income.",
        targetValue: 500000,
        typingSpeed: 30
    },
    {
        id: 'lockedItems',
        category: 'assets',
        field: 'locked',
        label: 'Locked Assets',
        description: "Real Estate, PF, FD - Long term wealth.",
        impact: "It is responsible for your overall Net Worth, but cannot be used for immediate emergencies.",
        targetValue: 2500000,
        typingSpeed: 30
    },
    {
        id: 'fixedIncome',
        category: 'income',
        field: 'fixed',
        label: 'Fixed Monthly Income',
        description: "Salary, Rent - Consistent monthly inflow.",
        impact: "It is responsible for covering your recurring expenses. This is your primary cashflow engine.",
        targetValue: 85000,
        typingSpeed: 30
    },
    {
        id: 'varIncome',
        category: 'income',
        field: 'variable',
        label: 'Variable Income',
        description: "Freelance, Bonuses, Dividends.",
        impact: "It is responsible for boosting your surplus, accelerating investments or one-time purchases.",
        targetValue: 15000,
        typingSpeed: 30
    },
    {
        id: 'fixedExp',
        category: 'expenses',
        field: 'fixed',
        label: 'Fixed Expenses',
        description: "Rent, EMI, Utilities - Must pay bills.",
        impact: "It is responsible for draining your income. Keeping this low improves your financial resilience.",
        targetValue: 35000,
        typingSpeed: 30
    },
    {
        id: 'varExp',
        category: 'expenses',
        field: 'variable',
        label: 'Discretionary Expenses',
        description: "Dining, Movies, Hobbies - Lifestyle costs.",
        impact: "It is responsible for your quality of life but is the first thing to cut during financial stress.",
        targetValue: 12000,
        typingSpeed: 30
    },
    {
        id: 'buffer',
        category: 'constraints',
        field: 'emergencyBufferMonths',
        label: 'Emergency Buffer',
        description: "Your safety net goal.",
        impact: "It defines how many months of expenses you want to secure. 6 months is recommended.",
        targetValue: 6,
        typingSpeed: 200
    },
    {
        id: 'oneTime',
        category: 'expenses',
        field: 'oneTime',
        label: 'One-Time Purchase',
        description: "Test big purchases like a car or vacation.",
        impact: "Instantly see how a major expense crashes your runway or depletes your savings.",
        targetValue: 50000,
        typingSpeed: 30
    },
    {
        id: 'save',
        category: 'system',
        field: 'save',
        label: 'Save Snapshot',
        description: "Save this scenario to compare later.",
        impact: "Allows you to build multiple financial plans (e.g., 'Buying House' vs 'Renting') and choose the best one.",
        targetValue: 0,
        typingSpeed: 0
    }
];

// Helper Component for Simulation Highlight & Tooltip
const GuidedContainer = ({ stepIndex, simStep, onNext, onPrev, children, className, tooltipSide = 'right' }) => {
    const isActive = stepIndex === simStep;
    const stepInfo = SIMULATION_STEPS[stepIndex];

    return (
        <div className={`relative transition-all duration-300 ${isActive ? 'z-50 scale-105 ring-4 ring-primary ring-offset-4 rounded-lg bg-background shadow-xl' : ''} ${className}`}>
            {children}

            {isActive && (
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
                                {simStep === SIMULATION_STEPS.length - 1 ? 'Finish' : 'Next'}
                                <span className="ml-1 text-[10px] opacity-70">(Space)</span>
                                <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                            Step {simStep + 1} / {SIMULATION_STEPS.length}
                        </span>
                    </div>

                    {/* Arrow Pointer */}
                    <div className={`absolute top-6 ${tooltipSide === 'right' ? '-left-2 border-l border-b' : '-right-2 border-r border-t'} w-4 h-4 bg-popover border-border rotate-45 transform`}></div>
                </div>
            )}
        </div>
    );
};

const PurchaseViabilityCard = ({ expenses, financials, assets, constraints, onNavigate, formatCurrency, saveSlot }) => {
    // --- CUSTOMIZATION STATE ---
    const [config, setConfig] = useState({
        interestRate: 14,      // %
        loanTenure: 12,        // months
        downPaymentPercent: 30, // %
        squeezePercent: 50,    // %
        sipReturnRate: 12,     // % (Annual Return)
        bufferMargin: 0        // Months (Extra buffer for Cash option)
    });

    // State for selection 
    const [selectedId, setSelectedId] = useState('sip');

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };
    const purchaseAmount = expenses.oneTime;

    if (!purchaseAmount || purchaseAmount === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50 p-6">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8" />
                </div>
                <p className="text-lg text-center">Select a purchase amount to analyze its viability.</p>
            </div>
        );
    }

    // --- BASE DATA ---
    const surplus = financials.monthlySurplus;
    const liquidAssets = assets.liquid;
    const discretionaryExp = expenses.variable;
    const monthlyExpenses = expenses.fixed + expenses.variable;
    const safeBuffer = monthlyExpenses * (constraints.emergencyBufferMonths || 6);

    // --- OPTION CALCULATIONS ---

    // --- OPTION CALCULATIONS (DYNAMIC) ---

    // 1. SMART SIP (Base Surplus)
    // Formula: Future Value of SIP? Or just simple months? 
    // For simplicity & time-estimation, we'll use simple accumulation + return estimate.
    // Monthly Return Rate = sipReturnRate / 12 / 100
    // But sticking to simple "Months to Goal" logic for now:
    // If we assume growth, the required amount is less? No, target is fixed.
    // Let's stick to: How long to reach Goal with growth?
    // FV = P * ({ (1+r)^n - 1 } / r) * (1+r)  <-- solving for n is complex.
    // Let's keep Simple: Purchase Amount / Surplus. 
    // *Enhancement*: Show "Potential Return" in text if we use return rate.
    const sipMonths = surplus > 0 ? Math.ceil(purchaseAmount / surplus) : 999;
    const sipViable = surplus > 0;

    // 2. STANDARD EMI
    const interestRate = config.interestRate / 100;
    const tenureMonths = config.loanTenure;
    const monthlyRate = interestRate / 12;
    // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emiBase = (purchaseAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const totalEmiCost = emiBase * tenureMonths;
    const emiViable = surplus >= emiBase;

    // 3. BUDGET SQUEEZE (EMI) -> Cut Discretionary
    const squeezeAmount = discretionaryExp * (config.squeezePercent / 100);
    const newSurplus = surplus + squeezeAmount;
    const squeezeEmiViable = newSurplus >= emiBase;

    // 4. HYBRID FINANCING (Down Payment + EMI)
    const downPayment = purchaseAmount * (config.downPaymentPercent / 100);
    const hybridLoan = purchaseAmount - downPayment;
    const hybridEmi = (hybridLoan * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const hybridLiquidRemaining = liquidAssets - downPayment;
    const hybridViable = hybridLiquidRemaining >= (safeBuffer * 0.5) && surplus >= hybridEmi;

    // 5. AGGRESSIVE SIP (Squeeze + Surplus)
    const aggressiveSipMonths = newSurplus > 0 ? Math.ceil(purchaseAmount / newSurplus) : 999;
    const aggressiveViable = newSurplus > 0;

    // 6. CASH
    // Add buffer margin to safety check
    const requiredBuffer = safeBuffer + (monthlyExpenses * config.bufferMargin);
    const cashRemaining = liquidAssets - purchaseAmount;
    const cashViable = cashRemaining >= requiredBuffer;


    // --- OPTIONS LIST ---
    const options = [
        {
            id: 'sip',
            label: '1. Smart SIP (Invest)',
            viable: sipViable,
            subtitle: "Current Surplus",
            summary: sipViable ? `Save for ~${sipMonths} mo` : "No surplus.",
            explanation: "Invest your monthly surplus into a Systematic Investment Plan (SIP). Safe, earns interest, but requires patience.",
            math: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Purchase:</span> <span>{formatCurrency(purchaseAmount)}</span></div>
                    <div className="flex justify-between"><span>Current Surplus:</span> <span>{formatCurrency(surplus)}/mo</span></div>
                    <Separator className="bg-foreground/20" />
                    <div className="flex justify-between font-bold"><span>Goal Reached:</span> <span>~{sipMonths} Months</span></div>
                    <div className="text-xs text-muted-foreground mt-1">Earn interest while you wait. Safe.</div>
                </div>
            )
        },
        {
            id: 'emi',
            label: '2. Standard EMI',
            viable: emiViable,
            subtitle: "12-Month Loan",
            summary: emiViable ? `Pay ${formatCurrency(emiBase)}/mo` : "EMI > Surplus.",
            explanation: `Buy immediately. You pay ${config.interestRate}% interest over ${config.loanTenure} months.`,
            math: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Loan Value:</span> <span>{formatCurrency(purchaseAmount)}</span></div>
                    <div className="flex justify-between"><span>Interest ({config.interestRate}%):</span> <span>{formatCurrency(totalEmiCost - purchaseAmount)}</span></div>
                    <Separator className="bg-foreground/20" />
                    <div className="flex justify-between font-bold text-destructive"><span>Monthly EMI:</span> <span>{formatCurrency(emiBase)}</span></div>
                    <div className="text-xs text-muted-foreground mt-1">Total Pay: {formatCurrency(totalEmiCost)}</div>
                </div>
            )
        },
        {
            id: 'squeeze_emi',
            label: '3. Budget Squeeze (EMI)',
            viable: squeezeEmiViable,
            subtitle: "Cut Spending 50%",
            summary: squeezeEmiViable ? `Affordable via Cuts` : "Still not affordable.",
            explanation: `Cut discretionary spending by ${config.squeezePercent}% to afford the EMI of ${formatCurrency(emiBase)}.`,
            math: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Current Surplus:</span> <span>{formatCurrency(surplus)}</span></div>
                    <div className="flex justify-between text-green-600"><span>+ Cuts ({config.squeezePercent}%):</span> <span>{formatCurrency(squeezeAmount)}</span></div>
                    <Separator className="bg-foreground/20" />
                    <div className="flex justify-between font-bold"><span>New Capacity:</span> <span>{formatCurrency(newSurplus)}</span></div>
                    <div className="flex justify-between text-destructive text-sm pt-1"><span>EMI Cost:</span> <span>{formatCurrency(emiBase)}</span></div>
                    <div className="text-xs text-muted-foreground mt-1">Loan: {config.loanTenure}mo @ {config.interestRate}%</div>
                </div>
            )
        },
        {
            id: 'hybrid',
            label: '4. Hybrid Financing',
            viable: hybridViable,
            subtitle: "30% Down + EMI",
            summary: hybridViable ? `EMI: ${formatCurrency(hybridEmi)}` : "High Risk.",
            explanation: `Pay ${config.downPaymentPercent}% upfront. Finance the rest over ${config.loanTenure} months.`,
            math: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Down Pay ({config.downPaymentPercent}%):</span> <span>{formatCurrency(downPayment)}</span></div>
                    <div className="flex justify-between"><span>Loan Amount:</span> <span>{formatCurrency(hybridLoan)}</span></div>
                    <Separator className="bg-foreground/20" />
                    <div className="flex justify-between font-bold text-destructive"><span>Reduced EMI:</span> <span>{formatCurrency(hybridEmi)}</span></div>
                    <div className="text-xs text-muted-foreground mt-1">Interest: {config.interestRate}% | Tenure: {config.loanTenure}mo</div>
                </div>
            )
        },
        {
            id: 'agg_sip',
            label: '5. Aggressive Save',
            viable: aggressiveViable,
            subtitle: "Squeeze + Invest",
            summary: aggressiveViable ? `Ready in ~${aggressiveSipMonths} mo` : "Not viable.",
            explanation: "The 'Hard Mode'. Cut expenses AND invest the larger surplus. Fastest zero-debt path, but requires lifestyle sacrifices.",
            math: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Boosted Surplus:</span> <span>{formatCurrency(newSurplus)}</span></div>
                    <div className="flex justify-between"><span>Total Cost:</span> <span>{formatCurrency(purchaseAmount)}</span></div>
                    <Separator className="bg-foreground/20" />
                    <div className="flex justify-between font-bold"><span>Speed:</span> <span>~{aggressiveSipMonths} Months</span></div>
                    <div className="text-xs text-muted-foreground mt-1">Fastest zero-debt path. Hard mode.</div>
                </div>
            )
        },
        {
            id: 'cash',
            label: '6. Full Cash',
            viable: cashViable,
            subtitle: "Buy Now",
            summary: cashViable ? "Safe" : "Dangerous",
            explanation: "Buy outright with cash. Avoids interest but drains liquidity. Ensure you have an emergency buffer left.",
            math: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Liquid:</span> <span>{formatCurrency(liquidAssets)}</span></div>
                    <div className="flex justify-between text-destructive"><span>- Cost:</span> <span>{formatCurrency(purchaseAmount)}</span></div>
                    <Separator className="bg-foreground/20" />
                    <div className="flex justify-between font-bold"><span>Remaining:</span> <span>{formatCurrency(cashRemaining)}</span></div>
                    <div className="text-xs mt-1">Buffer Target: {formatCurrency(safeBuffer)}</div>
                </div>
            )
        }

    ];

    // State for selection 
    const activeOption = options.find(o => o.id === selectedId) || options[0];

    return (
        <div className="h-full flex flex-col gap-4">
            {/* TOP SECTION: SCROLLABLE OPTIONS LIST */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[300px] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {options.map((opt) => (
                    <div
                        key={opt.id}
                        onClick={() => setSelectedId(opt.id)}
                        className={`
                            relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                            ${selectedId === opt.id
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                        `}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className={`font-bold text-sm ${selectedId === opt.id ? 'text-primary' : 'text-foreground'}`}>
                                    {opt.label}
                                </span>
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    {opt.subtitle}
                                </span>
                            </div>

                            <div className="text-right">
                                {opt.viable ? (
                                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">Viable</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">Risky</Badge>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                            {opt.summary}
                        </p>
                    </div>
                ))}

                {/* External Link Button (Only if SIP/Aggressive is selected and viable) */}
                {(selectedId === 'sip' || selectedId === 'agg_sip') && activeOption.viable && onNavigate && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-primary border border-primary/20 hover:bg-primary/10"
                        onClick={() => onNavigate('investment')}
                    >
                        Start Plan in Investment Sandbox <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* BOTTOM SECTION: THE MATH */}
            <div className="border-2 border-primary/10 rounded-xl bg-muted/10 p-5 flex flex-col items-center justify-center min-h-[180px] relative transition-all">
                <div className="w-full max-w-[320px] mb-2 flex justify-between items-center text-xs font-mono text-muted-foreground uppercase tracking-widest border-b pb-1">
                    <span>Analysis</span>
                    <span className="font-bold text-primary">
                        {activeOption?.label?.replace(/^\d+\.\s*/, '') || "Select Option"}
                    </span>
                </div>
                <div className="w-full max-w-[320px] text-sm font-mono leading-relaxed">
                    {activeOption?.math || <div className="text-center text-muted-foreground">Select an option to view analysis</div>}
                </div>
            </div>

            {/* FOOTER: RECOMMENDATION */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-muted-foreground text-center animate-in fade-in slide-in-from-top-1">
                <span className="font-bold text-primary mr-1">Recommendation:</span>
                {activeOption?.explanation || "Review options above."}
            </div>

            {/* DYNAMIC SETTINGS BOX */}
            <div className="border-2 border-primary/10 rounded-xl bg-muted/10 p-5 flex flex-col items-center justify-center min-h-[180px] relative transition-all">
                <div className="w-full max-w-[320px] mb-2 flex justify-between items-center text-xs font-mono text-muted-foreground uppercase tracking-widest border-b pb-1">
                    <span>Customize</span>
                    <span className="font-bold text-primary">
                        {activeOption?.label?.replace(/^\d+\.\s*/, '') || "Settings"}
                    </span>
                </div>

                <div className="w-full max-w-[320px] space-y-3 animate-in fade-in slide-in-from-top-2 pt-1">

                    {/* Interest Rate Input (EMI, Squeeze, Hybrid) */}
                    {(selectedId === 'emi' || selectedId === 'squeeze_emi' || selectedId === 'hybrid') && (
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label className="text-xs text-muted-foreground font-medium">Interest Rate (%)</Label>
                            <Input
                                type="number"
                                className="h-8 font-mono text-right bg-background/50"
                                value={config.interestRate}
                                onChange={(e) => updateConfig('interestRate', Number(e.target.value))}
                            />
                        </div>
                    )}

                    {/* Tenure Input (EMI, Squeeze, Hybrid) */}
                    {(selectedId === 'emi' || selectedId === 'squeeze_emi' || selectedId === 'hybrid') && (
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label className="text-xs text-muted-foreground font-medium">Tenure (Months)</Label>
                            <Input
                                type="number"
                                className="h-8 font-mono text-right bg-background/50"
                                value={config.loanTenure}
                                onChange={(e) => updateConfig('loanTenure', Number(e.target.value))}
                            />
                        </div>
                    )}

                    {/* Squeeze Percentage (Squeeze, Aggressive) */}
                    {(selectedId === 'squeeze_emi' || selectedId === 'agg_sip') && (
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label className="text-xs text-muted-foreground font-medium">Expense Cut (%)</Label>
                            <Input
                                type="number"
                                className="h-8 font-mono text-right bg-background/50"
                                value={config.squeezePercent}
                                onChange={(e) => updateConfig('squeezePercent', Number(e.target.value))}
                            />
                        </div>
                    )}

                    {/* Down Payment (Hybrid) */}
                    {(selectedId === 'hybrid') && (
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label className="text-xs text-muted-foreground font-medium">Down Payment (%)</Label>
                            <Input
                                type="number"
                                className="h-8 font-mono text-right bg-background/50"
                                value={config.downPaymentPercent}
                                onChange={(e) => updateConfig('downPaymentPercent', Number(e.target.value))}
                            />
                        </div>
                    )}

                    {/* Buffer Margin (Cash) */}
                    {(selectedId === 'cash') && (
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label className="text-xs text-muted-foreground font-medium">Safety Margin (Mo)</Label>
                            <Input
                                type="number"
                                className="h-8 font-mono text-right bg-background/50"
                                value={config.bufferMargin}
                                onChange={(e) => updateConfig('bufferMargin', Number(e.target.value))}
                            />
                        </div>
                    )}

                    {/* SIP Return (SIP) */}
                    {(selectedId === 'sip') && (
                        <div className="grid grid-cols-2 items-center gap-4">
                            <Label className="text-xs text-muted-foreground font-medium">Exp. Return (%)</Label>
                            <Input
                                type="number"
                                className="h-8 font-mono text-right bg-background/50"
                                value={config.sipReturnRate}
                                onChange={(e) => updateConfig('sipReturnRate', Number(e.target.value))}
                            />
                        </div>
                    )}

                </div>
            </div>

            {/* SAVE SLOT */}
            {saveSlot && (
                <div className="mt-2 animate-in fade-in slide-in-from-bottom-2">
                    {saveSlot}
                </div>
            )}
        </div>
    );
};

const ExpenditureSandbox = forwardRef(({ inputs, outputs, onUpdate, onNavigate, onSimulationChange }, ref) => {
    const { assets, income, expenses, constraints } = inputs;
    const { health, financials } = outputs;
    const [saving, setSaving] = useState(false);
    const [blueprintName, setBlueprintName] = useState('');

    // Simulation State
    const [simStep, setSimStep] = useState(null); // null = inactive, 0...N = step index
    // We use a ref to track if we've already "typed" for the current step to avoid re-typing on re-renders
    const stepsInited = useRef(new Set());
    // Store initial state to reset after simulation
    const [initialState, setInitialState] = useState(null);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);

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

    // Simulation typing effect - Runs ONLY when step changes
    useEffect(() => {
        if (simStep === null) {
            stepsInited.current.clear();
            return;
        }

        const step = SIMULATION_STEPS[simStep];

        // Skip typing for system steps or if speed is 0
        if (step.typingSpeed === 0 || step.category === 'system') return;

        let currentValue = 0;
        const target = step.targetValue;
        const stepSize = Math.ceil(target / 10); // Faster, fewer updates to reduce blinking

        const typeInterval = setInterval(() => {
            currentValue += stepSize;
            if (currentValue >= target) {
                currentValue = target;
                clearInterval(typeInterval);
                onUpdate(step.category, step.field, currentValue);
                // No auto-advance; wait for user
            } else {
                onUpdate(step.category, step.field, currentValue);
            }
        }, step.typingSpeed);

        return () => {
            clearInterval(typeInterval);
        };
    }, [simStep]);

    // Spacebar Navigation Logic
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check if simulation is active and Spacebar is pressed
            if (simStep !== null && (e.code === 'Space' || e.key === ' ')) {
                e.preventDefault(); // Prevent scrolling
                if (simStep < SIMULATION_STEPS.length - 1) {
                    setSimStep(prev => prev + 1);
                } else {
                    finishSimulation();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [simStep]);

    const startSimulation = () => {
        // Deep copy the inputs to restore later
        setInitialState(JSON.parse(JSON.stringify(inputs)));
        setSimStep(0);
    };

    const nextStep = () => {
        if (simStep < SIMULATION_STEPS.length - 1) {
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
        // Reset inputs to initial state if it exists
        if (initialState) {
            Object.keys(initialState).forEach(category => {
                const catData = initialState[category];
                if (typeof catData === 'object' && catData !== null) {
                    Object.keys(catData).forEach(field => {
                        onUpdate(category, field, catData[field]);
                    });
                }
            });
        }
    };

    const handleSave = async () => {
        if (!blueprintName) return;
        setSaving(true);
        await blueprintService.saveBlueprint({ name: blueprintName }, { inputs, outputs });
        setSaving(false);
        setBlueprintName('');
        alert('Simulation Saved to Blueprint Library!');
    };

    const getRiskBadgeVariant = (level) => {
        switch (level) {
            case 'low': return 'secondary';
            case 'medium': return 'secondary';
            case 'high': return 'destructive';
            case 'critical': return 'destructive';
            default: return 'outline';
        }
    };

    const COLORS = ['#18181b', '#71717a', '#d4d4d8'];

    return (
        <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

            {/* OVERLAY for Dimming Background during Simulation */}
            {simStep !== null && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-[2px] z-40 transition-all duration-500" />
            )}

            {/* LEFT COLUMN: INPUTS */}
            <div className={`lg:col-span-2 space-y-6 ${simStep !== null ? 'z-50' : ''}`}>

                {/* 1. ASSETS & INCOME */}
                <Card className={`transition-all duration-500 ${(simStep !== null && simStep > 3) ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}`}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="w-5 h-5" /> Income & Assets
                            </CardTitle>
                        </div>
                        <CardDescription>Define your financial baseline.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <GuidedContainer stepIndex={0} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-2">
                            <Label>Liquid Assets (Cash/Savings)</Label>
                            <Input
                                type="number"
                                value={assets.liquid}
                                onChange={(e) => onUpdate('assets', 'liquid', Number(e.target.value))}
                            />
                        </GuidedContainer>

                        <GuidedContainer stepIndex={1} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-2">
                            <Label>Locked Assets (Property/PF)</Label>
                            <Input
                                type="number"
                                value={assets.locked}
                                onChange={(e) => onUpdate('assets', 'locked', Number(e.target.value))}
                            />
                        </GuidedContainer>

                        <GuidedContainer stepIndex={2} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-2">
                            <Label>Fixed Monthly Income</Label>
                            <Input
                                type="number"
                                value={income.fixed}
                                onChange={(e) => onUpdate('income', 'fixed', Number(e.target.value))}
                            />
                        </GuidedContainer>

                        <GuidedContainer stepIndex={3} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-2">
                            <Label>Variable Income</Label>
                            <Input
                                type="number"
                                value={income.variable}
                                onChange={(e) => onUpdate('income', 'variable', Number(e.target.value))}
                            />
                        </GuidedContainer>

                    </CardContent>
                </Card>

                {/* 2. RECURRING EXPENSES */}
                <Card className={`border-l-4 border-l-amber-500/50 transition-all duration-500 ${(simStep !== null && (simStep < 4 || simStep > 6)) ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                            <Activity className="w-5 h-5" /> Recurring Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <GuidedContainer stepIndex={4} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-2">
                                <Label>Fixed (Rent/EMI/Bills)</Label>
                                <Input
                                    type="number"
                                    value={expenses.fixed}
                                    onChange={(e) => onUpdate('expenses', 'fixed', Number(e.target.value))}
                                />
                            </GuidedContainer>

                            <GuidedContainer stepIndex={5} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-2">
                                <Label>Discretionary (Fun/Food)</Label>
                                <Input
                                    type="number"
                                    value={expenses.variable}
                                    onChange={(e) => onUpdate('expenses', 'variable', Number(e.target.value))}
                                />
                            </GuidedContainer>

                        </div>

                        <GuidedContainer stepIndex={6} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
                            <span className="text-sm font-medium">Emergency Buffer Target</span>
                            <div className="flex items-center gap-4">
                                <span className="font-bold">{constraints.emergencyBufferMonths} Months</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => onUpdate('constraints', 'emergencyBufferMonths', Math.max(1, constraints.emergencyBufferMonths - 1))}>-</Button>
                                    <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => onUpdate('constraints', 'emergencyBufferMonths', constraints.emergencyBufferMonths + 1)}>+</Button>
                                </div>
                            </div>
                        </GuidedContainer>
                    </CardContent>
                </Card>

                {/* 3. SCENARIO / ONE-TIME - Faded during simulation */}
                <Card className={`border-l-4 border-l-primary/50 transition-all duration-500 ${(simStep !== null && simStep !== 7) ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <TrendingUp className="w-5 h-5" /> One-Time Purchase Simulator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <GuidedContainer stepIndex={7} simStep={simStep} onNext={nextStep} onPrev={prevStep} className="space-y-6">
                            <div className="flex justify-between items-end">
                                <Label>Scenario Expense</Label>
                                <span className="text-xl font-bold">{formatCurrency(expenses.oneTime)}</span>
                            </div>

                            <Slider
                                min={0}
                                max={assets.liquid || 100000}
                                step={1000}
                                value={[expenses.oneTime]}
                                onValueChange={(val) => onUpdate('expenses', 'oneTime', val[0])}
                                className="w-full"
                            />

                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Vacation', val: 50000 },
                                    { label: 'Laptop', val: 150000 },
                                    { label: 'Car', val: 800000 }
                                ].map(item => (
                                    <Button
                                        key={item.label}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onUpdate('expenses', 'oneTime', item.val)}
                                    >
                                        {item.label} ({formatCurrency(item.val)})
                                    </Button>
                                ))}
                            </div>
                        </GuidedContainer>
                    </CardContent>
                </Card>

                {/* 4. Pie Chart - Faded during simulation */}
                <Card className={`overflow-hidden transition-all duration-500 ${(simStep !== null) ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Cashflow Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 md:h-64 flex flex-col items-center justify-center p-0 pb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Fixed Exp', value: financials.totalRecurringExpenses },
                                        { name: 'Surplus', value: Math.max(0, financials.monthlySurplus) }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="fixed" fill={COLORS[1]} />
                                    <Cell key="surplus" fill={COLORS[0]} />
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

            {/* RIGHT COLUMN: REAL-TIME METRICS */}
            <div className={`space-y-6 ${simStep !== null ? 'opacity-100' : ''}`}>

                {/* PURCHASE VIABILITY ANALYSIS CARD */}
                <Card className="h-full flex flex-col border-2 border-primary/20 bg-card text-card-foreground shadow-xl">
                    <CardHeader className="pb-2 border-b">
                        <CardTitle className="text-xl tracking-widest text-center">
                            Purchase Viability
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-6 space-y-6">
                        <PurchaseViabilityCard
                            expenses={expenses}
                            financials={financials}
                            assets={assets}
                            constraints={constraints}
                            onNavigate={onNavigate}
                            formatCurrency={formatCurrency}
                            saveSlot={
                                <div className="border border-border/50 rounded-xl bg-card p-4 shadow-sm">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Save className="w-3 h-3" /> Save Snapshot
                                    </h4>
                                    <GuidedContainer stepIndex={8} simStep={simStep} onNext={nextStep} onPrev={prevStep} tooltipSide="left">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Scenario Name..."
                                                value={blueprintName}
                                                onChange={(e) => setBlueprintName(e.target.value)}
                                                className="h-9 text-sm"
                                            />
                                            <Button
                                                onClick={handleSave}
                                                disabled={saving || !blueprintName}
                                                size="sm"
                                                className="shrink-0"
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </GuidedContainer>
                                </div>
                            }
                        />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
});

export default ExpenditureSandbox;
