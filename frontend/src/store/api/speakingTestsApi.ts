import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SpeakingSection } from './speakingSectionsApi';

interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
}

export interface SpeakingTest {
  _id: string;
  testName: string;
  testType: 'academic' | 'general';
  sections: {
    _id: string;
    sectionName: string;
    partType: string;
    instructions: string;
    timeLimit: number;
    audioFile?: FileInfo;
    pdf?: FileInfo;
    image?: FileInfo;
  }[];
  timeLimit: number;
  instructions: string;
  audioFile?: FileInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpeakingTestRequest {
  testName: string;
  testType: 'academic' | 'general';
  sections: string[];
  timeLimit?: number;
  instructions: string;
  audioFile?: File; // For test-level audio instruction
}

export interface UpdateSpeakingTestRequest {
  testName?: string;
  testType?: 'academic' | 'general';
  sections?: string[];
  timeLimit?: number;
  instructions?: string;
  audioFile?: File; // For test-level audio instruction
}

// Create a base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://backend.abspak.com/api';

export const speakingTestsApi = createApi({
  reducerPath: 'speakingTestsApi',
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
  tagTypes: ['SpeakingTests'],
  endpoints: (builder) => ({
    getSpeakingTests: builder.query<SpeakingTest[], void>({
      query: () => '/speaking-tests',
      providesTags: ['SpeakingTests'],
    }),
    getSpeakingTest: builder.query<SpeakingTest, string>({
      query: (id) => `/speaking-tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SpeakingTests', id }],
    }),
    createSpeakingTest: builder.mutation<SpeakingTest, CreateSpeakingTestRequest>({
      query: (test) => {
        const formData = new FormData();
        formData.append('testName', test.testName);
        formData.append('testType', test.testType);
        formData.append('sections', JSON.stringify(test.sections));
        formData.append('instructions', test.instructions);
        if (test.timeLimit) formData.append('timeLimit', test.timeLimit.toString());
        if (test.audioFile) formData.append('audioFile', test.audioFile);

        return {
          url: '/speaking-tests',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['SpeakingTests'],
    }),
    updateSpeakingTest: builder.mutation<SpeakingTest, { id: string; test: UpdateSpeakingTestRequest }>({
      query: ({ id, test }) => {
        const formData = new FormData();
        if (test.testName) formData.append('testName', test.testName);
        if (test.testType) formData.append('testType', test.testType);
        if (test.sections) formData.append('sections', JSON.stringify(test.sections));
        if (test.instructions) formData.append('instructions', test.instructions);
        if (test.timeLimit !== undefined) formData.append('timeLimit', test.timeLimit.toString());
        if (test.audioFile) formData.append('audioFile', test.audioFile);

        return {
          url: `/speaking-tests/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'SpeakingTests', id }],
    }),
    deleteSpeakingTest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/speaking-tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SpeakingTests'],
    }),
  }),
});

export const {
  useGetSpeakingTestsQuery,
  useGetSpeakingTestQuery,
  useCreateSpeakingTestMutation,
  useUpdateSpeakingTestMutation,
  useDeleteSpeakingTestMutation,
} = speakingTestsApi; 