import axios, { AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  CreateGiveawayRequest, 
  Giveaway, 
  ParticipateRequest, 
  AuthTokens,
  ApiError,
  Participant,
  GiveawayResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { tokens } = response.data;
          
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export class ApiService {
  // Authentication
  async facebookLogin(accessToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/facebook', { accessToken });
    return response.data;
  }
  
  async verifyToken(): Promise<{ user: any }> {
    const response = await api.get('/auth/verify');
    return response.data;
  }
  
  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }
  
  // Giveaways
  async createGiveaway(data: CreateGiveawayRequest): Promise<{ giveaway: Giveaway }> {
    const response = await api.post('/giveaways', data);
    return response.data;
  }
  
  async getGiveaway(hash: string): Promise<GiveawayResponse> {
    const response = await api.get(`/giveaways/${hash}`);
    return response.data;
  }
  
  async participateInGiveaway(hash: string, data: ParticipateRequest): Promise<{
    participant: {
      portion: number;
      profileLink: string;
      participatedAt: string;
    };
    giveaway: {
      participantsCount: number;
      remainingSlots: number;
      status: string;
    };
  }> {
    const response = await api.post(`/giveaways/${hash}/participate`, data);
    return response.data;
  }
  
  async getDashboard(hash: string): Promise<{
    giveaway: Giveaway;
    participants: Participant[];
  }> {
    const response = await api.get(`/giveaways/${hash}/dashboard`);
    return response.data;
  }
  
  async getUserGiveaways(): Promise<{
    created: Giveaway[];
    participated: Array<{
      giveaway: Giveaway;
      participant: Participant;
    }>;
  }> {
    const response = await api.get('/giveaways/my-giveaways');
    return response.data;
  }
}

export const apiService = new ApiService();
