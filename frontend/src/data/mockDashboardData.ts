
// Mock tests data
export const mockTests = [
  {
    id: 'test1',
    testName: 'Academic Listening Test 1',
    testType: 'academic',
    totalQuestions: 40,
    duration: 30,
    sectionsCount: 4,
    createdAt: '2023-08-15T10:30:00Z',
    status: 'active'
  },
  {
    id: 'test2',
    testName: 'General Listening Test 1',
    testType: 'general',
    totalQuestions: 40,
    duration: 30,
    sectionsCount: 4,
    createdAt: '2023-09-05T14:20:00Z',
    status: 'active'
  },
  {
    id: 'test3',
    testName: 'Academic Listening Test 2',
    testType: 'academic',
    totalQuestions: 40,
    duration: 30,
    sectionsCount: 4,
    createdAt: '2023-10-12T09:45:00Z',
    status: 'draft'
  },
  {
    id: 'test4',
    testName: 'General Listening Test 2',
    testType: 'general',
    totalQuestions: 40,
    duration: 30,
    sectionsCount: 4,
    createdAt: '2023-11-03T16:15:00Z',
    status: 'active'
  }
];

// Mock submissions data
export const mockSubmissions = [
  {
    id: 'sub1',
    userId: 'user1',
    userName: 'Emily Johnson',
    testId: 'test1',
    testName: 'Academic Listening Test 1',
    submittedAt: '2023-10-15T11:45:00Z',
    grade: 7.5,
    status: 'graded',
    completionTime: 28
  },
  {
    id: 'sub2',
    userId: 'user2',
    userName: 'Michael Chen',
    testId: 'test2',
    testName: 'General Listening Test 1',
    submittedAt: '2023-10-16T09:30:00Z',
    grade: null,
    status: 'pending',
    completionTime: 30
  },
  {
    id: 'sub3',
    userId: 'user3',
    userName: 'Sarah Ahmed',
    testId: 'test1',
    testName: 'Academic Listening Test 1',
    submittedAt: '2023-10-17T14:20:00Z',
    grade: 8.0,
    status: 'graded',
    completionTime: 25
  },
  {
    id: 'sub4',
    userId: 'user4',
    userName: 'David Wilson',
    testId: 'test4',
    testName: 'General Listening Test 2',
    submittedAt: '2023-10-18T10:15:00Z',
    grade: null,
    status: 'pending',
    completionTime: 29
  },
  {
    id: 'sub5',
    userId: 'user5',
    userName: 'Lisa Park',
    testId: 'test2',
    testName: 'General Listening Test 1',
    submittedAt: '2023-10-19T08:45:00Z',
    grade: 6.5,
    status: 'graded',
    completionTime: 30
  }
];

// Mock users data
export const mockUsers = [
  {
    id: 'user1',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    role: 'user',
    testsCompleted: 5,
    averageScore: 7.5,
    joinedAt: '2023-05-15T00:00:00Z'
  },
  {
    id: 'user2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'user',
    testsCompleted: 3,
    averageScore: 6.0,
    joinedAt: '2023-06-22T00:00:00Z'
  },
  {
    id: 'user3',
    name: 'Sarah Ahmed',
    email: 'sarah.ahmed@example.com',
    role: 'user',
    testsCompleted: 7,
    averageScore: 8.0,
    joinedAt: '2023-04-10T00:00:00Z'
  },
  {
    id: 'user4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    role: 'user',
    testsCompleted: 2,
    averageScore: 5.5,
    joinedAt: '2023-09-05T00:00:00Z'
  },
  {
    id: 'user5',
    name: 'Lisa Park',
    email: 'lisa.park@example.com',
    role: 'admin',
    testsCompleted: 0,
    averageScore: 0,
    joinedAt: '2023-03-18T00:00:00Z'
  }
];

// Stats data
export const dashboardStats = {
  totalTests: 4,
  totalSubmissions: 24,
  pendingGrading: 8,
  activeUsers: 127,
  averageScore: 6.8,
  completionRate: 85
};

// Recent activities
export const recentActivities = [
  {
    id: 'act1',
    type: 'submission',
    user: 'David Wilson',
    action: 'submitted',
    target: 'General Listening Test 2',
    timestamp: '2023-10-18T10:15:00Z'
  },
  {
    id: 'act2',
    type: 'grading',
    user: 'Admin',
    action: 'graded',
    target: 'Sarah Ahmed\'s submission',
    timestamp: '2023-10-17T16:30:00Z'
  },
  {
    id: 'act3',
    type: 'test',
    user: 'Admin',
    action: 'created',
    target: 'Academic Listening Test 3',
    timestamp: '2023-10-15T09:45:00Z'
  },
  {
    id: 'act4',
    type: 'user',
    user: 'John Smith',
    action: 'registered',
    target: '',
    timestamp: '2023-10-14T14:20:00Z'
  },
  {
    id: 'act5',
    type: 'submission',
    user: 'Emily Johnson',
    action: 'submitted',
    target: 'Academic Listening Test 1',
    timestamp: '2023-10-14T11:45:00Z'
  }
];
