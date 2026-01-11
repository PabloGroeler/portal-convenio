import api from './api';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export const getLatestNews = async (): Promise<NewsItem[]> => {
  const { data } = await api.get('/news');
  return data;
};

export const getNewsById = async (id: number): Promise<NewsItem> => {
  const { data } = await api.get(`/news/${id}`);
  return data;
};

export const createNews = async (news: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data } = await api.post('/news', news);
  return data;
};

export const updateNews = async (id: number, news: Partial<NewsItem>) => {
  const { data } = await api.put(`/news/${id}`, news);
  return data;
};

export const deleteNews = async (id: number) => {
  await api.delete(`/news/${id}`);
};