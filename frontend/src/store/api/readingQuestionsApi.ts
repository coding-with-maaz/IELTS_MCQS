import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ReadingQuestion {
  _id: string;
  questionText: string;
  answerType: string;
  options?: string[];
  correctAnswer: string;
  instructions?: string;
  paragraphReference?: number;
}

export interface CreateReadingQuestionRequest {
  questionText: string;
  answerType: string;
  options?: string[];
  correctAnswer: string;
  instructions?: string;
  paragraphReference?: number;
}

export interface UpdateReadingQuestionRequest {
  questionText?: string;
  answerType?: string;
  options?: string[];
  correctAnswer?: string;
  instructions?: string;
  paragraphReference?: number;
}

export const readingQuestionsApi = createApi({
  reducerPath: 'readingQuestionsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:4000/api/reading-questions',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('x-auth-token', token);
      }
      return headers;
    },
  }),
  tagTypes: ['ReadingQuestion'],
  endpoints: (builder) => ({
    getReadingQuestions: builder.query<ReadingQuestion[], void>({
      query: () => '',
      providesTags: ['ReadingQuestion'],
    }),
    getReadingQuestion: builder.query<ReadingQuestion, string>({
      query: (id) => `/${id}`,
    }),
    createReadingQuestion: builder.mutation<ReadingQuestion, CreateReadingQuestionRequest>({
      query: (question) => ({
        url: '',
        method: 'POST',
        body: question,
      }),
      invalidatesTags: ['ReadingQuestion'],
    }),
    updateReadingQuestion: builder.mutation<ReadingQuestion, { id: string; question: UpdateReadingQuestionRequest }>({
      query: ({ id, question }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: question,
      }),
      invalidatesTags: ['ReadingQuestion'],
    }),
    deleteReadingQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReadingQuestion'],
    }),
  }),
});

export const {
  useGetReadingQuestionsQuery,
  useGetReadingQuestionQuery,
  useCreateReadingQuestionMutation,
  useUpdateReadingQuestionMutation,
  useDeleteReadingQuestionMutation,
} = readingQuestionsApi; 