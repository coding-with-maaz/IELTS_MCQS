import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetListeningTestQuery, useSubmitTestMutation } from "@/store/api/listeningTestsApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Timer } from "lucide-react";
import AudioPlayer from "@/components/ui/audio-player";
// import PDFViewer from "@/components/ui/pdf-viewer";
import { cn } from "@/lib/utils";

export default function ListeningTestTaking() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { data: response, isLoading, error } = useGetListeningTestQuery(id!);
  const [submitTest] = useSubmitTestMutation();
  const test = response?.data?.test;

  // Initialize timer when test loads
  useEffect(() => {
    if (test) {
      setTimeLeft(test.duration * 60); // Convert minutes to seconds
    }
  }, [test]);

  // Timer countdown
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

  useEffect(() => {
    // Initialize answers for all questions
    if (test) {
      const initialAnswers: Record<string, string> = {};
      test.sectionsData.forEach(section => {
        section.questions.forEach(question => {
          initialAnswers[question._id] = "";
        });
      });
      setAnswers(initialAnswers);
    }
  }, [test]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Test</h2>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : "Failed to load the test. Please try again."}
        </p>
      </div>
    );
  }

  const currentSection = test.sectionsData[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / test.sectionsData.length) * 100;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Format answers for submission - only include answered questions
      const formattedAnswers = Object.entries(answers)
        .filter(([_, answer]) => answer.trim() !== "") // Only include non-empty answers
        .map(([questionId, answer]) => ({
          questionId,
          answer
        }));

      // Submit the test
      const result = await submitTest({
        testId: id!,
        answers: formattedAnswers
      }).unwrap();

      toast({
        title: "Success",
        description: "Your test has been submitted successfully.",
      });

      // Navigate to the dashboard or results page
      navigate('/tests/listening');

    } catch (err) {
      console.error('Submit error:', err);
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < test.sectionsData.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Timer */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b py-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{test.title}</h1>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              timeLeft <= 300 ? "bg-red-100 text-red-700" : "bg-gray-100"
            )}>
              <Timer className="h-4 w-4" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Audio Player */}
          {currentSection.audio && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Section {currentSectionIndex + 1} Audio</h3>
              <AudioPlayer
                audioUrl={currentSection.audio}
                onEnded={() => {
                  toast({
                    title: "Audio Completed",
                    description: "The audio for this section has finished playing.",
                  });
                }}
              />
            </div>
          )}

          {/* PDF Viewer */}
          {/* {currentSection.pdf && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Section {currentSectionIndex + 1} Materials</h3>
              <PDFViewer
                pdfUrl={currentSection.pdf}
                title={`Section ${currentSectionIndex + 1} PDF`}
              />
            </div>
          )} */}
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              Section {currentSectionIndex + 1} Questions
            </h3>
            <div className="space-y-6">
              {currentSection.questions.map((question, index) => (
                <div key={question._id} className="space-y-2">
                  <label className="block font-medium">
                    {index + 1}. {question.questionText}
                    {question.instructions && (
                      <span className="block text-sm text-gray-500 mt-1">
                        {question.instructions}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={answers[question._id] || ""}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your answer..."
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              onClick={handlePreviousSection}
              disabled={currentSectionIndex === 0}
              variant="outline"
            >
              Previous Section
            </Button>
            {currentSectionIndex === test.sectionsData.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Test"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextSection}
                disabled={currentSectionIndex === test.sectionsData.length - 1}
              >
                Next Section
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 