import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock,
  Loader2,
  AlertCircle,
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import { useGetReadingTestQuery, useSubmitReadingTestMutation } from '@/store/api/readingTestsApi';
import { useToast } from '@/components/ui/use-toast';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

export default function ReadingTestTaking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [hasStartedReading, setHasStartedReading] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  
  const { data: test, isLoading, error } = useGetReadingTestQuery(id || '');
  const [submitTest] = useSubmitReadingTestMutation();

  useEffect(() => {
    if (test) {
      setTimeLeft(test.timeLimit * 60);
    }
  }, [test]);

  useEffect(() => {
    if (timeLeft > 0 && hasStartedReading) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, hasStartedReading]);

  const handleStartReading = () => {
    setHasStartedReading(true);
    setReadingStartTime(Date.now());
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Your test will be submitted automatically.",
      variant: "destructive",
    });
    handleSubmit();
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!test) return;

    try {
      await submitTest({
        testId: test._id,
        answers,
      }).unwrap();

      toast({
        title: "Test submitted",
        description: "Your reading test has been submitted successfully.",
      });
      navigate(`/tests/reading`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit the test. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentSectionData = test.sections[currentSection];

  const calculateProgress = () => {
    if (!test || !hasStartedReading) return 0;
    const totalQuestions = test.sections.reduce((acc, section) => acc + section.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const getQuestionStatus = (questionId: string) => {
    return answers[questionId] ? 'answered' : 'unanswered';
  };

  const renderAnswerInput = (question: any) => {
    const status = getQuestionStatus(question._id);
    
    return (
      <div className={`p-4 rounded-lg border ${status === 'answered' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={status === 'answered' ? 'success' : 'secondary'}>
            {status === 'answered' ? 'Answered' : 'Unanswered'}
          </Badge>
          {question.instructions && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <QuestionMarkCircledIcon className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{question.instructions}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="space-y-3">
          {(() => {
            switch (question.answerType) {
              case 'multiple-choice':
                return (
                  <RadioGroup
                    value={answers[question._id] || ''}
                    onValueChange={(value) => handleAnswerChange(question._id, value)}
                    className="space-y-2"
                  >
                    {Array.isArray(question.options) && question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={option} id={`${question._id}-${option}`} />
                        <Label htmlFor={`${question._id}-${option}`} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                );

              case 'true-false-not-given':
                return (
                  <RadioGroup
                    value={answers[question._id] || ''}
                    onValueChange={(value) => handleAnswerChange(question._id, value)}
                    className="grid grid-cols-3 gap-2"
                  >
                    {['true', 'false', 'not-given'].map((option) => (
                      <div key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={option} id={`${question._id}-${option}`} />
                        <Label htmlFor={`${question._id}-${option}`} className="cursor-pointer capitalize">
                          {option.replace('-', ' ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                );

              case 'short-answer':
                return (
                  <Input
                    value={answers[question._id] || ''}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    placeholder="Enter your answer"
                    className="max-w-xs"
                  />
                );

              case 'sentence-completion':
                return (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{question.questionText}</p>
                    <Input
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      placeholder="Complete the sentence"
                      className="max-w-md"
                    />
                  </div>
                );

              case 'notes-completion':
                return (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{question.questionText}</p>
                    <Textarea
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      placeholder="Complete the notes"
                      className="min-h-[100px]"
                    />
                  </div>
                );

              case 'summary-completion':
                return (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{question.questionText}</p>
                    <Textarea
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      placeholder="Complete the summary"
                      className="min-h-[150px]"
                    />
                  </div>
                );

              case 'matching-paragraphs':
                return (
                  <div className="space-y-3">
                    {Array.isArray(question.options) && question.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium min-w-[24px]">{index + 1}.</span>
                        <span className="flex-1">{option}</span>
                        <Input
                          value={answers[`${question._id}-${index}`] || ''}
                          onChange={(e) => handleAnswerChange(`${question._id}-${index}`, e.target.value)}
                          placeholder="Paragraph number"
                          className="w-24"
                        />
                      </div>
                    ))}
                  </div>
                );

              case 'matching':
                return (
                  <div className="space-y-3">
                    {Array.isArray(question.options) && question.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <span className="font-medium min-w-[24px]">{index + 1}.</span>
                        <span className="flex-1">{option}</span>
                        <Select
                          value={answers[`${question._id}-${index}`] || ''}
                          onValueChange={(value) => handleAnswerChange(`${question._id}-${index}`, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select match" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(question.matchingOptions) && question.matchingOptions.map((match) => (
                              <SelectItem key={match} value={match}>
                                {match}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                );

              default:
                return (
                  <Input
                    value={answers[question._id] || ''}
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    placeholder="Enter your answer"
                  />
                );
            }
          })()}
        </div>
      </div>
    );
  };

  const renderQuestions = () => {
    if (!currentSectionData?.questions) return null;

    return currentSectionData.questions.map((question, index) => (
      <div key={question._id} className="space-y-4">
        <div className="flex items-start gap-2">
          <span className="font-medium">{index + 1}.</span>
          <div className="space-y-2">
            <span>{question.questionText}</span>
            {question.instructions && (
              <p className="text-sm text-muted-foreground">{question.instructions}</p>
            )}
          </div>
        </div>
        {renderAnswerInput(question)}
      </div>
    ));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Section {currentSection + 1} of {test.sections.length}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-[200px]">
              <Progress value={calculateProgress()} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">
                {Math.round(calculateProgress())}% Complete
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="sticky top-0 bg-white z-10 pb-4">
              <h2 className="text-xl font-semibold mb-2">{currentSectionData?.sectionName}</h2>
              <Separator className="my-4" />
            </div>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {currentSectionData?.passageText}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {!hasStartedReading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-semibold">Reading Instructions</h3>
                    <div className="space-y-4 text-gray-600">
                      <p>Please read the passage carefully before proceeding to the questions.</p>
                      <p>Once you start reading, the timer will begin.</p>
                      <p>You will have {test.timeLimit} minutes to complete this section.</p>
                    </div>
                    <Button 
                      onClick={handleStartReading}
                      className="mt-6 px-8 py-6 text-lg"
                      size="lg"
                    >
                      Start Reading <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {renderQuestions()}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            {test.sections.map((_, index) => (
              <Button
                key={index}
                variant={currentSection === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSection(index)}
                className={currentSection === index ? "bg-primary text-white" : ""}
              >
                Section {index + 1}
              </Button>
            ))}
          </div>
          {hasStartedReading && (
            <Button 
              onClick={() => setShowSubmitDialog(true)}
              className="bg-red-600 hover:bg-red-700 px-8"
              size="lg"
            >
              Submit Test
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p>Are you sure you want to submit your test?</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>You cannot modify your answers after submission</li>
                  <li>Make sure you have answered all questions</li>
                  <li>You have {formatTime(timeLeft)} remaining</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 