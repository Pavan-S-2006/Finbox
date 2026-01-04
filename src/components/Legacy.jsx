
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import {
  Shield, FileText, Lock, UserPlus, AlertCircle, CheckCircle, Key,
  Loader2, ChevronRight, AlertTriangle, Plus, Trash2, Unlock, AlertOctagon
} from 'lucide-react';
import { legacyService } from '../services/legacyService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; // Assuming we have this or use standard checkbox
import { cn } from "@/lib/utils";
import NomineePanel from './legacy/NomineePanel';

const Legacy = () => {
  const { t } = useTheme();
  const { user } = useFinance(); // Get authenticated user

  // Data State
  const [nominees, setNominees] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [vaultDocuments, setVaultDocuments] = useState([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [showAddNominee, setShowAddNominee] = useState(false);
  const [newNominee, setNewNominee] = useState({ name: '', relationship: '', phone: '', email: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Vault State
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [vaultError, setVaultError] = useState('');
  const [vaultToken, setVaultToken] = useState(null);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', type: 'policy', provider: '', number: '' });

  // Access Control State
  const isFamilyMember = user?.familyLink?.isFamilyMember;
  const targetUid = isFamilyMember ? user.familyLink.mainUserId : user?.uid;

  // Use local state for permission to support real-time updates
  const [hasAccess, setHasAccess] = useState(isFamilyMember ? user.familyLink.permission : true);

  // Subscribe to permission changes if Family Member
  useEffect(() => {
    let unsubscribe = () => { };

    if (isFamilyMember && user?.email) {
      unsubscribe = legacyService.subscribeToInvite(user.email, (inviteData) => {
        if (inviteData) {
          setHasAccess(inviteData.permission);
        }
      });
    }

    return () => unsubscribe();
  }, [isFamilyMember, user?.email]);

  // Initial Data Fetch
  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user, hasAccess]); // Re-fetch if access changes

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      if (hasAccess) {
        // If has access (Main user or Permitted Family Member), load metadata
        // Note: For family members, we might want to hide the Nominee list or make it read-only
        // For now, loading everything if access is granted.

        // Nominees (Only Main User logic implies managing nominees, but reading is fine)
        const noms = await legacyService.getNominees(targetUid);
        setNominees(noms);

        const recs = await legacyService.getRecommendations();
        setRecommendations(recs);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Nominee Handlers (Only Main User can add/remove)
  const handleAddNominee = async () => {
    if (!newNominee.name || !newNominee.relationship || !newNominee.email) return;
    if (isFamilyMember) return; // Guard clause

    try {
      const added = await legacyService.addNominee(user.uid, newNominee);
      setNominees([...nominees, added]);
      setNewNominee({ name: '', relationship: '', phone: '', email: '' });
      setShowAddNominee(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRemoveNominee = async () => {
    if (!confirmDeleteId) return;
    if (isFamilyMember) return;

    try {
      await legacyService.removeNominee(user.uid, confirmDeleteId);
      setNominees(nominees.filter(n => n.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Failed to remove member");
    }
  };

  const toggleMemberAccess = async (nomineeId, currentStatus, email) => {
    if (isFamilyMember) return;
    try {
      await legacyService.updateMemberPermission(user.uid, nomineeId, !currentStatus, email);
      // Update local state
      setNominees(nominees.map(n => n.id === nomineeId ? { ...n, accessGranted: !currentStatus } : n));
    } catch (error) {
      console.error("Failed to update permission", error);
    }
  };

  // Vault Handlers
  const unlockVault = async () => {
    if (pin.length !== 4) return;

    setIsVerifying(true);
    setVaultError('');

    try {
      const { token } = await legacyService.authenticateVault(pin);
      setVaultToken(token);

      // Fetch documents for the TARGET UID
      const docs = await legacyService.getDocuments(token, targetUid);
      setVaultDocuments(docs);
      setVaultUnlocked(true);
      setPin('');
      setShowKeypad(false);
    } catch (error) {
      setVaultError('Incorrect PIN');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddDocument = async () => {
    if (!newDoc.name || !newDoc.number) return;
    // Only Main User can add documents (typically)
    if (isFamilyMember) {
      alert("Read-only access.");
      return;
    }

    try {
      const added = await legacyService.addDocument(vaultToken, newDoc, user.uid);
      setVaultDocuments([...vaultDocuments, added]);
      setShowAddDoc(false);
      setNewDoc({ name: '', type: 'policy', provider: '', number: '' });
    } catch (error) {
      console.error("Failed to add document");
    }
  }

  // Permission Denied View
  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            You are registered as a family member, but the main user has not granted you access to the Legacy Vault yet.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>Check Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {t('legacy')} {isFamilyMember && <Badge variant="secondary">Family View</Badge>}
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {isFamilyMember
              ? "View the digital legacy shared with you."
              : "Secure your digital legacy. Manage members, protect vital documents, and ensure your family's future financial security."}
          </p>
        </div>

        <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border-emerald-500/50 text-emerald-600 bg-emerald-500/5">
          <Shield className="w-4 h-4" />
          <span>System Secured</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Vault & Nominees */}
        <div className="lg:col-span-2 space-y-8">

          {/* Secure Vault */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {t('secureVault')}
              </CardTitle>
              {vaultUnlocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVaultUnlocked(false);
                    setShowKeypad(false);
                    setVaultDocuments([]);
                  }}
                >
                  Lock Vault
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!vaultUnlocked ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-8">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center relative">
                    <Key className="w-10 h-10 text-muted-foreground" />
                  </div>

                  {!showKeypad ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Vault Locked</h3>
                        <p className="text-sm text-muted-foreground mt-1">Access sensitive documents securely.</p>
                      </div>
                      <Button onClick={() => setShowKeypad(true)} className="min-w-[150px]">
                        <Unlock className="w-4 h-4 mr-2" />
                        Access Vault
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-sm mx-auto">
                      <div className="mb-2">
                        <h3 className="text-lg font-medium">Enter PIN</h3>
                        {isFamilyMember && <p className="text-xs text-muted-foreground">Ask the main user for the PIN</p>}
                      </div>

                      <div className="flex justify-center gap-3 mb-4">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className={cn(
                            "w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
                            pin.length > i ? "border-primary bg-primary/5 text-primary" : "border-muted bg-muted/20"
                          )}>
                            {pin.length > i ? '•' : ''}
                          </div>
                        ))}
                      </div>

                      {/* Simple Keypad UI */}
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <Button
                            key={num}
                            variant="outline"
                            className="h-12 text-lg"
                            onClick={() => { if (pin.length < 4) setPin(pin + num); }}
                          >
                            {num}
                          </Button>
                        ))}
                        <Button variant="outline" className="h-12" onClick={() => setShowKeypad(false)}>Cancel</Button>
                        <Button variant="outline" className="h-12 text-lg" onClick={() => { if (pin.length < 4) setPin(pin + '0'); }}>0</Button>
                        <Button variant="outline" className="h-12 text-destructive" onClick={() => setPin(pin.slice(0, -1))}><ChevronRight className="w-5 h-5 rotate-180" /></Button>
                      </div>

                      {vaultError && (
                        <p className="text-destructive text-sm font-medium animate-pulse">{vaultError}</p>
                      )}

                      <Button
                        onClick={unlockVault}
                        disabled={pin.length !== 4 || isVerifying}
                        className="w-full mt-4"
                      >
                        {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isVerifying ? 'Verifying...' : 'Unlock Vault'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Access Granted Header */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/20">
                        <Unlock className="w-4 h-4 text-green-600 dark:text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Access Granted</p>
                        <p className="text-green-600/70 dark:text-green-500/70 text-sm">Vault session active.</p>
                      </div>
                    </div>

                    {!isFamilyMember && (
                      <Button size="sm" variant="outline" onClick={() => setShowAddDoc(!showAddDoc)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    )}
                  </div>

                  {/* Add Document Form */}
                  {showAddDoc && !isFamilyMember && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input placeholder="Document Name" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} />
                          <Input placeholder="Document Number" value={newDoc.number} onChange={(e) => setNewDoc({ ...newDoc, number: e.target.value })} />
                          <Select value={newDoc.type} onValueChange={(val) => setNewDoc({ ...newDoc, type: val })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="policy">Policy</SelectItem>
                              <SelectItem value="bank">Bank Account</SelectItem>
                              <SelectItem value="investment">Investment</SelectItem>
                              <SelectItem value="property">Property</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input placeholder="Provider (Optional)" value={newDoc.provider} onChange={(e) => setNewDoc({ ...newDoc, provider: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setShowAddDoc(false)}>Cancel</Button>
                          <Button onClick={handleAddDocument}>Save Document</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Document Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vaultDocuments.map((doc) => (
                      <Card key={doc.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-md bg-muted">
                                {doc.type === 'bank' ? <Key className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.provider || 'Personal Record'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono bg-muted/80 px-1.5 py-0.5 rounded">{doc.number}</span>
                            <span>{doc.date}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {vaultDocuments.length === 0 && (
                      <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                        No documents found in vault.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {t('nominees') === 'nominees' ? 'Members' : t('nominees')}
              </CardTitle>
              {!isFamilyMember && (
                <Button size="sm" onClick={() => setShowAddNominee(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : nominees.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">{isFamilyMember ? "No other members visible." : "No members added yet."}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nominees.map((nominee) => (
                    <Card key={nominee.id} className="relative group hover:shadow-md transition-shadow">
                      {!isFamilyMember && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDeleteId(nominee.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}

                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {nominee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium">{nominee.name}</h4>
                            <Badge variant="secondary" className="mt-1 text-[10px] h-5">{nominee.relationship}</Badge>
                          </div>
                        </div>

                        {!isFamilyMember && (
                          <div className="flex items-center justify-between pt-2 border-t mt-2">
                            <span className="text-xs text-muted-foreground">Vault Access</span>
                            <Button
                              variant={nominee.accessGranted ? "default" : "outline"}
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => toggleMemberAccess(nominee.id, nominee.accessGranted, nominee.email)}
                            >
                              {nominee.accessGranted ? "Allowed" : "Restricted"}
                            </Button>
                          </div>
                        )}
                        {isFamilyMember && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            {nominee.accessGranted ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Lock className="w-3 h-3" />}
                            {nominee.accessGranted ? "Has Access" : "No Access"}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recommendations & Emergency */}
        <div className="space-y-8">

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className=" text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                {t('recommendedProtection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse"></div>)}
                </div>
              ) : recommendations.map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={rec.priority === 'high' ? "destructive" : rec.priority === 'medium' ? "warning" : "secondary"} className="text-[10px]">
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{rec.type}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    {rec.action} <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Emergency SOS & Simulation */}
          <NomineePanel nominees={nominees} />

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member? They will lose access to designated emergency info.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveNominee}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Nominee Modal */}
      <Dialog open={showAddNominee} onOpenChange={setShowAddNominee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Member Details</DialogTitle>
            <DialogDescription>
              An invitation will be created for this email. They must use "Sign up as Family Member" to join.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newNominee.name} onChange={(e) => setNewNominee({ ...newNominee, name: e.target.value })} placeholder="e.g. Aditi Rao" />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input value={newNominee.relationship} onChange={(e) => setNewNominee({ ...newNominee, relationship: e.target.value })} placeholder="e.g. Daughter" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={newNominee.phone} onChange={(e) => setNewNominee({ ...newNominee, phone: e.target.value })} placeholder="+91" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newNominee.email} onChange={(e) => setNewNominee({ ...newNominee, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddNominee}>Save Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Legacy;
