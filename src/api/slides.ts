import api from './axios';

export type Slide = {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  link: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const slideApi = {
  getList: () => 
    api.get('/slides', { params: { active_only: true } }).then(res => res.data),
};
