import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mic, AlertCircle, StopCircle } from 'lucide-react';
import { useGetSpeakingTestQuery } from '@/store/api/speakingTestsApi';
import { useSubmitSpeakingTestMutation } from '@/store/api/submittedSpeakingTestsApi';
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

export default function SpeakingTestTaking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if id is undefined
  useEffect(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid test ID. Redirecting to speaking tests.",
        variant: "destructive",
      });
      navigate('/tests/speaking');
      return;
    }
  }, [id, navigate, toast]);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentPart, setCurrentPart] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ [key: string]: Blob }>({});
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const { data: test, isLoading, error } = useGetSpeakingTestQuery(id || '');
  const [submitTest, { isLoading: isSubmitting }] = useSubmitSpeakingTestMutation();

  useEffect(() => {
    if (test && test.sections && test.sections[currentPart]) {
      setTimeLeft(test.sections[currentPart].timeLimit * 60); // Convert minutes to seconds
      setStartTime(Date.now());
    }
  }, [test, currentPart]);

  useEffect(() => {
    if (timeLeft > 0 && isRecording) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, isRecording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordings(prev => ({
          ...prev,
          [`part${currentPart + 1}`]: blob
        }));
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleNextPart = () => {
    if (currentPart < (test?.sections?.length || 0) - 1) {
      setCurrentPart(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!test || !id) return;

    try {
      // Validate that all sections have recordings
      const missingRecordings = test.sections?.some((_, index) => !recordings[`part${index + 1}`]);
      if (missingRecordings) {
        toast({
          title: "Error",
          description: "Please complete all sections before submitting.",
          variant: "destructive",
        });
        return;
      }

      // Submit each section's recording separately
      for (let index = 0; index < test.sections.length; index++) {
        const section = test.sections[index];
        const recordingKey = `part${index + 1}`;
        const recording = recordings[recordingKey];
        
        if (recording) {
          const formData = new FormData();
          formData.append('testId', id);
          formData.append('sectionId', section._id);
          formData.append('audio', recording, `speaking-${section._id}-${Date.now()}.webm`);
          formData.append('completionTime', Math.floor((Date.now() - startTime) / 1000).toString());

          try {
            await submitTest(formData).unwrap();
          } catch (error: any) {
            console.error(`Error submitting section ${index + 1}:`, error);
            toast({
              title: "Error",
              description: `Failed to submit Part ${index + 1}. ${error.data?.message || "Please try again."}`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      // If all submissions were successful
      toast({
        title: "Success",
        description: "Test submitted successfully",
      });

      navigate('/tests/speaking');
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
    if (isRecording) {
      stopRecording();
    }
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

  const currentSection = test.sections?.[currentPart];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{test.testName}</h1>
          <p className="text-muted-foreground">
            Part {currentPart + 1} of {test.sections?.length} - Time Remaining: {formatTime(timeLeft)}
          </p>
        </div>
        <Button variant="outline" onClick={handleExit}>
          Exit Test
        </Button>
      </div>

      {currentSection && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Part {currentPart + 1}: {currentSection.sectionName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-lg">
                {currentSection.instructions}
              </div>

              <div className="flex items-center justify-center space-x-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={!!recordings[`part${currentPart + 1}`]}
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {recordings[`part${currentPart + 1}`] && (
                <div className="mt-4">
                  <audio
                    src={URL.createObjectURL(recordings[`part${currentPart + 1}`])}
                    controls
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex justify-end space-x-4">
        {currentPart < (test.sections?.length || 0) - 1 ? (
          <Button
            onClick={handleNextPart}
            disabled={!recordings[`part${currentPart + 1}`]}
          >
            Next Part
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !recordings[`part${currentPart + 1}`]}
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
        )}
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
            <AlertDialogAction onClick={() => navigate('/tests/speaking')}>
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 