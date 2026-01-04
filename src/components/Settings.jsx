import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { X, Globe, Trash2, LogOut, User, Save, CheckCircle, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const Settings = () => {
    const { user, updateUser, setActiveTab, logout } = useFinance();
    const { theme, toggleTheme, language, setLanguage, t } = useTheme();

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        details: user?.details || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                details: user.details || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        updateUser(form);
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'te', name: 'Telugu', native: 'తెలుగు' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
                    <p className="text-muted-foreground">{t('managePreferences')}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveTab('home')}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {t('profileSettings')}
                        </CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('fullName')}</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder={t('enterName')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('emailAddress')}</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder={t('enterEmail')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('phoneNumber')}</Label>
                                <Input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder={t('enterPhone')}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('customerCategory')}</Label>
                                <Select
                                    value={form.details}
                                    onValueChange={(val) => setForm({ ...form, details: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectCategory')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Individual">{t('individual')}</SelectItem>
                                        <SelectItem value="Business">{t('business')}</SelectItem>
                                        <SelectItem value="Premium">{t('premium')}</SelectItem>
                                        <SelectItem value="Student">{t('student')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            {showSuccess && (
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1 animate-in fade-in">
                                    <CheckCircle className="w-4 h-4" />
                                    {t('changesSaved')}
                                </span>
                            )}
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {t('saveProfile')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>



                {/* Language Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            {t('language')}
                        </CardTitle>
                        <CardDescription>Select your preferred language</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {languages.map((lang) => (
                                <Button
                                    key={lang.code}
                                    variant={language === lang.code ? "default" : "outline"}
                                    className={cn(
                                        "h-auto flex-col items-start p-4 space-y-1",
                                        language === lang.code ? "" : "hover:bg-muted"
                                    )}
                                    onClick={() => setLanguage(lang.code)}
                                >
                                    <span className="font-semibold text-lg">{lang.native}</span>
                                    <span className="text-xs opacity-70">{lang.name}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-destructive/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="w-5 h-5" />
                            {t('dataManagement')}
                        </CardTitle>
                        <CardDescription>Manage your data and session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={() => {
                                    if (window.confirm(t('confirmClear'))) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('clearData')}
                            </Button>
                            <Button variant="secondary" onClick={logout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                {t('logout')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
