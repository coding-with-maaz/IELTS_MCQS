import { useState } from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { 
  useGetAllSubmissionsQuery, 
  useGradeSubmissionMutation 
} from '@/store/api/submittedReadingTestsApi';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ReadingSubmissions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [bandScore, setBandScore] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  
  const { data: submissions = [], isLoading } = useGetAllSubmissionsQuery();
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();
  
  // Filter submissions based on the current filter
  const filteredSubmissions = submissions
    .filter(submission => {
      if (statusFilter === 'all') return true;
      return submission.status === statusFilter;
    })
    .filter(submission => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (submission.user?.name?.toLowerCase() || '').includes(query) || 
        (submission.test?.testName?.toLowerCase() || '').includes(query)
      );
    });

  const handleGrade = async () => {
    if (!selectedSubmission || !bandScore || !feedback) return;

    try {
      await gradeSubmission({
        submissionId: selectedSubmission,
        bandScore: parseFloat(bandScore),
        feedback
      }).unwrap();

      toast({
        title: "Success",
        description: "Submission graded successfully",
      });

      // Reset form
      setSelectedSubmission(null);
      setBandScore('');
      setFeedback('');
    } catch (error) {
      console.error('Grading error:', error);
      toast({
        title: "Error",
        description: "Failed to grade submission. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DashboardLayout title="Reading Submissions">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reading Test Submissions</h2>
          <p className="text-sm text-muted-foreground">
            Review and grade submitted reading tests.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Data
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === 'graded' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('graded')}
              >
                Graded
              </Button>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reading Submissions ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-6 p-4 text-sm font-medium">
                <div>User</div>
                <div>Test</div>
                <div>Submission Date</div>
                <div>Score</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              <div className="divide-y divide-border rounded-md border-t">
                {filteredSubmissions.map((submission) => (
                  <div className="grid grid-cols-6 items-center p-4 text-sm" key={submission._id}>
                    <div>{submission.user?.name || 'Unknown User'}</div>
                    <div className="truncate max-w-[200px]">{submission.test?.testName || 'Unknown Test'}</div>
                    <div>{format(parseISO(submission.submittedAt), 'MMM dd, yyyy')}</div>
                    <div>{submission.bandScore != null ? `Band ${submission.bandScore.toFixed(1)}` : 'Not graded'}</div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        submission.status === 'graded' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status === 'graded' ? (
                          <><CheckCircle2 className="mr-1 h-3 w-3" /> Graded</>
                        ) : (
                          <><XCircle className="mr-1 h-3 w-3" /> Pending</>
                        )}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/reading-submissions/${submission._id}`)}
                      >
                        <Eye className="mr-1 h-3 w-3" /> View
                      </Button>
                      {submission.status === 'pending' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => setSelectedSubmission(submission._id)}
                            >
                              Grade
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Grade Reading Submission</DialogTitle>
                              <DialogDescription>
                                Provide a grade and feedback for this reading test submission.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="bandScore">Band Score (1-9)</Label>
                                <Input
                                  id="bandScore"
                                  type="number"
                                  min="1"
                                  max="9"
                                  step="0.5"
                                  value={bandScore}
                                  onChange={(e) => setBandScore(e.target.value)}
                                  placeholder="Enter band score (e.g., 6.5)"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="feedback">Feedback</Label>
                                <Textarea
                                  id="feedback"
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Enter feedback"
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={handleGrade}
                                disabled={isGrading || !bandScore || !feedback}
                              >
                                {isGrading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Grading...
                                  </>
                                ) : (
                                  'Submit Grade'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))}
                {filteredSubmissions.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No reading submissions found.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 