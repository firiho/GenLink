import React, { useState } from 'react';
import { Bell, Check, Clock, Info, MessageSquare, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const notifications = [
  {
    id: 1,
    type: 'challenge',
    title: 'New Challenge Available',
    message: 'Tech Innovation Challenge 2024 is now open for submissions',
    time: '2 minutes ago',
    unread: true,
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 2,
    type: 'message',
    title: 'Team Message',
    message: 'Sarah commented on your submission',
    time: '1 hour ago',
    unread: true,
    icon: MessageSquare,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 3,
    type: 'deadline',
    title: 'Deadline Approaching',
    message: 'Rwanda Tech Challenge ends in 2 days',
    time: '3 hours ago',
    unread: false,
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800'
  }
];

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUnreadCount(0);
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
                      onClick={markAllAsRead}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    className={cn(
                      "px-6 py-4 hover:bg-accent/5 transition-colors cursor-pointer group",
                      notification.unread && "bg-accent/5"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0 border",
                        notification.bg,
                        notification.border
                      )}>
                        <notification.icon className={cn(
                          "h-4 w-4",
                          notification.color
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={cn(
                            "font-semibold text-sm",
                            notification.unread ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full text-primary hover:bg-accent/10 text-sm font-medium"
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