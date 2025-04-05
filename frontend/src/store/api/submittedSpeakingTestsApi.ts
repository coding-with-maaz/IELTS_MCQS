import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SpeakingTest } from './speakingTestsApi';
import { SpeakingSection } from './speakingSectionsApi';

export interface AudioResponse {
  section: SpeakingSection;
  audioFile: {
    filename: string;
    path: string;
    mimetype: string;
  };
}

interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
}

export interface SubmittedSpeakingTest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  test: {
    _id: string;
    testName: string;
    testType: 'academic' | 'general';
    instructions: string;
    timeLimit: number;
    audioFile?: FileInfo;
    sections?: {
      _id: string;
      sectionName: string;
      partType: string;
      instructions: string;
      timeLimit: number;
      audioFile?: FileInfo;
      pdf?: FileInfo;
      image?: FileInfo;
    }[];
  };
  audioResponses: {
    _id: string;
    audioFile: {
      filename: string;
      path: string;
      mimetype: string;
    };
  }[];
  totalScore?: number;
  feedback?: {
    fluencyAndCoherence: {
      score: number;
      comments: string;
    };
    lexicalResource: {
      score: number;
      comments: string;
    };
    grammaticalRangeAndAccuracy: {
      score: number;
      comments: string;
    };
    pronunciation: {
      score: number;
      comments: string;
    };
  };
  isSubmitted: boolean;
  isGraded: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'graded';
  completionTime?: number;
}

export interface SubmitSpeakingSectionRequest {
  testId: string;
  sectionId: string;
  audioRecording: File;
  completionTime?: number;
}

export interface GradeSpeakingSubmissionRequest {
  grade: number;
  feedback: {
    fluencyAndCoherence: {
      score: number;
      comments: string;
    };
    lexicalResource: {
      score: number;
      comments: string;
    };
    grammaticalRangeAndAccuracy: {
      score: number;
      comments: string;
    };
    pronunciation: {
      score: number;
      comments: string;
    };
  };
}

export interface SubmitSpeakingTestRequest {
  testId: string;
  sectionId: string;
  audio: File;
  completionTime?: number;
}

export interface SubmitSpeakingTestResponse {
  success: boolean;
  message: string;
  data?: SubmittedSpeakingTest;
}

export const submittedSpeakingTestsApi = createApi({
  reducerPath: 'submittedSpeakingTests',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://backend.abspak.com/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SubmittedSpeakingTests'],
  endpoints: (builder) => ({
    submitSpeakingTest: builder.mutation<SubmitSpeakingTestResponse, FormData>({
      query: (formData) => ({
        url: '/submitted-speaking-tests/submit',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['SubmittedSpeakingTests'],
    }),
    getSubmittedSpeakingTests: builder.query<SubmitSpeakingTestResponse[], void>({
      query: () => '/submitted-speaking-tests/user',
      providesTags: ['SubmittedSpeakingTests'],
    }),
    getSubmittedSpeakingTest: builder.query<SubmitSpeakingTestResponse, string>({
      query: (submissionId) => `/submitted-speaking-tests/${submissionId}`,
      providesTags: (_result, _error, id) => [{ type: 'SubmittedSpeakingTests', id }],
    }),
    submitSpeakingSection: builder.mutation<SubmittedSpeakingTest, SubmitSpeakingSectionRequest>({
      query: (data) => {
        const formData = new FormData();
        formData.append('testId', data.testId);
        formData.append('sectionId', data.sectionId);
        formData.append('audio', data.audioRecording);
        if (data.completionTime) {
          formData.append('completionTime', data.completionTime.toString());
        }

        return {
          url: '/submitted-speaking-tests/submit',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['SubmittedSpeakingTests'],
    }),
    getUserSubmissions: builder.query<SubmittedSpeakingTest[], void>({
      query: () => '/submitted-speaking-tests/user',
      providesTags: ['SubmittedSpeakingTests'],
    }),
    getAllSubmissions: builder.query<SubmittedSpeakingTest[], void>({
      query: () => '/submitted-speaking-tests',
      providesTags: ['SubmittedSpeakingTests'],
    }),
    getPendingSubmissions: builder.query<SubmittedSpeakingTest[], void>({
      query: () => '/submitted-speaking-tests/pending',
      providesTags: ['SubmittedSpeakingTests'],
    }),
    getSubmission: builder.query<SubmittedSpeakingTest, string>({
      query: (id) => `/submitted-speaking-tests/${id}`,
      transformResponse: (response: any) => {
        console.log('Raw submission response:', response);
        // Handle both direct submission response and wrapped response formats
        const data = ('_id' in response) ? response : (response.data || response);
        
        // Ensure sections are properly structured
        if (data.test && Array.isArray(data.test.sections)) {
          data.test.sections = data.test.sections.map((section: any) => ({
            _id: section._id,
            sectionName: section.sectionName || `Part ${section.partType || 'Unknown'}`,
            partType: section.partType || 'Unknown',
            instructions: section.instructions || 'No instructions available',
            timeLimit: section.timeLimit || 0,
            audioFile: section.audioFile,
            pdf: section.pdf,
            image: section.image
          }));
        }
        
        return data;
      },
      providesTags: (_result, _error, id) => [{ type: 'SubmittedSpeakingTests', id }],
    }),
    gradeSubmission: builder.mutation<SubmittedSpeakingTest, { submissionId: string; data: GradeSpeakingSubmissionRequest }>({
      query: ({ submissionId, data }) => ({
        url: `/submitted-speaking-tests/${submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SubmittedSpeakingTests'],
    }),
    deleteSubmission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/submitted-speaking-tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubmittedSpeakingTests'],
    }),
  }),
});

export const {
  useSubmitSpeakingTestMutation,
  useGetSubmittedSpeakingTestsQuery,
  useGetSubmittedSpeakingTestQuery,
  useSubmitSpeakingSectionMutation,
  useGetUserSubmissionsQuery,
  useGetAllSubmissionsQuery,
  useGetPendingSubmissionsQuery,
  useGetSubmissionQuery,
  useGradeSubmissionMutation,
  useDeleteSubmissionMutation,
} = submittedSpeakingTestsApi; 