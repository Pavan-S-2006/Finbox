import { ArrowLeft, Calendar, FileText, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

const BlueprintDetail = ({ blueprint, onBack }) => {
    if (!blueprint) return null;

    const { inputs, outputs, name, createdAt, id, version } = blueprint;
    const { financials, health, investment } = outputs;

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);

    return (
        <div className="animate-fade-in space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-cyber-600 dark:hover:text-cyber-400 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Library
            </button>

            <div className="glass-card p-8 border-t-4 border-cyber-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-gray-100 dark:border-white/10 pb-6 mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                v{version || 1} Engine
                            </span>
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {id.split('_')[2]}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(createdAt)}
                        </div>
                    </div>

                    <div className={`px-4 py-2 rounded-xl text-center border ${health.riskLevel === 'low' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            health.riskLevel === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        <p className="text-xs uppercase font-bold opacity-70">Risk Level</p>
                        <p className="font-bold text-lg uppercase">{health.riskLevel}</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Column 1: Financial Snapshot */}
                    <div className="space-y-6">
                        <h3 className="font-semibold flex items-center gap-2 border-b pb-2 dark:border-white/10">
                            <Activity className="w-5 h-5 text-cyber-500" /> Financial Health
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Monthly Surplus</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(financials.monthlySurplus)}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Expense Ratio</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {health.expenseToIncomeRatio}%
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl col-span-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Runway</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {health.runwayMonths} Months
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-1">Target Buffer</p>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            {inputs.constraints.emergencyBufferMonths} Months
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {health.riskFactors.length > 0 && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl space-y-2">
                                {health.riskFactors.map((r, i) => (
                                    <div key={i} className="flex gap-2 text-sm text-red-700 dark:text-red-300">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p>{r}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Column 2: Investment Strategy */}
                    <div className="space-y-6">
                        <h3 className="font-semibold flex items-center gap-2 border-b pb-2 dark:border-white/10">
                            <TrendingUp className="w-5 h-5 text-purple-500" /> Investment Strategy
                        </h3>

                        <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-500/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-purple-900 dark:text-purple-200">
                                    {inputs.investment.riskTolerance.toUpperCase()} Profile
                                </span>
                                <span className="px-2 py-1 bg-white dark:bg-black/20 rounded text-xs">
                                    {inputs.investment.allocationPct}% Allocation
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Monthly Investment</span>
                                    <span className="font-bold">{formatCurrency(investment.actualInvestment)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Projected 10Y Value</span>
                                    <span className="font-bold text-emerald-600">
                                        {formatCurrency(investment.projection.projectedReturns[10])}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                            <strong>Note:</strong> This blueprint includes the full simulation state as of {formatDate(createdAt)}. Assets, Expenses, and Income are preserved.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BlueprintDetail;
