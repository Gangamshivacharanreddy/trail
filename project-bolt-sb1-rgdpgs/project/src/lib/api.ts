import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const posts = {
  create: (data: FormData) => api.post('/posts', data),
  getAll: () => api.get('/posts'),
  addComment: (postId: string, content: string) =>
    api.post(`/comments/${postId}`, { content }),
  getComments: (postId: string) => api.get(`/comments/${postId}`),
};

export default api;