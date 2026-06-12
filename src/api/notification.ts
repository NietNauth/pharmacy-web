import axios from './axios';

export const notificationApi = {
  getNotifications: (page: number = 1) => axios.get(`/notifications?page=${page}`),
  markAsRead: (id: string) => axios.post(`/notifications/${id}/read`),
  markAllAsRead: () => axios.post('/notifications/read-all'),
};
