
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Types matching the backend models
export interface UserProfile {
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
  submittedListeningTests?: SubmittedTest[];
  submittedReadingTests?: SubmittedTest[];
  submittedWritingTests?: SubmittedTest[];
}

export interface SubmittedTest {
  id: string;
  test: {
    id: string;
    testName: string;
  };
  grade?: number;
  bandScore?: number;
  overallBandScore?: number;
  status: 'pending' | 'graded';
  submittedAt: string;
  gradedAt?: string;
}

export interface UserStats {
  listening: {
    totalTests: number;
    gradedTests: number;
    pendingTests: number;
    averageGrade: number;
  };
  reading: {
    totalTests: number;
    gradedTests: number;
    pendingTests: number;
    averageBandScore: number;
  };
  writing: {
    totalTests: number;
    gradedTests: number;
    pendingTests: number;
    averageBandScore: number;
  };
}

export interface UserActivity {
  type: 'listening' | 'reading' | 'writing';
  test: {
    id: string;
    testName: string;
  };
  grade?: number;
  bandScore?: number;
  overallBandScore?: number;
  status: 'pending' | 'graded';
  submittedAt: string;
  gradedAt?: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  profile?: {
    phoneNumber?: string;
    country?: string;
    targetBand?: number;
    nativeLanguage?: string;
    bio?: string;
    avatar?: string;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// API functions
const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch('/api/users/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  
  return response.json();
};

const fetchUserStats = async (): Promise<UserStats> => {
  const response = await fetch('/api/users/stats', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user statistics');
  }
  
  return response.json();
};

const fetchUserActivity = async (): Promise<UserActivity[]> => {
  const response = await fetch('/api/users/activity', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user activity');
  }
  
  return response.json();
};

const updateUserProfile = async (data: ProfileUpdateData): Promise<{message: string; user: UserProfile}> => {
  const response = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile');
  }
  
  return response.json();
};

const changePassword = async (data: PasswordChangeData): Promise<{message: string}> => {
  const response = await fetch('/api/users/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to change password');
  }
  
  return response.json();
};

// Hooks
export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats,
  });
}

export function useUserActivity() {
  return useQuery({
    queryKey: ['userActivity'],
    queryFn: fetchUserActivity,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast({
        title: "Success",
        description: data.message || "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Password changed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });
}
