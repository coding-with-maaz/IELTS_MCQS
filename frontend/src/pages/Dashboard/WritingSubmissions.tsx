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
  useGradeSubmissionMutation,
  GradeWritingSubmissionRequest 
} from '@/store/api/writingSubmissionsApi';
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

export default function WritingSubmissions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  
  // Writing scoring criteria state
  const [taskAchievement, setTaskAchievement] = useState<string>('');
  const [coherenceAndCohesion, setCoherenceAndCohesion] = useState<string>('');
  const [lexicalResource, setLexicalResource] = useState<string>('');
  const [grammaticalRange, setGrammaticalRange] = useState<string>('');
  const [overallBandScore, setOverallBandScore] = useState<string>('');
  const [task1Feedback, setTask1Feedback] = useState<string>('');
  const [task2Feedback, setTask2Feedback] = useState<string>('');
  
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
    if (!selectedSubmission || 
        !taskAchievement || 
        !coherenceAndCohesion || 
        !lexicalResource || 
        !grammaticalRange || 
        !overallBandScore || 
        !task1Feedback || 
        !task2Feedback) {
      return;
    }

    try {
      const gradeData: GradeWritingSubmissionRequest = {
        grades: {
          taskAchievement: parseFloat(taskAchievement),
          coherenceAndCohesion: parseFloat(coherenceAndCohesion),
          lexicalResource: parseFloat(lexicalResource),
          grammaticalRangeAndAccuracy: parseFloat(grammaticalRange)
        },
        feedback: {
          task1: task1Feedback,
          task2: task2Feedback
        },
        overallBandScore: parseFloat(overallBandScore)
      };

      await gradeSubmission({
        submissionId: selectedSubmission,
        data: gradeData
      }).unwrap();

      toast({
        title: "Success",
        description: "Submission graded successfully",
      });

      // Reset form
      setSelectedSubmission(null);
      setTaskAchievement('');
      setCoherenceAndCohesion('');
      setLexicalResource('');
      setGrammaticalRange('');
      setOverallBandScore('');
      setTask1Feedback('');
      setTask2Feedback('');
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
    <DashboardLayout title="Writing Submissions">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Writing Test Submissions</h2>
          <p className="text-sm text-muted-foreground">
            Review and grade submitted writing tests.
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
          <CardTitle>Writing Submissions ({filteredSubmissions.length})</CardTitle>
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
                    <div>{submission.overallBandScore != null ? `Band ${submission.overallBandScore.toFixed(1)}` : 'Not graded'}</div>
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
                        onClick={() => navigate(`/writing-submissions/${submission._id}`)}
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
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Grade Writing Submission</DialogTitle>
                              <DialogDescription>
                                Provide detailed assessment for this writing test submission.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="taskAchievement">Task Achievement (0-9)</Label>
                                  <Input
                                    id="taskAchievement"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={taskAchievement}
                                    onChange={(e) => setTaskAchievement(e.target.value)}
                                    placeholder="Task Achievement score"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="coherenceAndCohesion">Coherence & Cohesion (0-9)</Label>
                                  <Input
                                    id="coherenceAndCohesion"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={coherenceAndCohesion}
                                    onChange={(e) => setCoherenceAndCohesion(e.target.value)}
                                    placeholder="Coherence & Cohesion score"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="lexicalResource">Lexical Resource (0-9)</Label>
                                  <Input
                                    id="lexicalResource"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={lexicalResource}
                                    onChange={(e) => setLexicalResource(e.target.value)}
                                    placeholder="Lexical Resource score"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="grammaticalRange">Grammatical Range & Accuracy (0-9)</Label>
                                  <Input
                                    id="grammaticalRange"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={grammaticalRange}
                                    onChange={(e) => setGrammaticalRange(e.target.value)}
                                    placeholder="Grammatical Range & Accuracy score"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="overallBandScore">Overall Band Score (0-9)</Label>
                                <Input
                                  id="overallBandScore"
                                  type="number"
                                  min="0"
                                  max="9"
                                  step="0.5"
                                  value={overallBandScore}
                                  onChange={(e) => setOverallBandScore(e.target.value)}
                                  placeholder="Overall Band Score"
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="task1Feedback">Task 1 Feedback</Label>
                                <Textarea
                                  id="task1Feedback"
                                  value={task1Feedback}
                                  onChange={(e) => setTask1Feedback(e.target.value)}
                                  placeholder="Enter feedback for Task 1"
                                  rows={3}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="task2Feedback">Task 2 Feedback</Label>
                                <Textarea
                                  id="task2Feedback"
                                  value={task2Feedback}
                                  onChange={(e) => setTask2Feedback(e.target.value)}
                                  placeholder="Enter feedback for Task 2"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={handleGrade}
                                disabled={isGrading || 
                                  !taskAchievement || 
                                  !coherenceAndCohesion || 
                                  !lexicalResource || 
                                  !grammaticalRange || 
                                  !overallBandScore || 
                                  !task1Feedback || 
                                  !task2Feedback}
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
                    No writing submissions found.
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