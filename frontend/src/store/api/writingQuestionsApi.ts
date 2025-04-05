import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface WritingQuestion {
  _id: string;
  questionText: string;
  questionType: 'graph-description' | 'process-description' | 'map-description' | 'table-description' | 'diagram-description' | 'easy';
  instructions: string;
  diagramUrl?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWritingQuestionRequest {
  questionText: string;
  questionType: 'graph-description' | 'process-description' | 'map-description' | 'table-description' | 'diagram-description' | 'easy';
  instructions: string;
  diagram?: File;
  wordCount?: number;
}

export interface UpdateWritingQuestionRequest {
  questionText?: string;
  questionType?: 'graph-description' | 'process-description' | 'map-description' | 'table-description' | 'diagram-description' | 'easy';
  instructions?: string;
  wordCount?: number;
}

// Create a base URL configuration
const BASE_URL = 'http://localhost:4000/api';

export const writingQuestionsApi = createApi({
  reducerPath: 'writingQuestionsApi',
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
  tagTypes: ['WritingQuestions'],
  endpoints: (builder) => ({
    getWritingQuestions: builder.query<WritingQuestion[], void>({
      query: () => '/writing-questions',
      providesTags: ['WritingQuestions'],
    }),
    getWritingQuestion: builder.query<WritingQuestion, string>({
      query: (id) => `/writing-questions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'WritingQuestions', id }],
    }),
    createWritingQuestion: builder.mutation<WritingQuestion, CreateWritingQuestionRequest>({
      query: (question) => {
        const formData = new FormData();
        formData.append('questionText', question.questionText);
        formData.append('questionType', question.questionType);
        formData.append('instructions', question.instructions);
        if (question.wordCount) formData.append('wordCount', question.wordCount.toString());
        if (question.diagram) formData.append('diagram', question.diagram);

        return {
          url: '/writing-questions',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['WritingQuestions'],
    }),
    updateWritingQuestion: builder.mutation<WritingQuestion, { id: string; question: UpdateWritingQuestionRequest }>({
      query: ({ id, question }) => {
        const formData = new FormData();
        if (question.questionText) formData.append('questionText', question.questionText);
        if (question.questionType) formData.append('questionType', question.questionType);
        if (question.instructions) formData.append('instructions', question.instructions);
        if (question.wordCount) formData.append('wordCount', question.wordCount.toString());

        return {
          url: `/writing-questions/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'WritingQuestions', id }],
    }),
    updateWritingQuestionDiagram: builder.mutation<WritingQuestion, { id: string; diagram: File }>({
      query: ({ id, diagram }) => {
        const formData = new FormData();
        formData.append('diagram', diagram);

        return {
          url: `/writing-questions/${id}/diagram`,
          method: 'PATCH',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'WritingQuestions', id }],
    }),
    deleteWritingQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/writing-questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WritingQuestions'],
    }),
  }),
});

export const {
  useGetWritingQuestionsQuery,
  useGetWritingQuestionQuery,
  useCreateWritingQuestionMutation,
  useUpdateWritingQuestionMutation,
  useUpdateWritingQuestionDiagramMutation,
  useDeleteWritingQuestionMutation,
} = writingQuestionsApi; 