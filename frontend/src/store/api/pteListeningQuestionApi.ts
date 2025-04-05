import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export interface PTEListeningQuestion {
  _id: string;
  questionType: 'multiple_choice' | 'fill_in_blanks' | 'highlight_correct_summary' | 'highlight_incorrect_words';
  questionText: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string;
  explanation: string;
  points: number;
  audioSegment: {
    startTime: number;
    endTime: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  section?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  questionType: PTEListeningQuestion['questionType'];
  questionText: string;
  options: PTEListeningQuestion['options'];
  correctAnswer: string;
  explanation: string;
  points: number;
  audioSegment: PTEListeningQuestion['audioSegment'];
  difficulty: PTEListeningQuestion['difficulty'];
  order: number;
  section?: string;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  _id: string;
}

export const pteListeningQuestionApi = createApi({
  reducerPath: 'pteListeningQuestionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/pte-listening-questions',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PTEListeningQuestion'],
  endpoints: (builder) => ({
    getAllQuestions: builder.query<PTEListeningQuestion[], void>({
      query: () => '',
      providesTags: ['PTEListeningQuestion'],
    }),
    getQuestionById: builder.query<PTEListeningQuestion, string>({
      query: (id) => `/${id}`,
      providesTags: ['PTEListeningQuestion'],
    }),
    createQuestion: builder.mutation<PTEListeningQuestion, CreateQuestionRequest>({
      query: (question) => ({
        url: '',
        method: 'POST',
        body: question,
      }),
      invalidatesTags: ['PTEListeningQuestion'],
    }),
    updateQuestion: builder.mutation<PTEListeningQuestion, UpdateQuestionRequest>({
      query: ({ _id, ...question }) => ({
        url: `/${_id}`,
        method: 'PUT',
        body: question,
      }),
      invalidatesTags: ['PTEListeningQuestion'],
    }),
    deleteQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PTEListeningQuestion'],
    }),
    getQuestionsByType: builder.query<PTEListeningQuestion[], string>({
      query: (type) => `/type/${type}`,
      providesTags: ['PTEListeningQuestion'],
    }),
    getQuestionsByDifficulty: builder.query<PTEListeningQuestion[], string>({
      query: (difficulty) => `/difficulty/${difficulty}`,
      providesTags: ['PTEListeningQuestion'],
    }),
    getQuestionsBySection: builder.query<PTEListeningQuestion[], string>({
      query: (sectionId) => `/section/${sectionId}`,
      providesTags: ['PTEListeningQuestion'],
    }),
  }),
});

export const {
  useGetAllQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetQuestionsByTypeQuery,
  useGetQuestionsByDifficultyQuery,
  useGetQuestionsBySectionQuery,
} = pteListeningQuestionApi;