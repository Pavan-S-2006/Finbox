import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { Button } from "@/components/ui/button";
import Logo from '../assets/logo.png';

const Auth = ({ onBack, initialIsLogin = true }) => {
  const { t } = useTheme();
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  const toggleAuthMode = () => setIsLogin(!isLogin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans text-foreground overflow-hidden relative">
      {/* Background blobs for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-6xl h-[85vh] min-h-[650px] bg-card rounded-3xl overflow-hidden shadow-2xl border relative flex"
      >
        {/* INFO PANEL (The moving part) */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className={`hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground overflow-hidden w-1/2 h-full absolute top-0 z-20 ${isLogin ? 'left-0' : 'right-0'}`}
        >
          {/* Dynamic Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          {/* Top Header */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Prospera Logo" className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white/20" />
              <span className="font-bold text-2xl tracking-tight">Prospera</span>
            </div>

            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-primary-foreground hover:bg-white/10 hover:text-white"
              >
                {t('backToWebsite')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Middle Visual - Dynamic Data Display */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6">
            <motion.div
              key={isLogin ? "login-visual" : "signup-visual"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-xs"
            >
              {isLogin ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm font-medium opacity-80">Portfolio Value</div>
                    <div className="text-green-300 text-xs font-bold">+24.5%</div>
                  </div>
                  <div className="text-3xl font-bold mb-2">₹1,24,50,000</div>
                  <div className="h-12 flex items-end gap-1">
                    {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/30 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><div className="w-16 h-16 rounded-full bg-white blur-xl" /></div>
                  <h4 className="text-lg font-bold mb-4">Smart Insights</h4>
                  <div className="space-y-3">
                    <div className="h-2 w-3/4 bg-white/20 rounded-full" />
                    <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                    <div className="h-2 w-full bg-white/20 rounded-full" />
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-300">✓</div>
                    <div className="text-sm">Secure Encryption</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10">
            <motion.div
              key={isLogin ? "login-text" : "signup-text"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-3xl font-bold leading-tight mb-2">
                {isLogin ? "Welcome Back" : "Join the Future"}
              </h3>
              <p className="opacity-70 max-w-sm text-lg">
                {isLogin ? "Access your wealth dashboard and manage your assets with ease." : "Start your journey towards financial freedom today."}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CONTAINER FOR FORMS (LEFT AND RIGHT SLOTS) */}
        {/* This container sits behind the moving panel but uses layout to position content */}
        <div className="w-full h-full flex relative z-10">
          {/* Left Slot - Content Here shows when Panel is Right (Signup Mode) */}
          <div className={`w-full lg:w-1/2 h-full flex items-center justify-center p-8 md:p-16 transition-all duration-500 ${!isLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 lg:opacity-20 pointer-events-none'}`}>
            {!isLogin && (
              <div className="w-full max-w-md">
                {/* Mobile Back Button for consistent UX if panel overlaps */}
                {onBack && (
                  <button onClick={onBack} className="lg:hidden absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}
                <Signup onSwitch={toggleAuthMode} />
              </div>
            )}
          </div>

          {/* Right Slot - Content Here shows when Panel is Left (Login Mode) */}
          <div className={`w-full lg:w-1/2 h-full flex items-center justify-center p-8 md:p-16 transition-all duration-500 ${isLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 lg:opacity-20 pointer-events-none'}`}>
            {isLogin && (
              <div className="w-full max-w-md">
                {onBack && (
                  <button onClick={onBack} className="lg:hidden absolute top-6 left-6 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}
                <Login onSwitch={toggleAuthMode} />
              </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Auth;
