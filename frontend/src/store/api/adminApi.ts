import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile: {
    phoneNumber?: string;
    country?: string;
    targetBand?: number;
    nativeLanguage?: string;
    bio?: string;
    avatar?: string;
  };
  createdAt: string;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
}

interface SubmissionStats {
  listening: {
    pending: number;
    graded: number;
  };
  reading: {
    pending: number;
    graded: number;
  };
  writing: {
    pending: number;
    graded: number;
  };
}

export const adminApi = createApi({
  reducerPath: 'admin',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/admin',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users', 'Submissions', 'Stats'],
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['Users'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    updateUser: builder.mutation<{ message: string; user: User }, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Users', id },
        'Users',
      ],
    }),
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    getPendingSubmissions: builder.query<{
      listening: any[];
      reading: any[];
      writing: any[];
    }, void>({
      query: () => 'submissions/pending',
      providesTags: ['Submissions'],
    }),
    getSubmissionStats: builder.query<SubmissionStats, void>({
      query: () => 'submissions/stats',
      providesTags: ['Stats'],
    }),
    gradeListeningTest: builder.mutation<
      { message: string; submission: any },
      { submissionId: string; grade: number; feedback?: string }
    >({
      query: ({ submissionId, ...data }) => ({
        url: `submissions/listening/${submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Submissions', 'Stats'],
    }),
    gradeReadingTest: builder.mutation<
      { message: string; submission: any },
      { submissionId: string; grade: number; feedback?: string }
    >({
      query: ({ submissionId, ...data }) => ({
        url: `submissions/reading/${submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Submissions', 'Stats'],
    }),
    gradeWritingTest: builder.mutation<
      { message: string; submission: any },
      {
        submissionId: string;
        grades: Array<{
          sectionId: string;
          taskResponse: { score: number };
          coherenceAndCohesion: { score: number };
          lexicalResource: { score: number };
          grammaticalRangeAndAccuracy: { score: number };
        }>;
        overallBandScore: number;
        generalFeedback?: string;
      }
    >({
      query: ({ submissionId, ...data }) => ({
        url: `submissions/writing/${submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Submissions', 'Stats'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetPendingSubmissionsQuery,
  useGetSubmissionStatsQuery,
  useGradeListeningTestMutation,
  useGradeReadingTestMutation,
  useGradeWritingTestMutation,
} = adminApi; 