export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile: {
    testType: 'IELTS' | 'PTE';
    phoneNumber?: string;
    country?: string;
    targetBand?: number;
    nativeLanguage?: string;
    bio?: string;
    avatar?: {
      url: string;
      publicId?: string;
    };
  };
  createdAt?: Date;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  testType: 'IELTS' | 'PTE';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
} 