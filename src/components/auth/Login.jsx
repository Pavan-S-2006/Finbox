import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useFinance } from '../../context/FinanceContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Login = ({ onSwitch, onLoginSuccess }) => {
    const { t } = useTheme();
    const { login } = useFinance();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // await new Promise(resolve => setTimeout(resolve, 800));
            await login(email, password);
            if (onLoginSuccess) onLoginSuccess();
        } catch (error) {
            console.error(error);
            setError('Failed to log in. Please check your email and password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
        >
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{t('welcomeBack')}</h2>
                <p className="text-muted-foreground">
                    {t('noAccount')}{" "}
                    <button onClick={onSwitch} className="text-primary hover:underline font-medium">
                        {t('signUp')}
                    </button>
                </p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        required
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
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                        <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('rememberMe')}</span>
                    </label>
                    <a href="#" className="text-sm font-medium text-primary hover:underline">{t('forgotPassword')}</a>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('signingIn') : t('signInBtn')}
                </Button>
            </form>

        </motion.div>
    );
};

export default Login;
