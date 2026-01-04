import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useFinance } from '../../context/FinanceContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Signup = ({ onSwitch, onLoginSuccess }) => {
    const { t } = useTheme();
    const { signup } = useFinance();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isFamilyMember, setIsFamilyMember] = useState(false);

    // Password Strength Logic
    const getStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 6) score += 1;
        if (pass.length > 10) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = getStrength(password);

    const getStrengthColor = (s) => {
        if (s === 0) return "bg-gray-200";
        if (s < 2) return "bg-red-500";
        if (s < 4) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = (s) => {
        if (s === 0) return "";
        if (s < 2) return "Weak";
        if (s < 4) return "Medium";
        return "Strong";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (strength < 2) {
            setError("Password is too weak");
            setIsLoading(false);
            return;
        }

        try {
            const fullName = `${firstName} ${lastName}`.trim();
            // Pass isFamilyMember flag to signup
            await signup(email, password, fullName, isFamilyMember);
            if (onLoginSuccess) onLoginSuccess();
        } catch (error) {
            console.error(error);
            setError('Failed to create account. ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
        >
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{t('createAccount')}</h2>
                <p className="text-muted-foreground">
                    {t('alreadyHaveAccount')}{" "}
                    <button onClick={onSwitch} className="text-primary hover:underline font-medium">
                        {t('loginBtn')}
                    </button>
                </p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md animate-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">{t('firstName')}</Label>
                        <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                            required
                            className="bg-white/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">{t('lastName')}</Label>
                        <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                            required
                            className="bg-white/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        required
                        className="bg-white/50"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('passwordPlaceholder')}
                            required
                            className="bg-white/50 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                        <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className={strength < 2 ? "text-red-500" : strength < 4 ? "text-yellow-500" : "text-green-500"}>
                                    {getStrengthText(strength)}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                                    style={{ width: `${(strength / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className={`bg-white/50 ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                    />
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                </div>

                <div className="pt-2 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            required
                        />
                        <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {t('agreeTerms')}
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            checked={isFamilyMember}
                            onChange={(e) => setIsFamilyMember(e.target.checked)}
                        />
                        <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Sign up as Family Member (Requires invitation)
                        </span>
                    </label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('creatingAccount') : t('createAccountBtn')}
                </Button>
            </form>
        </motion.div>
    );
};

export default Signup;
