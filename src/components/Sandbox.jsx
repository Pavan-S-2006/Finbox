import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { Settings as SettingsIcon, TrendingUp, Calculator, FolderOpen, AlertCircle, HelpCircle, PlayCircle, X } from 'lucide-react';
import { sandboxService } from '../services/sandboxService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sub-components
import ExpenditureSandbox from './sandbox/ExpenditureSandbox';
import InvestmentSandbox from './sandbox/InvestmentSandbox';
import BlueprintLibrary from './sandbox/BlueprintLibrary';

const Sandbox = () => {
  const { t } = useTheme();
  // Get Real User Data
  const { assets, transactions, liabilities } = useFinance();

  const [activeView, setActiveView] = useState('expenditure');
  const [simulation, setSimulation] = useState(null); // The Master State
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Refs for Child Components
  const expenditureRef = useRef(null);
  const investmentRef = useRef(null);

  // Initial Load with User Data
  useEffect(() => {
    if (assets && transactions) {
      loadInitialState();
    }
  }, [assets, transactions]);

  const loadInitialState = async () => {
    setLoading(true);
    // Pass real data to seed the sandbox
    const state = await sandboxService.getInitialState({ assets, transactions, liabilities });

    // Calculate initial results immediately
    const results = sandboxService.calculateScenario(state.inputs);
    setSimulation({ inputs: state.inputs, outputs: results });
    setLoading(false);
  };

  // The Central Update Handler
  const updateSimulationInput = useCallback((category, field, value) => {
    setSimulation(prev => {
      const newInputs = { ...prev.inputs };

      if (category === 'root') {
        newInputs[field] = value;
      } else {
        newInputs[category] = { ...newInputs[category], [field]: value };
      }

      // RECALCULATE IMMEDIATELY
      const newOutputs = sandboxService.calculateScenario(newInputs);

      return {
        inputs: newInputs,
        outputs: newOutputs
      };
    });
  }, []);

  const handleToggleSimulation = () => {
    if (activeView === 'expenditure' && expenditureRef.current) {
      expenditureRef.current.toggleSimulation();
    } else if (activeView === 'investment' && investmentRef.current) {
      investmentRef.current.toggleSimulation();
    }
  };

  const handleLoadBlueprint = (blueprint) => {
    setSimulation({
      inputs: blueprint.inputs,
      outputs: blueprint.outputs
    });
    setActiveView('expenditure');
  };



  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            {t('sandbox')}
            <Badge variant="secondary" className="ml-2">Engine v2.0</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced Financial Lab. Inputs in Expenditure directly affect Investment capacity.
          </p>
        </div>
        <div className="flex gap-2">
          {(activeView === 'expenditure' || activeView === 'investment') && (
            <Button
              variant={isSimulating ? "destructive" : "outline"}
              onClick={handleToggleSimulation}
            >
              {isSimulating ? (
                <><X className="w-4 h-4 mr-2" /> Exit Simulation</>
              ) : (
                <><PlayCircle className="w-4 h-4 mr-2" /> Guide Me</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Global Risk Banner (If Critical) */}
      {simulation && simulation.outputs.health.riskLevel === 'critical' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>CRITICAL: Liquidity Crisis</AlertTitle>
          <AlertDescription>
            Your liquid assets are depleted. Immediate action required. Investments are frozen.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation and Content using Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="expenditure">Expenditure</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <div className="mt-6 min-h-[500px]">
          {loading || !simulation ? (
            <div className="p-10 text-center text-muted-foreground animate-pulse">Loading Engine...</div>
          ) : (
            <>
              {activeView === 'expenditure' && (
                <ExpenditureSandbox
                  ref={expenditureRef}
                  inputs={simulation.inputs}
                  outputs={simulation.outputs}
                  onUpdate={updateSimulationInput}
                  onSimulationChange={setIsSimulating}
                  onNavigate={setActiveView}
                />
              )}
              {activeView === 'investment' && (
                <InvestmentSandbox
                  ref={investmentRef}
                  inputs={simulation.inputs}
                  outputs={simulation.outputs}
                  onUpdate={updateSimulationInput}
                  onSimulationChange={setIsSimulating}
                />
              )}
              {activeView === 'library' && (
                <BlueprintLibrary onLoad={handleLoadBlueprint} />
              )}
            </>
          )}
        </div>
      </Tabs>


    </div>
  );
};

export default Sandbox;
