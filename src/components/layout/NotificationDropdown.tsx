import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, ExternalLink, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { notificationApi } from '../../api/notification';
import type { AppNotification } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const prevUnreadCount = useRef(0);
  const isFirstLoad = useRef(true);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      if (isFirstLoad.current) setLoading(true);
      const response = await notificationApi.getNotifications();
      const items = response.data.data || [];
      const newUnreadCount = items.filter((n: AppNotification) => !n.read_at).length;
      
      // If there are NEW notifications
      if (!isFirstLoad.current && newUnreadCount > prevUnreadCount.current) {
        const newItems = items.filter((n: AppNotification) => !n.read_at).slice(0, newUnreadCount - prevUnreadCount.current);
        
        newItems.forEach(item => {
          // Show Toast
          toast.success(item.data.title, {
            icon: <Bell className="w-5 h-5 text-primary" />,
            duration: 5000,
          });

          // Show Browser Notification
          if (Notification.permission === 'granted') {
            new Notification(item.data.title, {
              body: item.data.body,
              icon: '/favicon.ico'
            });
          }
        });
      }

      setNotifications(items);
      setUnreadCount(newUnreadCount);
      prevUnreadCount.current = newUnreadCount;
      isFirstLoad.current = false;
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default' && isAuthenticated) {
      Notification.requestPermission();
    }

    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 text-text-muted hover:bg-bg-subtle rounded-full transition-colors relative",
          isOpen && "bg-bg-subtle text-primary"
        )}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-md shadow-rose-500/20 animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-bg-base/50">
            <h3 className="font-bold text-text-primary">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-bold"
              >
                <Check className="w-3 h-3" strokeWidth={3} />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-16 h-16 bg-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-text-muted/30" />
                </div>
                <p className="text-text-muted text-sm font-medium">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id, notification.data.link)}
                    className={cn(
                      "px-4 py-4 hover:bg-bg-base transition-colors cursor-pointer flex gap-3",
                      !notification.read_at && "bg-primary/5"
                    )}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        !notification.read_at ? "bg-white shadow-sm border border-primary/10" : "bg-bg-subtle"
                      )}>
                        {getIcon(notification.data.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={cn(
                          "text-[13px] leading-tight",
                          !notification.read_at ? "text-text-primary font-black" : "text-text-secondary font-medium"
                        )}>
                          {notification.data.title}
                        </p>
                        {!notification.read_at && (
                          <span className="w-2 h-2 bg-primary rounded-full mt-1 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 mb-2 leading-relaxed">
                        {notification.data.body}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-text-muted font-medium">
                          <Clock className="w-3 h-3" />
                          {format(new Date(notification.created_at), 'HH:mm dd/MM')}
                        </div>
                        {notification.data.link && (
                          <ExternalLink className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-border bg-bg-base text-center">
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-[11px] text-text-secondary hover:text-primary font-bold uppercase tracking-wider"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
