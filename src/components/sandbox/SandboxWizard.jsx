import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, CheckCircle, Wallet, TrendingUp, CreditCard, Shield, ShoppingBag } from 'lucide-react';
import SimpleTooltip from './SimpleTooltip';

const SandboxWizard = ({ inputs, onUpdate, onComplete }) => {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const progress = (step / totalSteps) * 100;

    const handleInputChange = (category, field, rawValue) => {
        if (rawValue.includes('-')) return;
        let value = rawValue === '' ? 0 : parseFloat(rawValue);
        if (isNaN(value)) value = 0;
        if (value < 0) value = 0;
        onUpdate(category, field, value);
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onComplete();
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <Card className="border-2 border-primary/10 shadow-lg">
                <CardHeader>
                    {step === 1 && (
                        <>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Wallet className="w-8 h-8 text-blue-500" />
                                Let's start with your Net Worth
                            </CardTitle>
                            <CardDescription className="text-lg">
                                What assets do you currently have? (Fuel for your journey)
                            </CardDescription>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <TrendingUp className="w-8 h-8 text-green-500" />
                                What's coming in?
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Enter your monthly income sources.
                            </CardDescription>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <CreditCard className="w-8 h-8 text-red-500" />
                                What's going out?
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Be honest about your monthly expenses! (The Leaks)
                            </CardDescription>
                        </>
                    )}
                    {step === 4 && (
                        <>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Shield className="w-8 h-8 text-amber-500" />
                                Safety Net
                            </CardTitle>
                            <CardDescription className="text-lg">
                                How many months of expenses do you want as an emergency buffer?
                            </CardDescription>
                        </>
                    )}
                    {step === 5 && (
                        <>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <ShoppingBag className="w-8 h-8 text-purple-500" />
                                One-Time Purchase Simulator
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Planning a big expense? See how it impacts your future.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-6 py-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label className="text-lg">Liquid Assets</Label>
                                    <SimpleTooltip text="Cash, Savings, or Stocks you can sell immediately." />
                                </div>
                                <Input
                                    className="text-lg h-12"
                                    type="number"
                                    min="0"
                                    value={inputs.assets.liquid || ''}
                                    onChange={(e) => handleInputChange('assets', 'liquid', e.target.value)}
                                    placeholder="e.g. 50000"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label className="text-lg">Locked Assets</Label>
                                    <SimpleTooltip text="Long-term wealth like Property, PF, or Gold." />
                                </div>
                                <Input
                                    className="text-lg h-12"
                                    type="number"
                                    min="0"
                                    value={inputs.assets.locked || ''}
                                    onChange={(e) => handleInputChange('assets', 'locked', e.target.value)}
                                    placeholder="e.g. 1500000"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label className="text-lg">Fixed Monthly Income</Label>
                                    <SimpleTooltip text="Your dependable salary or guaranteed income." />
                                </div>
                                <Input
                                    className="text-lg h-12"
                                    type="number"
                                    min="0"
                                    value={inputs.income.fixed || ''}
                                    onChange={(e) => handleInputChange('income', 'fixed', e.target.value)}
                                    placeholder="e.g. 75000"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label className="text-lg">Variable Income</Label>
                                    <SimpleTooltip text="Bonuses, Freelance, or other unpredictable income." />
                                </div>
                                <Input
                                    className="text-lg h-12"
                                    type="number"
                                    min="0"
                                    value={inputs.income.variable || ''}
                                    onChange={(e) => handleInputChange('income', 'variable', e.target.value)}
                                    placeholder="e.g. 10000"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label className="text-lg">Fixed Expenses</Label>
                                    <SimpleTooltip text="Must-pay bills: Rent, EMI, Utilities." />
                                </div>
                                <Input
                                    className="text-lg h-12"
                                    type="number"
                                    min="0"
                                    value={inputs.expenses.fixed || ''}
                                    onChange={(e) => handleInputChange('expenses', 'fixed', e.target.value)}
                                    placeholder="e.g. 30000"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label className="text-lg">Discretionary Expenses</Label>
                                    <SimpleTooltip text="Fun money: Dining, Movies, Travel." />
                                </div>
                                <Input
                                    className="text-lg h-12"
                                    type="number"
                                    min="0"
                                    value={inputs.expenses.variable || ''}
                                    onChange={(e) => handleInputChange('expenses', 'variable', e.target.value)}
                                    placeholder="e.g. 15000"
                                />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <span className="text-6xl font-bold text-amber-500">
                                    {inputs.constraints.emergencyBufferMonths}
                                </span>
                                <p className="text-xl font-medium">Months</p>
                            </div>

                            <div className="space-y-4">
                                <Label>Target Buffer Duration</Label>
                                <Slider
                                    min={1}
                                    max={24}
                                    step={1}
                                    value={[inputs.constraints.emergencyBufferMonths]}
                                    onValueChange={(val) => onUpdate('constraints', 'emergencyBufferMonths', val[0])}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1 Month (Risky)</span>
                                    <span>6 Months (Recommended)</span>
                                    <span>24 Months (Ultra Safe)</span>
                                </div>
                            </div>
                            <p className="text-sm text-center text-muted-foreground bg-muted p-4 rounded-lg">
                                We'll use this to calculate if you're truly "Safe". Money inside this buffer typically shouldn't be touched for investments.
                            </p>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="flex justify-center items-end gap-2 mb-4">
                                    <span className="text-4xl font-bold text-primary">
                                        {formatCurrency(inputs.expenses.oneTime)}
                                    </span>
                                    {inputs.expenses.oneTime === 0 && (
                                        <span className="text-sm text-muted-foreground mb-2">(Nothing selected)</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Select an item or enter a custom amount</Label>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button variant="outline" onClick={() => { onUpdate('expenses', 'oneTime', 0); onUpdate('expenses', 'oneTimeName', ''); }}>Nothing / Skip</Button>
                                    <Button variant="outline" onClick={() => { onUpdate('expenses', 'oneTime', 50000); onUpdate('expenses', 'oneTimeName', 'Vacation'); }}>Vacation (50k)</Button>
                                    <Button variant="outline" onClick={() => { onUpdate('expenses', 'oneTime', 150000); onUpdate('expenses', 'oneTimeName', 'Laptop'); }}>Laptop (1.5L)</Button>
                                    <Button variant="outline" onClick={() => { onUpdate('expenses', 'oneTime', 800000); onUpdate('expenses', 'oneTimeName', 'Car'); }}>Car (8L)</Button>
                                </div>

                                <div className="pt-4 border-t">
                                    <Label className="mb-2 block">Custom Item</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Item Name"
                                            value={inputs.expenses.oneTimeName || ''}
                                            onChange={(e) => onUpdate('expenses', 'oneTimeName', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="Amount"
                                            value={inputs.expenses.oneTime > 0 ? inputs.expenses.oneTime : ''}
                                            onChange={(e) => handleInputChange('expenses', 'oneTime', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between bg-muted/20 py-6">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1} size="lg">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={nextStep} size="lg" className="min-w-[120px]">
                        {step === totalSteps ? (
                            <>Finish <CheckCircle className="w-4 h-4 ml-2" /></>
                        ) : (
                            <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SandboxWizard;
