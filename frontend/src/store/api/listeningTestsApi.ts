import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Question {
  _id: string;
  questionText: string;
  answerType: string;
  options?: string[];
  correctAnswer?: string;
  instructions?: string;
  text?: string;
  title?: string;
}

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

export interface SectionData {
  _id: string;
  sectionName: string;
  description?: string;
  audio?: string;
  pdf?: string;
  questionCount: number;
  questions: {
    _id: string;
    questionText: string;
    answerType: string;
    instructions?: string;
    options?: string[];
  }[];
}

export interface ListeningTest {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'academic' | 'general';
  duration: number;
  sections: string[]; // Array of section IDs
  totalQuestions: number;
  sectionsData: SectionData[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListeningTestRequest {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'academic' | 'general';
  duration: number;
  sections: string[]; // Array of section IDs
}

export interface SubmitTestRequest {
  testId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

export interface SubmitTestResponse extends ApiResponse<{
  message: string;
  submission: {
    _id: string;
    user: string;
    test: string;
    answers: {
      questionId: string;
      answer: string;
    }[];
    status: 'pending' | 'graded';
    submittedAt: string;
  };
}> {}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ListeningTestResponse extends ApiResponse<{
  test: ListeningTest;
}> {}

export interface ListeningTestsResponse extends ApiResponse<{
  tests: ListeningTest[];
}> {}

export interface SubmittedTest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  test: {
    _id: string;
    title: string;
    type: 'academic' | 'general';
    sections: Section[];
  };
  answers: {
    questionId: string;
    answer: string;
  }[];
  grade: number | null;
  feedback: string;
  status: 'pending' | 'graded';
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: {
    _id: string;
    name: string;
  };
}

export interface SubmittedTestsResponse {
  success: boolean;
  data: {
    submissions: SubmittedTest[];
  };
  message?: string;
}

export interface SubmittedTestResponse {
  success: boolean;
  data: {
    submission: SubmittedTest;
  };
  message?: string;
}

export const listeningTestsApi = createApi({
  reducerPath: 'listeningTests',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('x-auth-token', token);
      }
      return headers;
    },
  }),
  tagTypes: ['ListeningTest', 'Submission'],
  endpoints: (builder) => ({
    getListeningTests: builder.query<ListeningTestsResponse, void>({
      query: () => '/tests',
      providesTags: ['ListeningTest'],
    }),
    getListeningTest: builder.query<ListeningTestResponse, string>({
      query: (id) => `/tests/${id}`,
      providesTags: ['ListeningTest'],
    }),
    createListeningTest: builder.mutation<ListeningTestResponse, CreateListeningTestRequest>({
      query: (test) => ({
        url: '/tests',
        method: 'POST',
        body: test,
      }),
      invalidatesTags: ['ListeningTest'],
    }),
    updateListeningTest: builder.mutation<ListeningTestResponse, { id: string; test: Partial<CreateListeningTestRequest> }>({
      query: ({ id, test }) => ({
        url: `/tests/${id}`,
        method: 'PUT',
        body: test,
      }),
      invalidatesTags: ['ListeningTest'],
    }),
    deleteListeningTest: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ListeningTest'],
    }),
    addSectionToTest: builder.mutation<ListeningTestResponse, { testId: string; sectionId: string }>({
      query: ({ testId, sectionId }) => ({
        url: `/tests/${testId}/sections/${sectionId}`,
        method: 'POST',
      }),
      invalidatesTags: ['ListeningTest'],
    }),
    removeSectionFromTest: builder.mutation<ListeningTestResponse, { testId: string; sectionId: string }>({
      query: ({ testId, sectionId }) => ({
        url: `/tests/${testId}/sections/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ListeningTest'],
    }),
    reorderTestSections: builder.mutation<ListeningTestResponse, { testId: string; sectionIds: string[] }>({
      query: ({ testId, sectionIds }) => ({
        url: `/tests/${testId}/sections/reorder`,
        method: 'PUT',
        body: { sections: sectionIds },
      }),
      invalidatesTags: ['ListeningTest'],
    }),
    getUserSubmissions: builder.query<SubmittedTest[], void>({
      query: () => '/submitted-listening-tests/my-submissions',
      transformResponse: (response: SubmittedTest[] | { success: boolean; data: { submissions: SubmittedTest[] } }) => {
        console.log('Raw submissions response:', response);
        // Handle both array response and wrapped response formats
        if (Array.isArray(response)) {
          return response;
        }
        // Handle the wrapped response format
        return response.data?.submissions || [];
      },
      providesTags: ['Submission'],
    }),
    getSubmission: builder.query<SubmittedTest, string>({
      query: (submissionId) => ({
        url: `/submitted-listening-tests/${submissionId}`,
        method: 'GET',
      }),
      transformResponse: (response: SubmittedTest | { success: boolean; data: { submission: SubmittedTest } }) => {
        console.log('Raw submission response:', response);
        // Handle both direct submission response and wrapped response formats
        if ('_id' in response) {
          return response;
        }
        // Handle the wrapped response format
        return response.data?.submission;
      },
      providesTags: ['Submission'],
    }),
    submitTest: builder.mutation<SubmittedTestResponse, { testId: string; answers: { questionId: string; answer: string }[] }>({
      query: (data) => ({
        url: '/submitted-listening-tests/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),
    getAllSubmissions: builder.query<SubmittedTest[], void>({
      query: () => '/submitted-listening-tests/all',
      transformResponse: (response: SubmittedTest[] | { success: boolean; data: { submissions: SubmittedTest[] } }) => {
        console.log('Raw all submissions response:', response);
        if (Array.isArray(response)) {
          return response;
        }
        return response.data?.submissions || [];
      },
      providesTags: ['Submission'],
    }),
    gradeSubmission: builder.mutation<SubmittedTestResponse, { submissionId: string; grade: number; feedback: string }>({
      query: ({ submissionId, grade, feedback }) => ({
        url: `/submitted-listening-tests/grade/${submissionId}`,
        method: 'PUT',
        body: { grade, feedback },
      }),
      invalidatesTags: ['Submission'],
    }),
  }),
});

export const {
  useGetListeningTestsQuery,
  useGetListeningTestQuery,
  useCreateListeningTestMutation,
  useUpdateListeningTestMutation,
  useDeleteListeningTestMutation,
  useAddSectionToTestMutation,
  useRemoveSectionFromTestMutation,
  useReorderTestSectionsMutation,
  useGetUserSubmissionsQuery,
  useGetSubmissionQuery,
  useSubmitTestMutation,
  useGetAllSubmissionsQuery,
  useGradeSubmissionMutation,
} = listeningTestsApi; 