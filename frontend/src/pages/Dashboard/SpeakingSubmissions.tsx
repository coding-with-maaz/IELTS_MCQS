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
  Loader2,
  Play
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { 
  useGetAllSubmissionsQuery, 
  useGradeSubmissionMutation,
  GradeSpeakingSubmissionRequest 
} from '@/store/api/submittedSpeakingTestsApi';
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

interface SubmittedSpeakingTest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  test: {
    _id: string;
    testName: string;
    testType: 'academic' | 'general';
  };
  audioResponses: Array<{
    _id: string;
    audioFile: {
      filename: string;
      path: string;
      mimetype: string;
      url?: string;
    };
  }>;
  status: 'pending' | 'graded';
  isGraded: boolean;
  submittedAt: string;
  createdAt: string;
  totalScore?: number;
  feedback?: {
    fluencyAndCoherence: {
      score: number;
      comments: string;
    };
    lexicalResource: {
      score: number;
      comments: string;
    };
    grammaticalRangeAndAccuracy: {
      score: number;
      comments: string;
    };
    pronunciation: {
      score: number;
      comments: string;
    };
  };
}

export default function SpeakingSubmissions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Speaking scoring criteria state
  const [fluencyAndCoherenceScore, setFluencyAndCoherenceScore] = useState<string>('');
  const [fluencyAndCoherenceComments, setFluencyAndCoherenceComments] = useState<string>('');
  const [lexicalResourceScore, setLexicalResourceScore] = useState<string>('');
  const [lexicalResourceComments, setLexicalResourceComments] = useState<string>('');
  const [grammaticalRangeScore, setGrammaticalRangeScore] = useState<string>('');
  const [grammaticalRangeComments, setGrammaticalRangeComments] = useState<string>('');
  const [pronunciationScore, setPronunciationScore] = useState<string>('');
  const [pronunciationComments, setPronunciationComments] = useState<string>('');
  const [overallBandScore, setOverallBandScore] = useState<string>('');
  
  const { data: submissions = [], isLoading, refetch } = useGetAllSubmissionsQuery();
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();
  
  // Filter submissions based on the current filter
  const filteredSubmissions = submissions
    .filter(submission => {
      if (statusFilter === 'all') return true;
      const isSubmissionGraded = submission.isGraded || submission.status === 'graded';
      return statusFilter === (isSubmissionGraded ? 'graded' : 'pending');
    })
    .filter(submission => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (submission.user?.name?.toLowerCase() || '').includes(query) || 
        (submission.test?.testName?.toLowerCase() || '').includes(query)
      );
    });

  const resetForm = () => {
    setSelectedSubmission(null);
    setFluencyAndCoherenceScore('');
    setFluencyAndCoherenceComments('');
    setLexicalResourceScore('');
    setLexicalResourceComments('');
    setGrammaticalRangeScore('');
    setGrammaticalRangeComments('');
    setPronunciationScore('');
    setPronunciationComments('');
    setOverallBandScore('');
    setDialogOpen(false);
  };

  const handleGrade = async () => {
    if (!selectedSubmission || 
        !fluencyAndCoherenceScore || 
        !lexicalResourceScore || 
        !grammaticalRangeScore || 
        !pronunciationScore || 
        !overallBandScore) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const gradeData: GradeSpeakingSubmissionRequest = {
        grade: parseFloat(overallBandScore),
        feedback: {
          fluencyAndCoherence: {
            score: parseFloat(fluencyAndCoherenceScore),
            comments: fluencyAndCoherenceComments
          },
          lexicalResource: {
            score: parseFloat(lexicalResourceScore),
            comments: lexicalResourceComments
          },
          grammaticalRangeAndAccuracy: {
            score: parseFloat(grammaticalRangeScore),
            comments: grammaticalRangeComments
          },
          pronunciation: {
            score: parseFloat(pronunciationScore),
            comments: pronunciationComments
          }
        }
      };

      await gradeSubmission({
        submissionId: selectedSubmission,
        data: gradeData
      }).unwrap();

      toast({
        title: "Success",
        description: "Speaking test graded successfully",
      });

      // Reset form and refresh data
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Grading error:', error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to grade submission. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DashboardLayout title="Speaking Submissions">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Speaking Test Submissions</h2>
          <p className="text-sm text-muted-foreground">
            Review and grade submitted speaking tests.
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
          <CardTitle>Speaking Submissions ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-7 p-4 text-sm font-medium">
                <div>User</div>
                <div>Test</div>
                <div>Submission Date</div>
                <div>Score</div>
                <div>Status</div>
                <div>Audio</div>
                <div>Actions</div>
              </div>
              <div className="divide-y divide-border rounded-md border-t">
                {filteredSubmissions.map((submission) => (
                  <div className="grid grid-cols-7 items-center p-4 text-sm" key={submission._id}>
                    <div>{submission.user?.name || 'Unknown User'}</div>
                    <div className="truncate max-w-[200px]">{submission.test?.testName || 'Unknown Test'}</div>
                    <div>{format(parseISO(submission.submittedAt || submission.createdAt), 'MMM dd, yyyy')}</div>
                    <div>{submission.totalScore != null ? `Band ${submission.totalScore.toFixed(1)}` : 'Not graded'}</div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        submission.isGraded || submission.status === 'graded'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.isGraded || submission.status === 'graded' ? (
                          <><CheckCircle2 className="mr-1 h-3 w-3" /> Graded</>
                        ) : (
                          <><XCircle className="mr-1 h-3 w-3" /> Pending</>
                        )}
                      </span>
                    </div>
                    <div>
                      {submission.audioResponses?.map((response, index) => (
                        response.audioFile?.url && (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => window.open(response.audioFile?.url, '_blank')}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/speaking-submissions/${submission._id}`)}
                      >
                        <Eye className="mr-1 h-3 w-3" /> View
                      </Button>
                      {!submission.isGraded && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission._id);
                                setDialogOpen(true);
                              }}
                            >
                              Grade
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Grade Speaking Submission</DialogTitle>
                              <DialogDescription>
                                Provide detailed assessment for this speaking test submission.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="fluencyScore">Fluency & Coherence (0-9)</Label>
                                  <Input
                                    id="fluencyScore"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={fluencyAndCoherenceScore}
                                    onChange={(e) => setFluencyAndCoherenceScore(e.target.value)}
                                    placeholder="Score"
                                  />
                                  <Textarea
                                    placeholder="Comments on fluency and coherence"
                                    value={fluencyAndCoherenceComments}
                                    onChange={(e) => setFluencyAndCoherenceComments(e.target.value)}
                                    rows={2}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="lexicalScore">Lexical Resource (0-9)</Label>
                                  <Input
                                    id="lexicalScore"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={lexicalResourceScore}
                                    onChange={(e) => setLexicalResourceScore(e.target.value)}
                                    placeholder="Score"
                                  />
                                  <Textarea
                                    placeholder="Comments on vocabulary usage"
                                    value={lexicalResourceComments}
                                    onChange={(e) => setLexicalResourceComments(e.target.value)}
                                    rows={2}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="grammarScore">Grammatical Range & Accuracy (0-9)</Label>
                                  <Input
                                    id="grammarScore"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={grammaticalRangeScore}
                                    onChange={(e) => setGrammaticalRangeScore(e.target.value)}
                                    placeholder="Score"
                                  />
                                  <Textarea
                                    placeholder="Comments on grammar usage"
                                    value={grammaticalRangeComments}
                                    onChange={(e) => setGrammaticalRangeComments(e.target.value)}
                                    rows={2}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="pronunciationScore">Pronunciation (0-9)</Label>
                                  <Input
                                    id="pronunciationScore"
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={pronunciationScore}
                                    onChange={(e) => setPronunciationScore(e.target.value)}
                                    placeholder="Score"
                                  />
                                  <Textarea
                                    placeholder="Comments on pronunciation"
                                    value={pronunciationComments}
                                    onChange={(e) => setPronunciationComments(e.target.value)}
                                    rows={2}
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
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={handleGrade}
                                disabled={isGrading || 
                                  !fluencyAndCoherenceScore || 
                                  !lexicalResourceScore || 
                                  !grammaticalRangeScore || 
                                  !pronunciationScore || 
                                  !overallBandScore}
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
                    No speaking submissions found.
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