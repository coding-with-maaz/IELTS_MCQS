import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { WritingQuestion } from './writingQuestionsApi';

export interface WritingSection {
  _id: string;
  sectionName: string;
  taskType: 'task1' | 'task2';
  questions: WritingQuestion[];
  minimumWords: number;
  timeLimit: number;
  instructions: string;
  pdf?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWritingSectionRequest {
  sectionName: string;
  taskType: 'task1' | 'task2';
  questions: string[];
  minimumWords?: number;
  timeLimit?: number;
  instructions: string;
  pdf?: File;
  image?: File;
}

export interface UpdateWritingSectionRequest {
  sectionName?: string;
  taskType?: 'task1' | 'task2';
  questions?: string[];
  minimumWords?: number;
  timeLimit?: number;
  instructions?: string;
  pdf?: File;
  image?: File;
}

// Create a base URL configuration
const BASE_URL = 'http://localhost:4000/api';

export const writingSectionsApi = createApi({
  reducerPath: 'writingSectionsApi',
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
  tagTypes: ['WritingSections'],
  endpoints: (builder) => ({
    getWritingSections: builder.query<WritingSection[], void>({
      query: () => '/writing-sections',
      providesTags: ['WritingSections'],
    }),
    getWritingSection: builder.query<WritingSection, string>({
      query: (id) => `/writing-sections/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'WritingSections', id }],
    }),
    createWritingSection: builder.mutation<WritingSection, CreateWritingSectionRequest>({
      query: (section) => {
        const formData = new FormData();
        formData.append('sectionName', section.sectionName);
        formData.append('taskType', section.taskType);
        formData.append('questions', JSON.stringify(section.questions));
        formData.append('instructions', section.instructions);
        if (section.minimumWords) formData.append('minimumWords', section.minimumWords.toString());
        if (section.timeLimit) formData.append('timeLimit', section.timeLimit.toString());
        if (section.pdf) formData.append('pdf', section.pdf);
        if (section.image) formData.append('image', section.image);

        return {
          url: '/writing-sections',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['WritingSections'],
    }),
    updateWritingSection: builder.mutation<WritingSection, { id: string; section: UpdateWritingSectionRequest }>({
      query: ({ id, section }) => {
        const formData = new FormData();
        if (section.sectionName) formData.append('sectionName', section.sectionName);
        if (section.taskType) formData.append('taskType', section.taskType);
        if (section.questions) formData.append('questions', JSON.stringify(section.questions));
        if (section.instructions) formData.append('instructions', section.instructions);
        if (section.minimumWords !== undefined) formData.append('minimumWords', section.minimumWords.toString());
        if (section.timeLimit !== undefined) formData.append('timeLimit', section.timeLimit.toString());
        if (section.pdf) formData.append('pdf', section.pdf);
        if (section.image) formData.append('image', section.image);

        return {
          url: `/writing-sections/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'WritingSections', id }],
    }),
    deleteWritingSection: builder.mutation<void, string>({
      query: (id) => ({
        url: `/writing-sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WritingSections'],
    }),
  }),
});

export const {
  useGetWritingSectionsQuery,
  useGetWritingSectionQuery,
  useCreateWritingSectionMutation,
  useUpdateWritingSectionMutation,
  useDeleteWritingSectionMutation,
} = writingSectionsApi; 