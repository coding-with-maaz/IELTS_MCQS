import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ReadingTest } from './readingTestsApi';

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface SubmittedReadingTest {
  _id: string;
  user: User;
  test: ReadingTest;
  answers: Record<string, string>;
  status: 'pending' | 'graded';
  grade?: number;
  bandScore?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: {
    _id: string;
    name: string;
  };
}

interface GradeSubmissionRequest {
  submissionId: string;
  bandScore: number;
  feedback: string;
}

// Create a base URL configuration
const BASE_URL = 'http://localhost:4000/api';

export const submittedReadingTestsApi = createApi({
  reducerPath: 'submittedReadingTestsApi',
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
  tagTypes: ['SubmittedReadingTests'],
  endpoints: (builder) => ({
    getAllSubmissions: builder.query<SubmittedReadingTest[], void>({
      query: () => '/submitted-reading-tests',
      providesTags: ['SubmittedReadingTests'],
    }),
    getUserSubmissions: builder.query<SubmittedReadingTest[], void>({
      query: () => '/submitted-reading-tests/my-submissions',
      providesTags: ['SubmittedReadingTests'],
    }),
    getSubmission: builder.query<SubmittedReadingTest, string>({
      query: (id) => `/submitted-reading-tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SubmittedReadingTests', id }],
    }),
    gradeSubmission: builder.mutation<SubmittedReadingTest, GradeSubmissionRequest>({
      query: ({ submissionId, bandScore, feedback }) => ({
        url: `/submitted-reading-tests/${submissionId}/grade`,
        method: 'POST',
        body: { bandScore, feedback },
      }),
      invalidatesTags: ['SubmittedReadingTests'],
    }),
  }),
});

export const {
  useGetAllSubmissionsQuery,
  useGetUserSubmissionsQuery,
  useGetSubmissionQuery,
  useGradeSubmissionMutation,
} = submittedReadingTestsApi; 