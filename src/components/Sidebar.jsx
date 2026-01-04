import { useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Hammer, Mic, GraduationCap, Folder, PieChart, Settings, Bell } from 'lucide-react';
import logo from '../assets/finbox-icon.png';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { activeTab, setActiveTab } = useFinance();
    const { t } = useTheme();
    const sidebarRef = useRef(null);

    const tabs = [
        { id: 'home', label: t('home'), icon: Home, color: 'text-blue-500' },
        { id: 'analytics', label: t('analytics'), icon: PieChart, color: 'text-purple-500' },
        { id: 'entry', label: t('entry'), icon: Mic, color: 'text-green-500' },
        { id: 'notifications', label: t('notifications'), icon: Bell, color: 'text-yellow-500' },
        { id: 'sandbox', label: t('sandbox'), icon: Hammer, color: 'text-orange-500' },
        { id: 'learn', label: t('learn'), icon: GraduationCap, color: 'text-pink-500' },
        { id: 'legacy', label: t('legacy'), icon: Folder, color: 'text-cyan-500' },
    ];

    // Close sidebar when clicking outside (only in expanded state)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    return (
        <>
            {/* Backdrop overlay for mobile/tablet */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                ref={sidebarRef}
                initial={false}
                animate={{
                    width: isOpen ? 280 : 80,
                    x: 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed left-0 top-0 h-screen bg-gradient-to-b from-background via-background to-secondary/10 border-r border-border/50 flex flex-col py-6 z-50 shadow-xl",
                    isOpen ? 'px-4' : 'px-3'
                )}
            >
                {/* Header with 3-Bar Menu Toggle */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "relative group transition-all duration-300 flex-shrink-0",
                            isOpen ? "h-12 w-12" : "h-10 w-10"
                        )}
                    >
                        {/* 3-Bar Menu Icon */}
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                            <motion.div
                                animate={{
                                    width: isOpen ? '20px' : '24px'
                                }}
                                transition={{ duration: 0.3 }}
                                className="h-0.5 bg-foreground rounded-full"
                            />
                            <motion.div
                                animate={{
                                    width: '24px',
                                    opacity: 1
                                }}
                                className="h-0.5 bg-foreground rounded-full"
                            />
                            <motion.div
                                animate={{
                                    width: isOpen ? '20px' : '24px'
                                }}
                                transition={{ duration: 0.3 }}
                                className="h-0.5 bg-foreground rounded-full"
                            />
                        </div>

                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    </Button>

                    {/* FinBox Title when expanded */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col flex-1 min-w-0"
                            >
                                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate">
                                    FinBox
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                                    Financial Security
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Tabs */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {tabs.map((tab, index) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.div
                                key={tab.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        // Close sidebar on mobile after selection
                                        if (window.innerWidth < 768) {
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={cn(
                                        "w-full transition-all duration-200 relative group",
                                        isOpen ? "justify-start h-12 px-4" : "justify-center h-12 px-2",
                                        isActive && "shadow-md font-semibold",
                                        !isActive && "hover:bg-secondary/50"
                                    )}
                                    title={!isOpen ? tab.label : ''}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-purple-600 rounded-r-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    {/* Icon with color */}
                                    <div className={cn(
                                        "flex items-center gap-3 relative z-10",
                                        isActive && tab.color
                                    )}>
                                        <tab.icon className={cn(
                                            "transition-all",
                                            isOpen ? "h-5 w-5" : "h-5 w-5",
                                            isActive && "drop-shadow-md"
                                        )} />

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="whitespace-nowrap overflow-hidden"
                                                >
                                                    {tab.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Hover glow effect */}
                                    {!isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                    )}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-border/50" />

                {/* Settings Tab */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant={activeTab === 'settings' ? "secondary" : "ghost"}
                        onClick={() => {
                            setActiveTab('settings');
                            if (window.innerWidth < 768) {
                                setIsOpen(false);
                            }
                        }}
                        className={cn(
                            "w-full transition-all duration-200 relative group",
                            isOpen ? "justify-start h-12 px-4" : "justify-center h-12 px-2",
                            activeTab === 'settings' && "shadow-md font-semibold"
                        )}
                        title={!isOpen ? t('settings') : ''}
                    >
                        {activeTab === 'settings' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-purple-600 rounded-r-full"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}

                        <div className={cn(
                            "flex items-center gap-3",
                            activeTab === 'settings' && "text-red-500"
                        )}>
                            <Settings className={cn(
                                "transition-all",
                                isOpen ? "h-5 w-5" : "h-5 w-5"
                            )} />

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {t('settings')}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </Button>
                </motion.div>

                {/* Version Badge */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    v2.0.0
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default Sidebar;
