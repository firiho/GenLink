import React, { useState } from 'react';
import { Bell, Check, Clock, Info, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const notifications = [
  {
    id: 1,
    type: 'challenge',
    title: 'New Challenge Available',
    message: 'Tech Innovation Challenge 2024 is now open for submissions',
    time: '2 minutes ago',
    unread: true,
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    id: 2,
    type: 'message',
    title: 'Team Message',
    message: 'Sarah commented on your submission',
    time: '1 hour ago',
    unread: true,
    icon: MessageSquare,
    color: 'text-green-500',
    bg: 'bg-green-50'
  },
  {
    id: 3,
    type: 'deadline',
    title: 'Deadline Approaching',
    message: 'Rwanda Tech Challenge ends in 2 days',
    time: '3 hours ago',
    unread: false,
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50'
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
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-lg z-50",
                "bg-white border border-gray-200 py-2"
              )}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 text-sm hover:text-primary"
                    onClick={markAllAsRead}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark all as read
                  </Button>
                </div>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
                      notification.unread && "bg-gray-50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        notification.bg
                      )}>
                        <notification.icon className={cn(
                          "h-4 w-4",
                          notification.color
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={cn(
                            "font-medium text-sm",
                            notification.unread ? "text-gray-900" : "text-gray-600"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="w-full text-primary hover:bg-primary/5 text-sm"
                >
                  View all notifications
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsDropdown; 