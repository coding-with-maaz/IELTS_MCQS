import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSubmissionQuery, Question, Section, SubmittedTest } from "@/store/api/listeningTestsApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Clock, Calendar, CheckCircle, Award, FileText } from "lucide-react";
import { format, isValid } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Test {
  _id: string;
  title: string;
  type: 'academic' | 'general';
  sections: Section[];
}

interface Answer {
  questionId: string;
  answer: string;
}

interface Submission {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  test: Test;
  answers: Answer[];
  status: 'pending' | 'graded';
  grade?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: {
    _id: string;
    name: string;
  };
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isValid(date) ? format(date, 'MMMM d, yyyy, h:mm a') : 'N/A';
};

function SubmissionDetails() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    data: submission,
    isLoading,
    error,
    refetch
  } = useGetSubmissionQuery(submissionId || '', {
    skip: !submissionId
  });

  React.useEffect(() => {
    if (error) {
      console.error('Submission fetch error:', error);
      toast({
        title: "Error loading submission",
        description: "Failed to load submission details. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!submission || !submission._id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg mb-4">Submission not found</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Profile
                </Button>
                <Button 
                  onClick={() => refetch()}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4" />
                  Retry Loading
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>
        <Badge variant={submission.status === 'graded' ? 'success' : 'warning'}>
          {submission.status === 'graded' ? (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>Graded</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Pending Review</span>
            </div>
          )}
        </Badge>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{submission.test?.title || 'Untitled Test'}</CardTitle>
              <CardDescription className="mt-2">
                <span className="capitalize">{submission.test?.type || 'Unknown'}</span> Test
              </CardDescription>
            </div>
            {submission.status === 'graded' && submission.grade !== null && (
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold">{submission.grade}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Submitted On</label>
                <p className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(submission.submittedAt)}
                </p>
              </div>
              {submission.status === 'graded' && submission.gradedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Graded On</label>
                  <p className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(submission.gradedAt)}
                  </p>
                </div>
              )}
            </div>
            {submission.status === 'graded' && submission.gradedBy && (
              <div>
                <label className="text-sm font-medium text-gray-500">Graded By</label>
                <p className="text-lg">{submission.gradedBy.name}</p>
              </div>
            )}
          </div>

          {submission.status === 'graded' && submission.feedback && submission.feedback.trim() !== '' && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-lg font-semibold mb-3">Feedback</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              </div>
            </>
          )}

          {submission.status === 'pending' && (
            <>
              <Separator className="my-6" />
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <Clock className="h-5 w-5" />
                  <p className="text-sm">
                    Your submission is currently being reviewed by our examiners. 
                    This process typically takes 24-48 hours. You will be notified 
                    once your test has been graded.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answers</CardTitle>
          <CardDescription>Your submitted answers for this test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {submission.test?.sections.map((section, sectionIndex) => (
              <div key={section._id} className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold">Section {sectionIndex + 1}: {section.sectionName}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  )}
                </div>
                <div className="space-y-6 pl-4">
                  {section.questions.map((question, questionIndex) => {
                    const answer = submission.answers?.find(a => a.questionId === question._id);
                    if (!answer) return null;
                    
                    return (
                      <div key={question._id} className="space-y-2">
                        <div className="font-medium">Question {questionIndex + 1}</div>
                        <div className="text-gray-600">{question.questionText}</div>
                        <div className="text-gray-700">Your Answer: {answer.answer}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { SubmissionDetails };
export default SubmissionDetails; 