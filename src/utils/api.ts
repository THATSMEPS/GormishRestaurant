import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadBannerImage = async (restaurantId: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.patch(`/restaurants/${restaurantId}/banner`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Assuming backend returns updated restaurant with banners array
  return response.data.data.banners?.[0] || '';
};

export const uploadBannerImageSignup = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/restaurants/signup/banner', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Return publicUrl from response
  return response.data.data.publicUrl || '';
};

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || 'An error occurred';
    toast.error(message);
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
