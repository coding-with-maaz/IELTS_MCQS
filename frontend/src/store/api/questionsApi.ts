import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type QuestionType = 
  | 'multiple-choice'
  | 'short-answer'
  | 'sentence-completion'
  | 'notes-completion'
  | 'summary-completion'
  | 'matching';

export interface Question {
  _id: string;
  questionText: string;
  answerType: QuestionType;
  options?: string[];
  correctAnswer?: string;
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Create the questions API slice
export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  baseQuery: fetchBaseQuery({
    // baseUrl: 'http://backend.abspak.com/api',
    baseUrl: 'http://localhost:4000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
        headers.set('x-auth-token', token);
      }
      return headers;
    },
  }),
  tagTypes: ['Questions'],
  endpoints: (builder) => ({
    getQuestions: builder.query<ApiResponse<Question[]>, void>({
      query: () => '/questions',
      providesTags: ['Questions'],
    }),
    createQuestion: builder.mutation<ApiResponse<Question>, FormData>({
      query: (formData) => ({
        url: '/questions',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Questions'],
    }),
    updateQuestion: builder.mutation<ApiResponse<Question>, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/questions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Questions'],
    }),
    deleteQuestion: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Questions'],
    }),
  }),
});

export const { 
  useGetQuestionsQuery, 
  useCreateQuestionMutation, 
  useUpdateQuestionMutation,
  useDeleteQuestionMutation 
} = questionsApi; 