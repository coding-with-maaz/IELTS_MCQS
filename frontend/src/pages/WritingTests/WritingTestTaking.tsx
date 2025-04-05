import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Clock, AlertCircle } from 'lucide-react';
import { useGetWritingTestQuery } from '@/store/api/writingTestsApi';
import { useSubmitWritingTestMutation } from '@/store/api/writingSubmissionsApi';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function WritingTestTaking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if id is undefined
  useEffect(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid test ID. Redirecting to writing tests.",
        variant: "destructive",
      });
      navigate('/tests/writing');
      return;
    }
  }, [id, navigate, toast]);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<{ task1: string; task2: string }>({
    task1: '',
    task2: ''
  });
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const { data: test, isLoading, error } = useGetWritingTestQuery(id || '');
  const [submitTest, { isLoading: isSubmitting }] = useSubmitWritingTestMutation();

  useEffect(() => {
    if (test) {
      setTimeLeft(test.timeLimit * 60); // Convert minutes to seconds
      setStartTime(Date.now());
    }
  }, [test]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (task: 'task1' | 'task2', value: string) => {
    setAnswers(prev => ({
      ...prev,
      [task]: value
    }));
  };

  const validateAnswers = () => {
    if (!answers.task1.trim() || !answers.task2.trim()) {
      toast({
        title: "Error",
        description: "Please complete both tasks before submitting.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!test || !id) return;

    if (!validateAnswers()) {
      return;
    }

    try {
      const completionTime = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      
      await submitTest({
        testId: id,
        data: {
          answers: {
            task1: answers.task1.trim(),
            task2: answers.task2.trim()
          },
          completionTime
        }
      }).unwrap();

      toast({
        title: "Success",
        description: "Test submitted successfully",
      });

      navigate('/tests/writing');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  if (!id) {
    return null; // Early return as useEffect will handle the navigation
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
              <p>Failed to load test</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{test.testName}</h1>
          <p className="text-muted-foreground">
            Time Remaining: {formatTime(timeLeft)}
          </p>
        </div>
        <Button variant="outline" onClick={handleExit}>
          Exit Test
        </Button>
      </div>

      <div className="space-y-8">
        {test.sections?.map((section, index) => (
          <Card key={section._id}>
            <CardHeader>
              <CardTitle>Task {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {section.instructions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Time: {section.timeLimit} minutes
                </div>
                <Textarea
                  value={answers[`task${index + 1}` as 'task1' | 'task2']}
                  onChange={(e) => handleAnswerChange(`task${index + 1}` as 'task1' | 'task2', e.target.value)}
                  placeholder={`Write your answer for Task ${index + 1} here...`}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !answers.task1.trim() || !answers.task2.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Test'
          )}
        </Button>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/tests/writing')}>
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 