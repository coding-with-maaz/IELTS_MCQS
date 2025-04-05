import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, AlertCircle } from 'lucide-react';
import { useGetWritingTestQuery } from '@/store/api/writingTestsApi';
import { Loader2 } from 'lucide-react';
import { format, isValid } from 'date-fns';

export default function WritingTestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useGetWritingTestQuery(id || '');

  // Add debugging logs
  console.log('Test ID:', id);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);
  console.log('Test data:', test);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Date not available';
    } catch {
      return 'Date not available';
    }
  };

  if (!id) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              <p>Invalid test ID</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              <p>Failed to load test details</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{test.testName}</h1>
        <p className="text-muted-foreground">
          IELTS Writing Test with {test.sections?.length || 0} tasks
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Time Limit: {test.timeLimit} minutes</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Number of Tasks: {test.sections?.length || 0}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Created on {formatDate(test.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {test.sections?.map((section) => (
                <div key={section._id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium">{section.sectionName}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {section.instructions}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Time: {section.timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>Word Limit: {section.wordLimit || 'No limit'}</span>
                    </div>
                  </div>
                  {section.taskType && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Task Type: {section.taskType}
                    </div>
                  )}
                </div>
              ))}
              {(!test.sections || test.sections.length === 0) && (
                <p className="text-muted-foreground">No sections available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate('/tests/writing')}>
          Back to Tests
        </Button>
        <Button onClick={() => navigate(`/tests/writing/${id}/take`)}>
          Start Test
        </Button>
      </div>
    </div>
  );
} 