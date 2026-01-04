import { useState, useEffect } from 'react';
import { FolderOpen, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { blueprintService } from '../../services/blueprintService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BlueprintLibrary = ({ onLoad }) => {
    const [blueprints, setBlueprints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBlueprints();
    }, []);

    const loadBlueprints = async () => {
        setLoading(true);
        const data = await blueprintService.getBlueprints();
        setBlueprints(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        await blueprintService.deleteBlueprint(id);
        loadBlueprints();
    };

    // Helper to extract a summary from the complex v2 object
    const getSummary = (bp) => {
        if (!bp.outputs) return 'Legacy Blueprint (Incompatible)';
        return `Surplus: ₹${bp.outputs.financials.monthlySurplus.toLocaleString()} | Runway: ${bp.outputs.health.runwayMonths}m`;
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Card className="min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <FolderOpen className="w-6 h-6" />
                        Saved Blueprints
                    </CardTitle>
                    <CardDescription>
                        Manage and reload your saved financial scenarios.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadBlueprints}>
                    Refresh List
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading library...</div>
                ) : blueprints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                        <FolderOpen className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                        <p className="text-muted-foreground">No blueprints saved yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {blueprints.map((bp) => (
                            <div
                                key={bp.id}
                                className="flex flex-col md:flex-row justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-primary/50"
                            >
                                <div className="space-y-2 mb-4 md:mb-0">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px]">
                                            v{bp.version || 1}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(bp.createdAt)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg">
                                        {bp.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-mono">
                                        {getSummary(bp)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Blueprint?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the
                                                    blueprint "{bp.name}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(bp.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <Button onClick={() => onLoad(bp)} className="gap-2">
                                        Load <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BlueprintLibrary;
