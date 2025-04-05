
import { createFormDataWithFiles } from '@/utils/fileUtils';

// API Base URL - in a real app, you'd use environment variables
const API_BASE_URL = 'http://backend.abspak.com/api';

// Types
export interface Test {
  id: string;
  testName: string;
  testType: 'academic' | 'general';
  sections: string[];
  totalQuestions: number;
  duration: number;
  instructions: string;
  answerSheetPDF?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  sectionName: string;
  audio: string;
  image?: string;
  pdf?: string;
  questions: string[];
}

export interface Question {
  id: string;
  questionText: string;
  answerType: string;
  options?: string[];
  correctAnswer: string;
  instructions?: string;
}

export interface Submission {
  id: string;
  user: string;
  test: string;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
}

// API Endpoints
export const API = {
  // Tests
  tests: {
    getAll: () => `${API_BASE_URL}/listening-tests`,
    getById: (id: string) => `${API_BASE_URL}/listening-tests/${id}`,
    create: () => `${API_BASE_URL}/listening-tests`,
    update: (id: string) => `${API_BASE_URL}/listening-tests/${id}`,
    delete: (id: string) => `${API_BASE_URL}/listening-tests/${id}`,
  },
  
  // Sections
  sections: {
    getAll: () => `${API_BASE_URL}/sections`,
    getById: (id: string) => `${API_BASE_URL}/sections/${id}`,
    create: () => `${API_BASE_URL}/sections`,
    update: (id: string) => `${API_BASE_URL}/sections/${id}`,
    delete: (id: string) => `${API_BASE_URL}/sections/${id}`,
  },
  
  // Questions
  questions: {
    getAll: () => `${API_BASE_URL}/questions`,
    getById: (id: string) => `${API_BASE_URL}/questions/${id}`,
    create: () => `${API_BASE_URL}/questions`,
    update: (id: string) => `${API_BASE_URL}/questions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/questions/${id}`,
  },
  
  // Submissions
  submissions: {
    getAll: () => `${API_BASE_URL}/submitted-listening-tests`,
    getById: (id: string) => `${API_BASE_URL}/submitted-listening-tests/${id}`,
    getUserSubmissions: () => `${API_BASE_URL}/submitted-listening-tests/my-submissions`,
    submit: () => `${API_BASE_URL}/submitted-listening-tests/submit`,
    grade: (id: string) => `${API_BASE_URL}/admin/submissions/listening/${id}/grade`,
    getPending: () => `${API_BASE_URL}/admin/submissions/pending`,
    getStats: () => `${API_BASE_URL}/admin/submissions/stats`,
  },
};

// Helper function to create tests with file upload
export const createTest = async (
  testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>,
  answerSheetFile?: File
) => {
  const formData = createFormDataWithFiles(
    { answerSheet: answerSheetFile || null },
    testData
  );
  
  const response = await fetch(API.tests.create(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create test');
  }
  
  return response.json();
};

// Helper function to create sections with file uploads
export const createSection = async (
  sectionData: {
    sectionName: string;
    questions: string[];
  },
  files: {
    audio?: File;
    image?: File;
    pdf?: File;
  }
) => {
  const formData = createFormDataWithFiles(files, sectionData);
  
  const response = await fetch(API.sections.create(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create section');
  }
  
  return response.json();
};
