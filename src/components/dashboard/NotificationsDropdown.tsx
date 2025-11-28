import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Info, 
  MessageSquare, 
  AlertTriangle, 
  XCircle, 
  UserPlus, 
  Award, 
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const getNotificationIcon = (type: NotificationType) => {
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

const NotificationsDropdown = () => {
  const { notifications, unreadCount, loading, refreshNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen]);

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
    
    if (notification.link) {
      // Navigate to link if exists
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    if (location.pathname.includes('/partner')) {
      navigate('/partner/dashboard/notifications');
    } else if (location.pathname.includes('/admin')) {
      navigate('/admin/dashboard/notifications');
    } else {
      navigate('/dashboard/notifications');
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-accent/10 rounded-lg transition-colors border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4 text-foreground" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold shadow-sm"
          >
            {unreadCount}
          </span>
        )}
      </Button>

      
        {isOpen && (
          <>
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute right-0 mt-3 w-80 sm:w-96 rounded-lg shadow-lg z-50",
              "bg-card/95 backdrop-blur-sm border border-border py-2 pointer-events-auto"
            )}
            onClick={(e) => e.stopPropagation()}
          >
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 dark:border-red-800/50 dark:text-red-300 dark:bg-red-900/20 text-xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground text-xs"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0 || loading}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {loading && notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const styles = getNotificationStyles(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "px-6 py-4 hover:bg-accent/5 transition-colors cursor-pointer group border-b border-border/50 last:border-0",
                          !notification.read && "bg-accent/5"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "p-2 rounded-lg flex-shrink-0 border",
                            styles.bg,
                            styles.border
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              styles.color
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <p className={cn(
                                "font-semibold text-sm",
                                !notification.read ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-6 py-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full text-primary hover:bg-accent/10 text-sm font-medium"
                  onClick={handleViewAll}
                >
                  View all notifications
                </Button>
              </div>
            </div>
          </>
        )}
      
    </div>
  );
};

export default NotificationsDropdown; 