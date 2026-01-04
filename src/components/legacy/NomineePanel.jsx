import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, Lock, Eye, Siren, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { legacyService } from '../../services/legacyService';

const NomineePanel = ({ nominees }) => {
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);
    const [unlockedDocs, setUnlockedDocs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const activateEmergency = async () => {
        setIsLoading(true);
        // Simulate "Verification Delay" (SMS/Email trigger)
        await new Promise(r => setTimeout(r, 2000));

        // Mock fetching critical docs (usually this requires a special token, but here we simulate what the nominee sees)
        // We'll filter the "mockDocuments" from legacyService or just mock them here as "Critical"
        const docs = [
            { id: 1, name: 'Term Life Policy', provider: 'HDFC Life', number: 'POL-88291', type: 'Insurance' },
            { id: 2, name: 'Primary Savings', provider: 'HDFC Bank', number: '**** 9921', type: 'Bank' },
            { id: 3, name: 'Family Lawyer', provider: 'Ramesh Gupta', number: '+91 98765 43210', type: 'Contact' }
        ];

        setUnlockedDocs(docs);
        setIsEmergencyMode(true);
        setIsLoading(false);
        setShowConfirm(false);
    };

    const exitEmergency = () => {
        setIsEmergencyMode(false);
        setUnlockedDocs([]);
    };

    return (
        <div className="space-y-6">
            {/* Main Control Card */}
            <Card className={`border-2 transition-all ${isEmergencyMode ? 'border-destructive bg-destructive/5' : 'border-destructive/20'}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <Siren className={`w-5 h-5 ${isEmergencyMode ? 'animate-pulse' : ''}`} />
                        Emergency Access Simulation
                    </CardTitle>
                    <CardDescription>
                        Test what your nominees will see in a crisis.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isEmergencyMode ? (
                        <>
                            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-dashed">
                                <p className="font-medium text-foreground mb-1">Workflow:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Nominee requests access.</li>
                                    <li>System sends you SMS/Email.</li>
                                    <li>If no response in 48h, access is granted.</li>
                                </ul>
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => setShowConfirm(true)}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Simulate Access (Trust View)
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span className="font-medium">Access Unlocked</span>
                                </div>
                                <Badge variant="outline" className="bg-green-100 border-green-200">Active</Badge>
                            </div>
                            <Button variant="outline" className="w-full" onClick={exitEmergency}>
                                Exit Simulation
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Critical Info Panel (Revealed in Emergency) */}
            {isEmergencyMode && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        <Lock className="w-4 h-4 text-destructive" />
                        Critical Information Revealed
                    </div>

                    {/* Documents List */}
                    <div className="grid gap-3">
                        {unlockedDocs.map(doc => (
                            <div key={doc.id} className="bg-white dark:bg-card p-4 rounded-xl border-l-4 border-l-destructive shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg">{doc.name}</p>
                                    <p className="text-sm text-muted-foreground">{doc.provider}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant="secondary" className="mb-1">{doc.type}</Badge>
                                    <p className="font-mono text-sm font-semibold">{doc.number}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact List (Mock) */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Nominees Notified</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {nominees.map(nom => (
                                    <Badge key={nom.id} variant="secondary" className="py-1 px-2">
                                        {nom.name} ({nom.relationship})
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" /> Confirm Simulation
                        </DialogTitle>
                        <DialogDescription>
                            This will unlock sensitive policy numbers and account details on this screen immediately. Ensure you are in a safe environment.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={activateEmergency} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Reveal Data'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NomineePanel;
