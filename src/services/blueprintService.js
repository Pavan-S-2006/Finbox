// blueprintService.js
// Service for managing Blueprint (Simulation) persistence.

const STORAGE_KEY = 'finsafe_blueprints_v2';

const generateId = () => `bp_v2_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export const blueprintService = {

    saveBlueprint: async (meta, simulationState) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const blueprint = {
                id: generateId(),
                version: 2,
                createdAt: new Date().toISOString(),
                name: meta.name || 'Untitled Blueprint',
                description: meta.description || '',
                ...simulationState // inputs and outputs
            };

            const existing = blueprintService.getLocalBlueprints();
            const updated = [blueprint, ...existing];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            return blueprint;
        } catch (error) {
            console.error('Error saving blueprint:', error);
            throw error;
        }
    },

    getBlueprints: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return blueprintService.getLocalBlueprints();
    },

    getBlueprintById: async (id) => {
        const all = blueprintService.getLocalBlueprints();
        return all.find(bp => bp.id === id) || null;
    },

    deleteBlueprint: async (id) => {
        const all = blueprintService.getLocalBlueprints();
        const updated = all.filter(bp => bp.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return true;
    },

    // Helper to compare two blueprints
    compare: (bpA, bpB) => {
        if (!bpA || !bpB) return null;

        return {
            deltaRunway: bpB.outputs.health.runwayMonths - bpA.outputs.health.runwayMonths,
            deltaSurplus: bpB.outputs.financials.monthlySurplus - bpA.outputs.financials.monthlySurplus,
            deltaWealth10Y: bpB.outputs.investment.projection.projectedReturns[10] - bpA.outputs.investment.projection.projectedReturns[10],
            riskComparison: {
                from: bpA.outputs.health.riskLevel,
                to: bpB.outputs.health.riskLevel
            }
        };
    },

    getLocalBlueprints: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
};
