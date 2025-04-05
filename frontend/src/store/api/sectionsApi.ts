import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Question } from './questionsApi';

export interface Section {
  _id: string;
  sectionName: string;
  description?: string;
  audio?: string;
  image?: string;
  pdf?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionDto {
  sectionName: string;
  description?: string;
  questions?: string[];
  audio?: File;
  image?: File;
  pdf?: File;
}

export interface UpdateSectionDto {
  sectionName?: string;
  description?: string;
  questions?: string[];
  audio?: File;
  image?: File;
  pdf?: File;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const sectionsApi = createApi({
  reducerPath: 'sectionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('x-auth-token', token);
      }
      return headers;
    },
  }),
  tagTypes: ['Section'],
  endpoints: (builder) => ({
    createSection: builder.mutation<ApiResponse<Section>, FormData>({
      query: (data) => ({
        url: '/sections',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Section'],
    }),

    getSections: builder.query<ApiResponse<Section[]>, void>({
      query: () => '/sections',
      providesTags: ['Section'],
    }),

    getSection: builder.query<ApiResponse<Section>, string>({
      query: (id) => `/sections/${id}`,
      providesTags: ['Section'],
    }),

    updateSection: builder.mutation<
      ApiResponse<Section>,
      { id: string; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/sections/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Section'],
    }),

    deleteSection: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Section'],
    }),
  }),
});

export const {
  useGetSectionQuery,
  useGetSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = sectionsApi; 