import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Button } from "@/components/ui/button";

const NotificationBell = ({ onClick }) => {
    const { unreadCount } = useNotifications();

    return (
        <Button variant="ghost" size="icon" onClick={onClick} className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive transition-transform animate-in zoom-in" />
            )}
        </Button>
    );
};

export default NotificationBell;
