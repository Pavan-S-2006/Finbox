import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Check, Trophy, TrendingUp, AlertTriangle, Info, Wallet, CreditCard, ShoppingCart, Activity, ShieldCheck } from 'lucide-react';

const steps = [
    {
        title: "Welcome to your Financial Laboratory",
        description: "Think of this as a flight simulator for your money. You can crash here safely without losing a single rupee in real life.",
        bullets: [
            "We use your actual data as a starting point.",
            "Nothing you change here affects your real records.",
            "Experiment freely!"
        ],
        icon: <Info className="w-12 h-12 text-primary" />
    },
    {
        title: "Step 1: The Fuel (Income & Assets)",
        description: "On the left, you'll see your 'Fuel Tanks'. Increasing these gives you more runway.",
        bullets: [
            "Liquid Assets: Cash/Savings available instantly.",
            "Locked Assets: Property/PF (Long term wealth).",
            "Income: Money flowing in every month."
        ],
        icon: <Wallet className="w-12 h-12 text-blue-500" />
    },
    {
        title: "Step 2: The Leaks (Expenses)",
        description: "Below Income, you have Expenses. To boost wealth, plug these leaks.",
        bullets: [
            "Fixed: Rent, EMI, Bills (Hard to cut).",
            "Discretionary: Fun, Food, Travel (Your control center).",
            "Impact: High expenses = Shorter survival time."
        ],
        icon: <CreditCard className="w-12 h-12 text-red-500" />
    },
    {
        title: "Step 3: 'What If' Simulator",
        description: "Want to buy a car? Or a new Laptop? Test it here first.",
        bullets: [
            "Use the 'Simulate One-Time Purchase' box.",
            "Enter the cost (e.g., ₹1,00,000).",
            "Watch your Health Score change instantly.",
            "Better to simulate debt here than in real life!"
        ],
        icon: <ShoppingCart className="w-12 h-12 text-purple-500" />
    },
    {
        title: "Step 4: Financial Health Score",
        description: "The Gauge in the center is your 'Financial Fitness Tracker'.",
        bullets: [
            "0-40 (Critical): Danger Zone.",
            "40-70 (Stable): You are surviving.",
            "70-100 (Excellent): You are thriving.",
            "Goal: Keep this Green!"
        ],
        icon: <Activity className="w-12 h-12 text-green-500" />
    },
    {
        title: "Step 5: Monthly Growth Engine",
        description: "This is the fresh cash you generate every month. It fuels your future investments.",
        bullets: [
            "Incoming Salary - Outgoing Expenses = Surplus.",
            "This 'Surplus' is what you can invest systematically (SIP).",
            "Existing Assets (Savings) are for Security & One-time goals."
        ],
        icon: <TrendingUp className="w-12 h-12 text-amber-500" />
    },
    {
        title: "Ready to Fly?",
        description: "You're now the pilot. Experiment with crazy scenarios.",
        bullets: [
            "What if you quit your job?",
            "What if you cut dining costs by 50%?",
            "Hover over (?) icons for help."
        ],
        icon: <ShieldCheck className="w-12 h-12 text-teal-500" />
    }
];

const SandboxGuide = ({ open, onOpenChange }) => {
    // ... logic remains same ...
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onOpenChange(false);
            setTimeout(() => setCurrentStep(0), 300);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const step = steps[currentStep];

    // ... render ... 


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl sm:rounded-2xl bg-transparent">
                <div className="relative bg-background/95 backdrop-blur-xl border border-white/20 p-6 sm:p-8 h-[500px] flex flex-col items-center justify-between text-center select-none dark:border-gray-800">

                    {/* Background Blobs (Decoration) */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

                    {/* Header / Skip */}
                    <div className="w-full flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        <span>Guide {currentStep + 1}/{steps.length}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-transparent hover:text-primary"
                            onClick={() => onOpenChange(false)}
                        >
                            Skip
                        </Button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full animate-in fade-in slide-in-from-right-4 duration-300 key={currentStep}">

                        {/* Icon Container with Glow */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500"></div>
                            <div className="relative bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900  p-6 rounded-full shadow-lg border border-white/50 dark:border-gray-700">
                                {step.icon}
                            </div>
                        </div>

                        <div className="space-y-4 max-w-xs text-left">
                            <h2 className="text-2xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                {step.title}
                            </h2>
                            <p className="text-sm text-center text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                            {/* Bullet Points */}
                            <ul className="space-y-2 mt-4">
                                {step.bullets && step.bullets.map((bullet, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer / Nav */}
                    <div className="w-full space-y-6">
                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
                                ></div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-primary/20"
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                            >
                                Back
                            </Button>
                            <Button
                                className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 border-0"
                                onClick={handleNext}
                            >
                                {currentStep === steps.length - 1 ? "Let's Start" : "Next Step"}
                                {currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2 opacity-80" />}
                            </Button>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SandboxGuide;
