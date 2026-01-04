import { useFinance } from '../context/FinanceContext';
import { Home, Hammer, Mic, GraduationCap, Bell, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
    const { user, activeTab, setActiveTab, logout, sandboxMode } = useFinance();

    const tabs = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'entry', label: 'Entry', icon: Mic },
        { id: 'notifications', label: 'Alerts', icon: Bell },
        { id: 'sandbox', label: 'Sandbox', icon: Hammer },
        { id: 'learn', label: 'Learn', icon: GraduationCap },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 bg-background/80 backdrop-blur-lg border rounded-2xl shadow-xl z-50">
            <div className="flex items-center justify-between px-4 h-16">
                <div className="flex items-center gap-1 w-full justify-between">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <tab.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </button>
                        );
                    })}

                    <div className="flex items-center pl-2 border-l ml-1">
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileNavigation;
