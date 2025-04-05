import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ReadingQuestion {
  _id: string;
  questionText: string;
  answerType: string;
  options?: string[];
  correctAnswer: string;
  instructions?: string;
  paragraphReference?: string;
}

export interface ReadingSection {
  _id: string;
  sectionName: string;
  passageText: string;
  questions: ReadingQuestion[];
  audio?: string;
  image?: string;
  pdf?: string;
}

export interface CreateReadingSectionRequest {
  sectionName: string;
  passageText: string;
  questions: string[];
  audio?: File;
  image?: File;
  pdf?: File;
}

export interface UpdateReadingSectionRequest {
  sectionName?: string;
  passageText?: string;
  questions?: string[];
  audio?: File;
  image?: File;
  pdf?: File;
}

export const readingSectionsApi = createApi({
  reducerPath: 'readingSectionsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:4000/api/reading-sections',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('x-auth-token', token);
      }
      return headers;
    },
  }),
  tagTypes: ['ReadingSection'],
  endpoints: (builder) => ({
    getReadingSections: builder.query<ReadingSection[], void>({
      query: () => '',
      providesTags: ['ReadingSection'],
    }),
    getReadingSection: builder.query<ReadingSection, string>({
      query: (id) => `/${id}`,
    }),
    createReadingSection: builder.mutation<ReadingSection, CreateReadingSectionRequest>({
      query: (section) => {
        const formData = new FormData();
        formData.append('sectionName', section.sectionName);
        formData.append('passageText', section.passageText);
        formData.append('questions', JSON.stringify(section.questions));
        if (section.audio) formData.append('audio', section.audio);
        if (section.image) formData.append('image', section.image);
        if (section.pdf) formData.append('pdf', section.pdf);

        return {
          url: '',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['ReadingSection'],
    }),
    updateReadingSection: builder.mutation<ReadingSection, { id: string; section: UpdateReadingSectionRequest }>({
      query: ({ id, section }) => {
        const formData = new FormData();
        if (section.sectionName) formData.append('sectionName', section.sectionName);
        if (section.passageText) formData.append('passageText', section.passageText);
        if (section.questions) formData.append('questions', JSON.stringify(section.questions));
        if (section.audio) formData.append('audio', section.audio);
        if (section.image) formData.append('image', section.image);
        if (section.pdf) formData.append('pdf', section.pdf);

        return {
          url: `/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['ReadingSection'],
    }),
    deleteReadingSection: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReadingSection'],
    }),
  }),
});

export const {
  useGetReadingSectionsQuery,
  useGetReadingSectionQuery,
  useCreateReadingSectionMutation,
  useUpdateReadingSectionMutation,
  useDeleteReadingSectionMutation,
} = readingSectionsApi; 