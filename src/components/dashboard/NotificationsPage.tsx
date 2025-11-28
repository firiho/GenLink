import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Filter, 
  MoreVertical,
  Loader2,
  AlertTriangle,
  XCircle,
  UserPlus,
  Award,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification, NotificationType } from '@/types/notification';const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success': return Check;
    case 'warning': return AlertTriangle;
    case 'error': return XCircle;
    case 'invite': return UserPlus;
    case 'achievement': return Award;
    case 'update': return RefreshCw;
    case 'info':
    default: return Info;
  }
};

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800'
      };
    case 'warning':
      return {
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800'
      };
    case 'error':
      return {
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800'
      };
    case 'invite':
      return {
        color: 'text-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800'
      };
    case 'achievement':
      return {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800'
      };
    case 'update':
      return {
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800'
      };
    case 'info':
    default:
      return {
        color: 'text-sky-600',
        bg: 'bg-sky-50 dark:bg-sky-900/20',
        border: 'border-sky-200 dark:border-sky-800'
      };
  }
};

const NotificationsPage = () => {
  const { notifications, loading, refreshNotifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    refreshNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeNotification(id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>
              You have {unreadCount} unread notifications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm">We'll notify you when something important happens.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const styles = getNotificationStyles(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                      notification.read ? "bg-card" : "bg-accent/5 border-accent/20"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0 border",
                      styles.bg,
                      styles.border
                    )}>
                      <Icon className={cn("h-5 w-5", styles.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "font-semibold text-sm",
                          !notification.read && "text-foreground"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <a 
                          href={notification.link}
                          className="text-xs text-primary hover:underline mt-2 inline-block font-medium"
                        >
                          View Details
                        </a>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!notification.read && (
                          <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(notification.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
