import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface WritingSection {
  _id: string;
  sectionName: string;
  instructions: string;
  timeLimit: number;
  wordLimit?: number;
  taskType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WritingTest {
  _id: string;
  testName: string;
  testType: 'academic' | 'general';
  sections: WritingSection[];
  timeLimit: number;
  instructions: string;
  answerSheet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWritingTestRequest {
  testName: string;
  testType: 'academic' | 'general';
  sections: string[];
  timeLimit?: number;
  instructions: string;
  answerSheet?: File;
}

export interface UpdateWritingTestRequest {
  testName?: string;
  testType?: 'academic' | 'general';
  sections?: string[];
  timeLimit?: number;
  instructions?: string;
  answerSheet?: File;
}

// Submission interfaces
export interface WritingTestSubmission {
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
  answerSheet?: string;
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
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: {
    _id: string;
    name: string;
  };
}

export interface GradeSubmissionRequest {
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

export interface SubmitTestRequest {
  answers: {
    task1: string;
    task2: string;
  };
  answerSheet?: File;
}

// Create a base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const writingTestsApi = createApi({
  reducerPath: 'writingTestsApi',
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
  tagTypes: ['WritingTests', 'WritingSubmissions'],
  endpoints: (builder) => ({
    getWritingTests: builder.query<WritingTest[], void>({
      query: () => '/writing-tests',
      providesTags: ['WritingTests'],
    }),
    getWritingTest: builder.query<WritingTest, string>({
      query: (id) => `/writing-tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'WritingTests', id }],
    }),
    createWritingTest: builder.mutation<WritingTest, CreateWritingTestRequest>({
      query: (test) => {
        const formData = new FormData();
        formData.append('testName', test.testName);
        formData.append('testType', test.testType);
        formData.append('sections', JSON.stringify(test.sections));
        formData.append('instructions', test.instructions);
        if (test.timeLimit) formData.append('timeLimit', test.timeLimit.toString());
        if (test.answerSheet) formData.append('answerSheet', test.answerSheet);

        return {
          url: '/writing-tests',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['WritingTests'],
    }),
    updateWritingTest: builder.mutation<WritingTest, { id: string; test: UpdateWritingTestRequest }>({
      query: ({ id, test }) => {
        const formData = new FormData();
        if (test.testName) formData.append('testName', test.testName);
        if (test.testType) formData.append('testType', test.testType);
        if (test.sections) formData.append('sections', JSON.stringify(test.sections));
        if (test.instructions) formData.append('instructions', test.instructions);
        if (test.timeLimit !== undefined) formData.append('timeLimit', test.timeLimit.toString());
        if (test.answerSheet) formData.append('answerSheet', test.answerSheet);

        return {
          url: `/writing-tests/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'WritingTests', id }],
    }),
    deleteWritingTest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/writing-tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WritingTests'],
    }),
    // Submission endpoints
    submitWritingTest: builder.mutation<WritingTestSubmission, { testId: string; data: SubmitTestRequest }>({
      query: ({ testId, data }) => {
        const formData = new FormData();
        formData.append('answers', JSON.stringify(data.answers));
        if (data.answerSheet) formData.append('answerSheet', data.answerSheet);

        return {
          url: `/writing-tests/${testId}/submit`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['WritingSubmissions'],
    }),
    getPendingSubmissions: builder.query<WritingTestSubmission[], void>({
      query: () => '/writing-tests/submissions/pending',
      providesTags: ['WritingSubmissions'],
    }),
    getAllSubmissions: builder.query<WritingTestSubmission[], void>({
      query: () => '/writing-tests/submissions/all',
      providesTags: ['WritingSubmissions'],
    }),
    getSubmission: builder.query<WritingTestSubmission, string>({
      query: (id) => `/writing-tests/submissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'WritingSubmissions', id }],
    }),
    gradeSubmission: builder.mutation<WritingTestSubmission, { submissionId: string; data: GradeSubmissionRequest }>({
      query: ({ submissionId, data }) => ({
        url: `/writing-tests/submissions/${submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WritingSubmissions'],
    }),
  }),
});

export const {
  useGetWritingTestsQuery,
  useGetWritingTestQuery,
  useCreateWritingTestMutation,
  useUpdateWritingTestMutation,
  useDeleteWritingTestMutation,
  useSubmitWritingTestMutation,
  useGetPendingSubmissionsQuery,
  useGetAllSubmissionsQuery,
  useGetSubmissionQuery,
  useGradeSubmissionMutation,
} = writingTestsApi; 