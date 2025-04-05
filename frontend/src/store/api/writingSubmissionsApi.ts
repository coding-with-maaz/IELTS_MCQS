import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { WritingTest } from './writingTestsApi';

export interface SubmittedWritingTest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  test: WritingTest;
  answers: {
    task1: string;
    task2: string;
  };
  status: 'pending' | 'graded';
  grades?: {
    taskAchievement: number;
    coherenceAndCohesion: number;
    lexicalResource: number;
    grammaticalRangeAndAccuracy: number;
  };
  feedback?: {
    task1: string;
    task2: string;
  };
  overallBandScore?: number;
  completionTime?: number;
  answerSheet?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: {
    _id: string;
    name: string;
  };
}

export interface SubmitWritingTestRequest {
  answers: {
    task1: string;
    task2: string;
  };
  completionTime?: number;
  answerSheet?: File;
}

export interface GradeWritingSubmissionRequest {
  grades: {
    taskAchievement: number;
    coherenceAndCohesion: number;
    lexicalResource: number;
    grammaticalRangeAndAccuracy: number;
  };
  feedback: {
    task1: string;
    task2: string;
  };
  overallBandScore: number;
}

// Create a base URL configuration
const BASE_URL = 'http://localhost:4000/api';

export const writingSubmissionsApi = createApi({
  reducerPath: 'writingSubmissionsApi',
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
  tagTypes: ['WritingSubmissions'],
  endpoints: (builder) => ({
    submitWritingTest: builder.mutation<SubmittedWritingTest, { testId: string; data: SubmitWritingTestRequest }>({
      query: ({ testId, data }) => ({
        url: `/submitted-writing-tests/${testId}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WritingSubmissions'],
    }),
    getUserSubmissions: builder.query<SubmittedWritingTest[], void>({
      query: () => '/submitted-writing-tests/user',
      providesTags: ['WritingSubmissions'],
    }),
    getAllSubmissions: builder.query<SubmittedWritingTest[], void>({
      query: () => '/submitted-writing-tests/all',
      providesTags: ['WritingSubmissions'],
    }),
    getPendingSubmissions: builder.query<SubmittedWritingTest[], void>({
      query: () => '/submitted-writing-tests/pending',
      providesTags: ['WritingSubmissions'],
    }),
    getSubmission: builder.query<SubmittedWritingTest, string>({
      query: (id) => `/submitted-writing-tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'WritingSubmissions', id }],
    }),
    gradeSubmission: builder.mutation<SubmittedWritingTest, { submissionId: string; data: GradeWritingSubmissionRequest }>({
      query: ({ submissionId, data }) => ({
        url: `/submitted-writing-tests/${submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WritingSubmissions'],
    }),
  }),
});

export const {
  useSubmitWritingTestMutation,
  useGetUserSubmissionsQuery,
  useGetAllSubmissionsQuery,
  useGetPendingSubmissionsQuery,
  useGetSubmissionQuery,
  useGradeSubmissionMutation,
} = writingSubmissionsApi; 