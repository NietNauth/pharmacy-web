import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Clock, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { notificationApi } from '../api/notification';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { AppNotification } from '../types';

const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page, filter],
    queryFn: () => notificationApi.getNotifications(page),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Đã đánh dấu đọc tất cả');
    },
  });

  const notifications = data?.data?.data || [];
  const meta = data?.data?.meta;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n: AppNotification) => !n.read_at)
    : notifications;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read_at) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.data.link) {
      navigate(notification.data.link);
    }
  };

  return (
    <PageWrapper
      title="Thông báo của tôi"
      subtitle="Theo dõi các cập nhật mới nhất về đơn hàng và tư vấn."
      actions={
        <Button
          variant="outline"
          size="sm"
          iconLeft={<Check size={16} />}
          onClick={() => markAllAsReadMutation.mutate()}
          isLoading={markAllAsReadMutation.isPending}
          disabled={!notifications.some((n: AppNotification) => !n.read_at)}
          className="rounded-xl font-bold text-xs"
        >
          Đọc tất cả
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Filter Toggle */}
        <div className="flex justify-start mb-6">
          <div className="flex items-center gap-2 bg-bg-subtle p-1 rounded-xl border border-border">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                filter === 'all' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                filter === 'unread' ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
              )}
            >
              Chưa đọc
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-border p-16 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-muted text-sm font-medium">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border p-16 text-center">
              <div className="w-20 h-20 bg-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-text-muted/20" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">Không có thông báo nào</h3>
              <p className="text-text-muted text-sm">
                {filter === 'unread' ? "Bạn đã đọc hết tất cả thông báo rồi." : "Thông báo mới sẽ xuất hiện tại đây."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification: AppNotification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer flex gap-4 group relative border",
                  !notification.read_at 
                    ? "bg-emerald-500/[0.04] border-emerald-500/20 shadow-sm hover:bg-emerald-500/[0.08]" 
                    : "bg-white border-border hover:bg-bg-base hover:shadow-md"
                )}
              >
                {!notification.read_at && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-full shadow-sm" />
                )}
                
                <div className="mt-0.5 flex-shrink-0">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105",
                    !notification.read_at ? "bg-white shadow-sm border border-emerald-500/10" : "bg-bg-subtle"
                  )}>
                    {getIcon(notification.data.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex items-center gap-3">
                      {!notification.read_at && (
                        <div className="relative flex items-center justify-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute" />
                          <span className="w-2 h-2 bg-emerald-500 rounded-full relative" />
                        </div>
                      )}
                      <h4 className={cn(
                        "text-base sm:text-lg leading-tight tracking-tight",
                        !notification.read_at ? "text-emerald-950 font-bold" : "text-text-secondary font-semibold"
                      )}>
                        {notification.data.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold whitespace-nowrap bg-bg-subtle px-2 py-1 rounded-lg border border-border/50 shrink-0">
                      <Clock size={12} />
                      {notification.created_at ? format(new Date(notification.created_at), 'HH:mm dd/MM') : '---'}
                    </div>
                  </div>
                  
                  <p className={cn(
                    "text-sm sm:text-base mb-3 leading-relaxed max-w-3xl",
                    !notification.read_at ? "text-emerald-900 font-medium" : "text-text-muted"
                  )}>
                    {notification.data.body}
                  </p>

                  {notification.data.link && (
                    <div className="flex items-center gap-3 text-[13px] text-emerald-600 font-black uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                      Xem ngay chi tiết <ExternalLink size={18} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-xl font-bold"
            >
              Trước
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(meta.last_page)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-black transition-all",
                    page === i + 1 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "bg-white border border-border text-text-muted hover:border-primary hover:text-primary"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.last_page}
              onClick={() => setPage(p => p + 1)}
              className="rounded-xl font-bold"
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;
