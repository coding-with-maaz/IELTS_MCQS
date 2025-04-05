import { BarChart, Users, CheckSquare, Headphones, Clock, Award, BookOpen, PenTool, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { format, parseISO, isValid } from 'date-fns';
import { Outlet, useLocation } from 'react-router-dom';
import { useGetDashboardStatsQuery, useGetRecentActivityQuery, useGetRecentSubmissionsQuery } from '@/store/api/dashboardApi';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const location = useLocation();
  const isRootDashboard = location.pathname === '/dashboard';

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: activities, isLoading: activitiesLoading } = useGetRecentActivityQuery();
  const { data: submissions, isLoading: submissionsLoading } = useGetRecentSubmissionsQuery();

  // Function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Function to format time
  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'h:mm a') : 'Invalid Time';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  // Function to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case 'grading':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'test':
        return <Headphones className="h-4 w-4 text-purple-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Calculate totals
  const totalTests = stats ? 
    stats.totalTests.listening + stats.totalTests.reading + 
    stats.totalTests.writing + stats.totalTests.speaking +
    stats.totalTests.pteListening + stats.totalTests.pteReading +
    stats.totalTests.pteWriting + stats.totalTests.pteSpeaking : 0;

  const totalSubmissions = stats ?
    stats.totalSubmissions.listening + stats.totalSubmissions.reading +
    stats.totalSubmissions.writing + stats.totalSubmissions.speaking +
    stats.totalSubmissions.pteListening + stats.totalSubmissions.pteReading +
    stats.totalSubmissions.pteWriting + stats.totalSubmissions.pteSpeaking : 0;

  const totalPendingGrading = stats ?
    stats.pendingGrading.listening + stats.pendingGrading.reading +
    stats.pendingGrading.writing + stats.pendingGrading.speaking +
    stats.pendingGrading.pteListening + stats.pendingGrading.pteReading +
    stats.pendingGrading.pteWriting + stats.pendingGrading.pteSpeaking : 0;

  const averageScore = stats ?
    (stats.averageScore.listening + stats.averageScore.reading +
     stats.averageScore.writing + stats.averageScore.speaking +
     stats.averageScore.pteListening + stats.averageScore.pteReading +
     stats.averageScore.pteWriting + stats.averageScore.pteSpeaking) / 8 : 0;

  const completionRate = stats ?
    (stats.completionRate.listening + stats.completionRate.reading +
     stats.completionRate.writing + stats.completionRate.speaking +
     stats.completionRate.pteListening + stats.completionRate.pteReading +
     stats.completionRate.pteWriting + stats.completionRate.pteSpeaking) / 8 : 0;

  if (statsLoading || activitiesLoading || submissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout title={isRootDashboard ? "Dashboard Overview" : ""}>
      {isRootDashboard ? (
        <div className="grid gap-6 mb-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <Headphones className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTests}</div>
                <p className="text-xs text-muted-foreground">
                  IELTS & PTE tests available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  Tests completed by users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPendingGrading}</div>
                <p className="text-xs text-muted-foreground">
                  Submissions awaiting assessment
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users on the platform
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Overall test score average
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Users who complete tests fully
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Test Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Test Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ielts">
                <TabsList className="mb-4">
                  <TabsTrigger value="ielts">IELTS</TabsTrigger>
                  <TabsTrigger value="pte">PTE</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ielts">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Headphones className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Listening Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.listening || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reading Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.reading || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <PenTool className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Writing Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.writing || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Mic className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Speaking Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.speaking || 0}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pte">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Headphones className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Listening Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.pteListening || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reading Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.pteReading || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <PenTool className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Writing Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.pteWriting || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Mic className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Speaking Tests</p>
                        <p className="text-2xl font-bold">{stats?.totalTests?.pteSpeaking || 0}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {activities?.map((activity) => (
                  <div className="flex items-start" key={activity.id}>
                    <div className="mr-4 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                        {activity.target && <span className="font-medium">{activity.target}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="ielts">IELTS</TabsTrigger>
                  <TabsTrigger value="pte">PTE</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="space-y-4">
                    {submissions?.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            submission.testCategory === 'ielts' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {submission.testType === 'listening' && <Headphones className="h-5 w-5 text-blue-600" />}
                            {submission.testType === 'reading' && <BookOpen className="h-5 w-5 text-green-600" />}
                            {submission.testType === 'writing' && <PenTool className="h-5 w-5 text-purple-600" />}
                            {submission.testType === 'speaking' && <Mic className="h-5 w-5 text-orange-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{submission.userName}</p>
                            <p className="text-sm text-muted-foreground">{submission.testName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatDate(submission.submittedAt)}</p>
                          <p className={`text-sm ${
                            submission.status === 'graded' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {submission.status === 'graded' ? `Score: ${submission.grade}` : 'Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="ielts">
                  <div className="space-y-4">
                    {submissions?.filter(sub => sub.testCategory === 'ielts').map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            {submission.testType === 'listening' && <Headphones className="h-5 w-5 text-blue-600" />}
                            {submission.testType === 'reading' && <BookOpen className="h-5 w-5 text-green-600" />}
                            {submission.testType === 'writing' && <PenTool className="h-5 w-5 text-purple-600" />}
                            {submission.testType === 'speaking' && <Mic className="h-5 w-5 text-orange-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{submission.userName}</p>
                            <p className="text-sm text-muted-foreground">{submission.testName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatDate(submission.submittedAt)}</p>
                          <p className={`text-sm ${
                            submission.status === 'graded' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {submission.status === 'graded' ? `Score: ${submission.grade}` : 'Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="pte">
                  <div className="space-y-4">
                    {submissions?.filter(sub => sub.testCategory === 'pte').map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-2 rounded-full">
                            {submission.testType === 'listening' && <Headphones className="h-5 w-5 text-blue-600" />}
                            {submission.testType === 'reading' && <BookOpen className="h-5 w-5 text-green-600" />}
                            {submission.testType === 'writing' && <PenTool className="h-5 w-5 text-purple-600" />}
                            {submission.testType === 'speaking' && <Mic className="h-5 w-5 text-orange-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{submission.userName}</p>
                            <p className="text-sm text-muted-foreground">{submission.testName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{formatDate(submission.submittedAt)}</p>
                          <p className={`text-sm ${
                            submission.status === 'graded' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {submission.status === 'graded' ? `Score: ${submission.grade}` : 'Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Outlet />
      )}
    </DashboardLayout>
  );
}
