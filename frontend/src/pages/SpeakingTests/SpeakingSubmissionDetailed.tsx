import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetSubmissionQuery } from '@/store/api/submittedSpeakingTestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Play, Pause, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface AudioResponse {
  _id: string;
  section: {
    _id: string;
    sectionName: string;
    partType: string;
    instructions: string;
    timeLimit: number;
  };
  audioFile: {
    filename: string;
    path: string;
    mimetype: string;
  };
}

interface SubmittedSpeakingTest {
  _id: string;
  test: {
    _id: string;
    testName: string;
    testType: 'academic' | 'general';
    timeLimit: number;
    instructions: string;
  };
  audioResponses: AudioResponse[];
  status: 'pending' | 'graded';
  submittedAt: string;
  completionTime?: number;
  feedback?: {
    fluencyAndCoherence?: {
      score: number;
      comments: string;
    };
    lexicalResource?: {
      score: number;
      comments: string;
    };
    grammaticalRangeAndAccuracy?: {
      score: number;
      comments: string;
    };
    pronunciation?: {
      score: number;
      comments: string;
    };
  };
}

export default function SpeakingSubmissionDetailed() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: submission, isLoading, error } = useGetSubmissionQuery(id || '') as { data: SubmittedSpeakingTest | undefined, isLoading: boolean, error: any };
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMMM d, yyyy, h:mm a');
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async (responseId: string, filename: string) => {
    try {
      if (!audioRefs.current[responseId]) {
        // Create new audio element if it doesn't exist
        const token = localStorage.getItem('auth_token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://backend.abspak.com/api';
        const audioUrl = `${baseUrl}/submitted-speaking-tests/audio/${filename}`;
        
        // Create audio element with authentication header
        audioRefs.current[responseId] = new Audio(audioUrl);
        audioRefs.current[responseId].addEventListener('ended', () => {
          setCurrentlyPlaying(null);
        });
        audioRefs.current[responseId].addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          toast({
            title: "Error",
            description: "Failed to play audio. Please try again.",
            variant: "destructive",
          });
          setCurrentlyPlaying(null);
        });
      }

      // Handle play/pause
      if (currentlyPlaying === responseId) {
        audioRefs.current[responseId].pause();
        setCurrentlyPlaying(null);
      } else {
        // Stop any currently playing audio
        if (currentlyPlaying && audioRefs.current[currentlyPlaying]) {
          audioRefs.current[currentlyPlaying].pause();
        }
        try {
          await audioRefs.current[responseId].play();
          setCurrentlyPlaying(responseId);
        } catch (error) {
          console.error('Error playing audio:', error);
          toast({
            title: "Error",
            description: "Failed to play audio. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error handling audio:', error);
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Cleanup audio elements on unmount
  React.useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Submission</h2>
          <p className="text-gray-600 mb-4">
            Unable to load the submission details. Please try again later.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submissions
        </Button>
        <h1 className="text-3xl font-bold mb-2">{submission.test?.testName || 'Speaking Test Submission'}</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Submitted: {formatDate(submission.submittedAt)}</span>
        </div>
      </div>

      {/* Test Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Submission Status</CardTitle>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2",
              submission.status === 'graded' 
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            )}>
              {submission.status === 'graded' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Graded</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Pending Review</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Test Type</p>
              <p className="font-medium capitalize">{submission.test?.testType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Time</p>
              <p className="font-medium">{formatDuration(submission.completionTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Recordings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Recordings</CardTitle>
          <CardDescription>Listen to your submitted recordings for each part of the test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submission.audioResponses?.map((response, index) => {
              const isPlaying = currentlyPlaying === response._id;

              return (
                <div key={response._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Part {index + 1}</h3>
                    <p className="text-sm text-gray-500">
                      {response.section?.sectionName || `Section ${index + 1}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlayPause(response._id, response.audioFile.filename)}
                      className={cn(
                        "transition-colors",
                        isPlaying && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feedback and Scores */}
      {submission.status === 'graded' && submission.feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback & Scores</CardTitle>
            <CardDescription>Detailed evaluation of your speaking performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fluency & Coherence */}
              <div className="space-y-2">
                <h3 className="font-medium">Fluency & Coherence</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Score:</span>
                    <span className="font-bold">{submission.feedback.fluencyAndCoherence?.score || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{submission.feedback.fluencyAndCoherence?.comments || 'No comments provided'}</p>
                </div>
              </div>

              {/* Lexical Resource */}
              <div className="space-y-2">
                <h3 className="font-medium">Lexical Resource</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Score:</span>
                    <span className="font-bold">{submission.feedback.lexicalResource?.score || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{submission.feedback.lexicalResource?.comments || 'No comments provided'}</p>
                </div>
              </div>

              {/* Grammatical Range & Accuracy */}
              <div className="space-y-2">
                <h3 className="font-medium">Grammatical Range & Accuracy</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Score:</span>
                    <span className="font-bold">{submission.feedback.grammaticalRangeAndAccuracy?.score || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{submission.feedback.grammaticalRangeAndAccuracy?.comments || 'No comments provided'}</p>
                </div>
              </div>

              {/* Pronunciation */}
              <div className="space-y-2">
                <h3 className="font-medium">Pronunciation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Score:</span>
                    <span className="font-bold">{submission.feedback.pronunciation?.score || 'N/A'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{submission.feedback.pronunciation?.comments || 'No comments provided'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 