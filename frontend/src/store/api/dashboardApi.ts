import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface TestStats {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  pteListening: number;
  pteReading: number;
  pteWriting: number;
  pteSpeaking: number;
}

export interface DashboardStats {
  totalTests: TestStats;
  totalSubmissions: TestStats;
  pendingGrading: TestStats;
  activeUsers: number;
  averageScore: TestStats;
  completionRate: TestStats;
}

export interface RecentActivity {
  id: string;
  type: 'submission' | 'grading' | 'test' | 'user';
  user: string;
  action: string;
  target?: string;
  timestamp: string;
  testType: 'listening' | 'reading' | 'writing' | 'speaking' | 'pteListening' | 'pteReading' | 'pteWriting' | 'pteSpeaking';
}

export interface RecentSubmission {
  id: string;
  userName: string;
  testName: string;
  testType: 'listening' | 'reading' | 'writing' | 'speaking';
  testCategory: 'ielts' | 'pte';
  submittedAt: string;
  status: 'graded' | 'pending';
  grade?: number;
}

// Create a base URL configuration
const BASE_URL = 'http://localhost:4000/api';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['DashboardStats', 'RecentActivity', 'RecentSubmissions'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),
    getRecentActivity: builder.query<RecentActivity[], void>({
      query: () => '/dashboard/recent-activity',
      providesTags: ['RecentActivity'],
    }),
    getRecentSubmissions: builder.query<RecentSubmission[], void>({
      query: () => '/dashboard/recent-submissions',
      providesTags: ['RecentSubmissions'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRecentActivityQuery,
  useGetRecentSubmissionsQuery,
} = dashboardApi; 