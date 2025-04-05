import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Clock,
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useGetReadingTestQuery } from '@/store/api/readingTestsApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ReadingTestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const { data: test, isLoading, error } = useGetReadingTestQuery(id || '');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-red-500">Error loading test. Please try again later.</p>
        </div>
      </div>
    );
  }

  const handleStartTest = () => {
    navigate(`/tests/reading/${id}/take`);
  };

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/tests/reading')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
      </Button>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{test.testName}</h1>
          <p className="text-muted-foreground">
            {test.testType === 'academic' 
              ? 'Academic Reading Test' 
              : 'General Training Reading Test'}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${test.testType === 'academic' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Test Type</h3>
                  <p className="text-sm text-muted-foreground capitalize">{test.testType}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-gray-100 text-gray-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Duration</h3>
                  <p className="text-sm text-muted-foreground">{test.timeLimit} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-gray-100 text-gray-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {test.sections.reduce((total, section) => total + section.questions.length, 0)} questions across {test.sections.length} sections
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={() => setShowStartDialog(true)}
          >
            Start Test
          </Button>
        </div>
      </div>

      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you ready to start?</AlertDialogTitle>
            <AlertDialogDescription className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p>Before you begin, please note:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>You will have {test.timeLimit} minutes to complete the test</li>
                  <li>You cannot pause or restart the test once started</li>
                  <li>Make sure you are in a quiet environment</li>
                  <li>Ensure you have a stable internet connection</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartTest}>
              Start Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 