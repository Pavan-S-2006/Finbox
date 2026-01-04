import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
    Bell,
    X,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    XCircle,
    Info,
    TrendingUp,
    TrendingDown,
    Lightbulb,
    Activity,
    Trash2,
    Settings,
    Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Notifications = () => {
    const {
        notifications,
        unreadCount,
        settings,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        updateSettings
    } = useNotifications();
    const { t } = useTheme();

    const [showSettings, setShowSettings] = useState(false);
    const [filter, setFilter] = useState('all');

    // Get icon component based on notification type
    const getIcon = (iconName) => {
        const iconProps = { className: 'w-5 h-5' };
        switch (iconName) {
            case 'CheckCircle': return <CheckCircle {...iconProps} />;
            case 'AlertCircle': return <AlertCircle {...iconProps} />;
            case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
            case 'XCircle': return <XCircle {...iconProps} />;
            case 'TrendingUp': return <TrendingUp {...iconProps} />;
            case 'TrendingDown': return <TrendingDown {...iconProps} />;
            case 'Lightbulb': return <Lightbulb {...iconProps} />;
            case 'Activity': return <Activity {...iconProps} />;
            default: return <Info {...iconProps} />;
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'critical') return n.priority === 'critical';
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="rounded-full px-2">
                                {unreadCount}
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">Stay updated with your financial activity</p>
                </div>

                <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
                    <Settings className="w-5 h-5" />
                </Button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Manage your alert preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable-notifications" className="flex flex-col space-y-1">
                                <span>Enable Notifications</span>
                                <span className="font-normal text-xs text-muted-foreground">Master toggle for all alerts</span>
                            </Label>
                            <Switch
                                id="enable-notifications"
                                checked={settings.enabled}
                                onCheckedChange={(val) => updateSettings({ enabled: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="budget-alerts">Budget Alerts</Label>
                            <Switch
                                id="budget-alerts"
                                checked={settings.budgetAlerts}
                                onCheckedChange={(val) => updateSettings({ budgetAlerts: val })}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="large-transactions">Large Transactions</Label>
                            <Switch
                                id="large-transactions"
                                checked={settings.largeTransactions}
                                onCheckedChange={(val) => updateSettings({ largeTransactions: val })}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="health-score">Health Score Updates</Label>
                            <Switch
                                id="health-score"
                                checked={settings.healthScoreUpdates}
                                onCheckedChange={(val) => updateSettings({ healthScoreUpdates: val })}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="daily-tips">Daily Finance Tips</Label>
                            <Switch
                                id="daily-tips"
                                checked={settings.dailyTips}
                                onCheckedChange={(val) => updateSettings({ dailyTips: val })}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filter and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                        <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                        <TabsTrigger value="critical">Critical</TabsTrigger>
                    </TabsList>
                </Tabs>

                {notifications.length > 0 && (
                    <div className="flex gap-2 text-sm">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark all read
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
                        <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No notifications</h3>
                        <p className="text-sm text-muted-foreground">You're all caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={cn(
                                "transition-all cursor-pointer hover:bg-accent/50",
                                !notification.read && "border-l-4 border-l-primary"
                            )}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                            <CardContent className="p-4 flex gap-4">
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                    notification.type === 'error' ? "bg-destructive/10 text-destructive" :
                                        notification.type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                                            notification.type === 'success' ? "bg-green-500/10 text-green-500" :
                                                "bg-primary/10 text-primary"
                                )}>
                                    {getIcon(notification.icon)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={cn("font-medium", !notification.read && "font-bold")}>
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(notification.id);
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(notification.timestamp)}
                                        </span>
                                        {notification.priority === 'critical' && (
                                            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Critical</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
