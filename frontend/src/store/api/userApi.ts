import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  submissions?: any[];
  averageScore?: number;
}

interface UserResponse {
  success: boolean;
  data: {
    user?: UserProfile;
    users?: UserProfile[];
  };
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:4000/api/users',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUser: builder.query<UserProfile, void>({
      query: () => '/profile',
      transformResponse: (response: UserResponse) => response.data.user!,
      providesTags: ['User'],
    }),
    getAllUsers: builder.query<UserProfile[], void>({
      query: () => '/all-users',
      transformResponse: (response: UserResponse) => response.data.users!,
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<UserProfile, { userId: string; userData: Partial<UserProfile> }>({
      query: ({ userId, userData }) => ({
        url: `/user/${userId}/role`,
        method: 'PUT',
        body: userData,
      }),
      transformResponse: (response: UserResponse) => response.data.user!,
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
} = userApi; 