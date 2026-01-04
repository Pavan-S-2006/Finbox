import { useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Hammer, Mic, GraduationCap, Folder, PieChart, Settings, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import logo from '../assets/logo.png';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { activeTab, setActiveTab, sandboxMode } = useFinance();
    const { t } = useTheme();
    const sidebarRef = useRef(null);

    const tabs = [
        { id: 'home', label: t('home'), icon: Home },
        { id: 'analytics', label: t('analytics'), icon: PieChart },
        { id: 'entry', label: t('entry'), icon: Mic },
        { id: 'notifications', label: t('notifications'), icon: Bell },
        { id: 'sandbox', label: t('sandbox'), icon: Hammer },
        { id: 'learn', label: t('learn'), icon: GraduationCap },
        { id: 'legacy', label: t('legacy'), icon: Folder },
    ];

    // Close sidebar when clicking outside (only in expanded state)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
                // Don't close if clicking on the toggle button
                if (!event.target.closest('.sidebar-toggle')) {
                    setIsOpen(false);
                }
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


            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={cn(
                    "hidden md:flex fixed left-0 top-0 h-screen bg-background border-r flex-col py-6 z-50 transition-all duration-300",
                    isOpen ? 'w-64 px-6' : 'w-20 px-3'
                )}
            >
                {/* Toggle Button on Border */}
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-sm z-50 hidden md:flex"
                    title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>

                {/* Header */}
                <div className={cn("flex items-center justify-center mb-8 transition-all", isOpen ? "px-2" : "px-0")}>
                    <img
                        src={logo}
                        alt="Logo"
                        className={cn("transition-all object-cover rounded-full", isOpen ? "w-12 h-12" : "w-8 h-8")}
                    />
                </div>

                {/* Tabs */}
                <div className="flex-1 flex flex-col gap-1 mt-12">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <Button
                                key={tab.id}
                                variant={isActive ? "secondary" : "ghost"}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "justify-start",
                                    !isOpen && "justify-center px-2",
                                    isActive && "font-semibold"
                                )}
                                title={!isOpen ? tab.label : ''}
                            >
                                <tab.icon className={cn("h-4 w-4", isOpen && "mr-2")} />
                                {isOpen && <span>{tab.label}</span>}
                            </Button>
                        );
                    })}
                </div>

                {/* Settings Tab */}
                <div className="mt-auto pt-6 border-t">
                    <Button
                        variant={activeTab === 'settings' ? "secondary" : "ghost"}
                        onClick={() => setActiveTab('settings')}
                        className={cn("w-full justify-start", !isOpen && "justify-center px-2")}
                        title={!isOpen ? t('settings') : ''}
                    >
                        <Settings className={cn("h-4 w-4", isOpen && "mr-2")} />
                        {isOpen && <span>{t('settings')}</span>}
                    </Button>
                    {isOpen && (
                        <div className="text-muted-foreground text-xs text-center mt-4">
                            v2.0.0
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
