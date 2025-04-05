import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { listeningTestsApi } from './api/listeningTestsApi';
import { questionsApi } from './api/questionsApi';
import { sectionsApi } from './api/sectionsApi';
import { readingTestsApi } from './api/readingTestsApi';
import { writingTestsApi } from './api/writingTestsApi';
import { speakingTestsApi } from './api/speakingTestsApi';
import { speakingSectionsApi } from './api/speakingSectionsApi';
import { writingQuestionsApi } from './api/writingQuestionsApi';
import { writingSectionsApi } from './api/writingSectionsApi';
import { readingQuestionsApi } from './api/readingQuestionsApi';
import { readingSectionsApi } from './api/readingSectionsApi';
import { submittedReadingTestsApi } from './api/submittedReadingTestsApi';
import { submittedSpeakingTestsApi } from './api/submittedSpeakingTestsApi';
import { dashboardApi } from './api/dashboardApi';
import { writingSubmissionsApi } from './api/writingSubmissionsApi';
import { searchApi } from './api/searchApi';
import { pteListeningQuestionApi } from './api/pteListeningQuestionApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [listeningTestsApi.reducerPath]: listeningTestsApi.reducer,
    [questionsApi.reducerPath]: questionsApi.reducer,
    [sectionsApi.reducerPath]: sectionsApi.reducer,
    [readingTestsApi.reducerPath]: readingTestsApi.reducer,
    [writingTestsApi.reducerPath]: writingTestsApi.reducer,
    [speakingTestsApi.reducerPath]: speakingTestsApi.reducer,
    [speakingSectionsApi.reducerPath]: speakingSectionsApi.reducer,
    [writingQuestionsApi.reducerPath]: writingQuestionsApi.reducer,
    [writingSectionsApi.reducerPath]: writingSectionsApi.reducer,
    [readingQuestionsApi.reducerPath]: readingQuestionsApi.reducer,
    [readingSectionsApi.reducerPath]: readingSectionsApi.reducer,
    [submittedReadingTestsApi.reducerPath]: submittedReadingTestsApi.reducer,
    [submittedSpeakingTestsApi.reducerPath]: submittedSpeakingTestsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [writingSubmissionsApi.reducerPath]: writingSubmissionsApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    [pteListeningQuestionApi.reducerPath]: pteListeningQuestionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      listeningTestsApi.middleware,
      questionsApi.middleware,
      sectionsApi.middleware,
      readingTestsApi.middleware,
      writingTestsApi.middleware,
      speakingTestsApi.middleware,
      speakingSectionsApi.middleware,
      writingQuestionsApi.middleware,
      writingSectionsApi.middleware,
      readingQuestionsApi.middleware,
      readingSectionsApi.middleware,
      submittedReadingTestsApi.middleware,
      submittedSpeakingTestsApi.middleware,
      dashboardApi.middleware,
      writingSubmissionsApi.middleware,
      searchApi.middleware,
      pteListeningQuestionApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 