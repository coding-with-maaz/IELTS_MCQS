export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile?: {
    avatar?: string;
  };
}

export interface ListeningTest {
  id: string;
  testName: string;
  testType: 'academic' | 'general';
  sections: string[];
  totalQuestions: number;
  duration: number;
  instructions: string;
  answerSheet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  audio?: string;
  image?: string;
  pdf?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  section: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmittedTest {
  id: string;
  user: User;
  test: ListeningTest;
  answers: {
    questionId: string;
    answer: string;
  }[];
  grade: number | null;
  feedback: string;
  status: 'pending' | 'graded';
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
} 