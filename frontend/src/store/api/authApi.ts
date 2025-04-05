import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RegisterRequest, LoginRequest, AuthResponse, User } from '@/types/user';

interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

const isTokenExpired = (expiresAt?: number) => {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt;
};

const getStoredTokenData = (): TokenData | null => {
  const token = localStorage.getItem('auth_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const expiresAt = localStorage.getItem('token_expires_at');
  
  if (!token) return null;
  
  return {
    token: token.trim(),
    refreshToken: refreshToken?.trim(),
    expiresAt: expiresAt ? parseInt(expiresAt) : undefined
  };
};

const setTokenData = (data: TokenData, user?: User) => {
  localStorage.setItem('auth_token', data.token);
  if (data.refreshToken) {
    localStorage.setItem('refresh_token', data.refreshToken);
  }
  if (data.expiresAt) {
    localStorage.setItem('token_expires_at', data.expiresAt.toString());
  }
  if (user?.profile?.testType) {
    localStorage.setItem('test_type', user.profile.testType);
  }
  document.cookie = `jwt=${data.token}; path=/; secure; samesite=strict`;
};

const clearTokenData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expires_at');
  document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    credentials: 'include',
    prepareHeaders: async (headers, { getState, endpoint }) => {
      const tokenData = getStoredTokenData();
      const testType = localStorage.getItem('test_type');
      
      if (tokenData) {
        // Check if token is expired and we have a refresh token
        if (isTokenExpired(tokenData.expiresAt) && tokenData.refreshToken && endpoint !== 'refresh') {
          try {
            const response = await fetch('http://localhost:4000/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.refreshToken}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data.token) {
                setTokenData({
                  token: data.data.token,
                  refreshToken: data.data.refreshToken,
                  expiresAt: Date.now() + (data.data.expiresIn || 3600) * 1000
                }, data.data.user);
                headers.set('Authorization', `Bearer ${data.data.token}`);
                headers.set('x-auth-token', data.data.token);
                if (testType) {
                  headers.set('x-test-type', testType);
                }
                return headers;
              }
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            clearTokenData();
            window.location.href = '/login';
            return headers;
          }
        }
        
        headers.set('Authorization', `Bearer ${tokenData.token}`);
        headers.set('x-auth-token', tokenData.token);
        if (testType) {
          headers.set('x-test-type', testType);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.token) {
            setTokenData({
              token: data.data.token,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            }, data.data.user);
          }
        } catch (error) {
          console.error('Registration error:', error);
        }
      }
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.token) {
            setTokenData({
              token: data.data.token,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            }, data.data.user);
          }
        } catch (error) {
          console.error('Login error:', error);
        }
      }
    }),
    logout: builder.mutation<void, void>({
      query: () => {
        const tokenData = getStoredTokenData();
        return {
          url: '/auth/logout',
          method: 'POST',
          headers: tokenData ? {
            'Authorization': `Bearer ${tokenData.token}`,
            'x-auth-token': tokenData.token
          } : {}
        };
      },
      async onQueryStarted(_, { dispatch }) {
        // Clear local storage
        clearTokenData();
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        localStorage.removeItem('test_type');
        
        // Clear Redux store
        dispatch({ type: 'auth/logout' });
      },
    }),
    getCurrentUser: builder.query<AuthResponse, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;
