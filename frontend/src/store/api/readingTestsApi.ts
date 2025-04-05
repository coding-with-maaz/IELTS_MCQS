import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ReadingSection } from './readingSectionsApi';

export interface ReadingQuestion {
  _id: string;
  questionText: string;
  answerType: 'multiple-choice' | 'true-false-not-given' | 'short-answer' | 
    'sentence-completion' | 'notes-completion' | 'summary-completion' | 
    'matching-paragraphs' | 'matching';
  options?: string[];
  correctAnswer: string;
  instructions?: string;
  paragraphReference?: number;
}

export interface ReadingTest {
  _id: string;
  testName: string;
  testType: 'academic' | 'general';
  sections: ReadingSection[];
  timeLimit: number;
  answerSheet?: string;
  createdAt: string;
}

export interface ReadingSubmission {
  _id: string;
  test: ReadingTest;
  user: string;
  answers: Record<string, string>;
  status: 'pending' | 'graded';
  grade?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface CreateReadingTestRequest {
  testName: string;
  testType: 'academic' | 'general';
  sections: string[];
  timeLimit: number;
  answerSheet?: File;
}

export interface UpdateReadingTestRequest {
  testName?: string;
  testType?: 'academic' | 'general';
  sections?: string[];
  timeLimit?: number;
  answerSheet?: File;
}

// Create a base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const readingTestsApi = createApi({
  reducerPath: 'readingTestsApi',
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
  tagTypes: ['ReadingTests', 'ReadingSubmissions'],
  endpoints: (builder) => ({
    getReadingTests: builder.query<ReadingTest[], void>({
      query: () => '/reading-tests',
      providesTags: ['ReadingTests'],
    }),
    getReadingTest: builder.query<ReadingTest, string>({
      query: (id) => `/reading-tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ReadingTests', id }],
    }),
    createReadingTest: builder.mutation<ReadingTest, CreateReadingTestRequest>({
      query: (test) => ({
        url: '/reading-tests',
        method: 'POST',
        body: test,
      }),
      invalidatesTags: ['ReadingTests'],
    }),
    updateReadingTest: builder.mutation<ReadingTest, { id: string; test: UpdateReadingTestRequest }>({
      query: ({ id, test }) => ({
        url: `/reading-tests/${id}`,
        method: 'PUT',
        body: test,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'ReadingTests', id }],
    }),
    deleteReadingTest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reading-tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReadingTests'],
    }),
    submitReadingTest: builder.mutation<ReadingSubmission, { testId: string; answers: Record<string, string> }>({
      query: ({ testId, answers }) => ({
        url: `/reading-tests/${testId}/submit`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['ReadingSubmissions'],
    }),
    getUserReadingSubmissions: builder.query<ReadingSubmission[], void>({
      query: () => '/submitted-reading-tests/my-submissions',
      providesTags: ['ReadingSubmissions'],
    }),
    getSubmission: builder.query<ReadingSubmission, string>({
      query: (submissionId) => `/submitted-reading-tests/${submissionId}`,
      providesTags: (_result, _error, id) => [{ type: 'ReadingSubmissions', id }],
    }),
  }),
});

export const {
  useGetReadingTestsQuery,
  useGetReadingTestQuery,
  useCreateReadingTestMutation,
  useUpdateReadingTestMutation,
  useDeleteReadingTestMutation,
  useSubmitReadingTestMutation,
  useGetSubmissionQuery,
  useGetUserReadingSubmissionsQuery,
} = readingTestsApi;