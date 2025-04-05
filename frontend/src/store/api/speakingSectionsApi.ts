import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
}

export interface SpeakingSection {
  _id: string;
  sectionName: string;
  partType: 'part1' | 'part2' | 'part3';
  audioFile?: FileInfo;
  pdf?: FileInfo;
  image?: FileInfo;
  instructions: string;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpeakingSectionRequest {
  sectionName: string;
  partType: 'part1' | 'part2' | 'part3';
  instructions: string;
  timeLimit?: number;
  audio?: File;
  pdf?: File;
  image?: File;
}

export interface UpdateSpeakingSectionRequest {
  sectionName?: string;
  partType?: 'part1' | 'part2' | 'part3';
  instructions?: string;
  timeLimit?: number;
  audio?: File;
  pdf?: File;
  image?: File;
}

// Create a base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://backend.abspak.com/api';

export const speakingSectionsApi = createApi({
  reducerPath: 'speakingSectionsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include', // Include credentials in the request
  }),
  tagTypes: ['SpeakingSections'],
  endpoints: (builder) => ({
    getSpeakingSections: builder.query<SpeakingSection[], void>({
      query: () => '/speaking-sections',
      providesTags: ['SpeakingSections'],
    }),
    getSpeakingSection: builder.query<SpeakingSection, string>({
      query: (id) => `/speaking-sections/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SpeakingSections', id }],
    }),
    createSpeakingSection: builder.mutation<SpeakingSection, CreateSpeakingSectionRequest>({
      query: (section) => {
        const formData = new FormData();
        formData.append('sectionName', section.sectionName);
        formData.append('partType', section.partType);
        formData.append('instructions', section.instructions);
        if (section.timeLimit) formData.append('timeLimit', section.timeLimit.toString());
        if (section.audio) formData.append('audio', section.audio);
        if (section.pdf) formData.append('pdf', section.pdf);
        if (section.image) formData.append('image', section.image);

        return {
          url: '/speaking-sections',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['SpeakingSections'],
    }),
    updateSpeakingSection: builder.mutation<SpeakingSection, { id: string; section: UpdateSpeakingSectionRequest }>({
      query: ({ id, section }) => {
        const formData = new FormData();
        if (section.sectionName) formData.append('sectionName', section.sectionName);
        if (section.partType) formData.append('partType', section.partType);
        if (section.instructions) formData.append('instructions', section.instructions);
        if (section.timeLimit !== undefined) formData.append('timeLimit', section.timeLimit.toString());
        if (section.audio) formData.append('audio', section.audio);
        if (section.pdf) formData.append('pdf', section.pdf);
        if (section.image) formData.append('image', section.image);

        return {
          url: `/speaking-sections/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'SpeakingSections', id }],
    }),
    deleteSpeakingSection: builder.mutation<void, string>({
      query: (id) => ({
        url: `/speaking-sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SpeakingSections'],
    }),
  }),
});

export const {
  useGetSpeakingSectionsQuery,
  useGetSpeakingSectionQuery,
  useCreateSpeakingSectionMutation,
  useUpdateSpeakingSectionMutation,
  useDeleteSpeakingSectionMutation,
} = speakingSectionsApi; 