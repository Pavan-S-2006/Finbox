import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [settings, setSettings] = useState({
        enabled: true,
        budgetAlerts: true,
        largeTransactions: true,
        healthScoreUpdates: true,
        dailyTips: true,
        spendingInsights: true,
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
        },
        thresholds: {
            budget50: true,
            budget75: true,
            budget90: true,
            largeTransaction: 5000,
        }
    });

    // Load from localStorage on mount
    useEffect(() => {
        const savedNotifications = localStorage.getItem('notifications');
        const savedSettings = localStorage.getItem('notificationSettings');

        if (savedNotifications) {
            const parsed = JSON.parse(savedNotifications);
            setNotifications(parsed);
            setUnreadCount(parsed.filter(n => !n.read).length);
        }

        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    // Save to localStorage when notifications change
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }, [settings]);

    // Check if within quiet hours
    const isQuietHours = () => {
        if (!settings.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const { start, end } = settings.quietHours;

        if (start <= end) {
            return currentTime >= start && currentTime <= end;
        } else {
            // Handles overnight quiet hours (e.g., 22:00 to 08:00)
            return currentTime >= start || currentTime <= end;
        }
    };

    // Add notification
    const addNotification = (notification) => {
        if (!settings.enabled) return;
        if (isQuietHours()) return;

        const newNotification = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Auto-remove info notifications after 10 seconds
        if (notification.priority === 'info') {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, 10000);
        }
    };

    // Budget threshold notification
    const notifyBudgetThreshold = (percentage, spent, budget) => {
        if (!settings.budgetAlerts) return;

        let priority = 'info';
        let type = 'warning';

        if (percentage >= 90) {
            priority = 'critical';
            type = 'error';
            if (!settings.thresholds.budget90) return;
        } else if (percentage >= 75) {
            priority = 'important';
            type = 'warning';
            if (!settings.thresholds.budget75) return;
        } else if (percentage >= 50) {
            priority = 'important';
            type = 'warning';
            if (!settings.thresholds.budget50) return;
        } else {
            return;
        }

        addNotification({
            type,
            priority,
            title: `Budget Alert: ${percentage}% Used`,
            message: `You've spent ₹${spent.toLocaleString()} of your ₹${budget.toLocaleString()} monthly budget.`,
            icon: 'AlertCircle',
            action: {
                label: 'View Budget',
                route: 'dashboard'
            }
        });
    };

    // Overspending notification
    const notifyOverspending = (spent, budget) => {
        if (!settings.budgetAlerts) return;

        addNotification({
            type: 'error',
            priority: 'critical',
            title: '🚨 Budget Exceeded!',
            message: `You've exceeded your monthly budget by ₹${(spent - budget).toLocaleString()}. Consider reviewing your expenses.`,
            icon: 'XCircle',
            action: {
                label: 'Review Spending',
                route: 'entry'
            }
        });
    };

    // Large transaction notification
    const notifyLargeTransaction = (transaction) => {
        if (!settings.largeTransactions) return;
        if (transaction.amount < settings.thresholds.largeTransaction) return;

        addNotification({
            type: transaction.type === 'expense' ? 'warning' : 'success',
            priority: 'important',
            title: `Large ${transaction.type === 'expense' ? 'Expense' : 'Income'} Alert`,
            message: `${transaction.type === 'expense' ? 'Spent' : 'Received'} ₹${transaction.amount.toLocaleString()} on ${transaction.description}`,
            icon: transaction.type === 'expense' ? 'TrendingDown' : 'TrendingUp',
            action: {
                label: 'View Details',
                route: 'entry'
            }
        });
    };

    // Transaction success notification
    const notifyTransactionSuccess = (transaction) => {
        addNotification({
            type: 'success',
            priority: 'info',
            title: 'Transaction Added',
            message: `${transaction.type === 'expense' ? 'Expense' : 'Income'} of ₹${transaction.amount.toLocaleString()} recorded successfully`,
            icon: 'CheckCircle',
        });
    };

    // Health score update
    const notifyHealthScoreChange = (oldScore, newScore) => {
        if (!settings.healthScoreUpdates) return;

        const diff = newScore - oldScore;
        if (Math.abs(diff) < 5) return; // Only notify for significant changes

        const type = diff > 0 ? 'success' : 'warning';
        const emoji = diff > 0 ? '📈' : '📉';

        addNotification({
            type,
            priority: 'important',
            title: `${emoji} Health Score ${diff > 0 ? 'Improved' : 'Decreased'}`,
            message: `Your financial health score ${diff > 0 ? 'increased' : 'decreased'} from ${oldScore} to ${newScore}`,
            icon: 'Activity',
            action: {
                label: 'View Details',
                route: 'dashboard'
            }
        });
    };

    // Emergency fund alert
    const notifyEmergencyFund = (monthsCovered) => {
        if (monthsCovered >= 3) return; // Only alert if below 3 months

        addNotification({
            type: 'warning',
            priority: 'important',
            title: '⚠️ Emergency Fund Low',
            message: `Your emergency fund covers only ${monthsCovered.toFixed(1)} months of expenses. Aim for at least 6 months.`,
            icon: 'AlertTriangle',
            action: {
                label: 'Build Fund',
                route: 'dashboard'
            }
        });
    };

    // Daily finance tip
    const notifyDailyTip = (tip) => {
        if (!settings.dailyTips) return;

        addNotification({
            type: 'tip',
            priority: 'info',
            title: '💡 Daily Finance Tip',
            message: tip,
            icon: 'Lightbulb',
        });
    };

    // Spending insight
    const notifySpendingInsight = (insight) => {
        if (!settings.spendingInsights) return;

        addNotification({
            type: insight.type || 'info',
            priority: 'info',
            title: insight.title,
            message: insight.message,
            icon: 'TrendingUp',
            action: insight.action
        });
    };

    // Unusual spending pattern
    const notifyUnusualSpending = (category, amount, average) => {
        const percentIncrease = Math.round(((amount - average) / average) * 100);

        if (percentIncrease < 100) return; // Only notify if 2x or more

        addNotification({
            type: 'warning',
            priority: 'important',
            title: '🔍 Unusual Spending Detected',
            message: `Your ${category} spending (₹${amount.toLocaleString()}) is ${percentIncrease}% higher than usual.`,
            icon: 'AlertCircle',
            action: {
                label: 'Review Category',
                route: 'entry'
            }
        });
    };

    // Mark as read
    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    // Remove notification
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Clear all notifications
    const clearAll = () => {
        setNotifications([]);
    };

    // Update settings
    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const value = {
        notifications,
        unreadCount,
        settings,
        addNotification,
        notifyBudgetThreshold,
        notifyOverspending,
        notifyLargeTransaction,
        notifyTransactionSuccess,
        notifyHealthScoreChange,
        notifyEmergencyFund,
        notifyDailyTip,
        notifySpendingInsight,
        notifyUnusualSpending,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        updateSettings,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
