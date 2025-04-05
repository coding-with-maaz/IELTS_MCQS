import { useState, useEffect } from 'react';
// import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Pencil,
  Search,
  Filter
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Question,
  QuestionType,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation
} from '@/store/api/questionsApi';

interface QuestionFormData {
  questionText: string;
  answerType: QuestionType;
  options: string[];
  correctAnswer: string;
  instructions: string;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'sentence-completion', label: 'Sentence Completion' },
  { value: 'notes-completion', label: 'Notes Completion' },
  { value: 'summary-completion', label: 'Summary Completion' },
  { value: 'matching', label: 'Matching' },
];

export default function QuestionsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');
  
  const { data: questions = [], isLoading } = useGetQuestionsQuery();
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const [form, setForm] = useState<QuestionFormData>({
    questionText: '',
    answerType: 'short-answer',
    options: [],
    correctAnswer: '',
    instructions: '',
  });

  useEffect(() => {
    if (editingQuestion) {
      setForm({
        questionText: editingQuestion.questionText,
        answerType: editingQuestion.answerType,
        options: editingQuestion.options || [],
        correctAnswer: editingQuestion.correctAnswer,
        instructions: editingQuestion.instructions || '',
      });
    }
  }, [editingQuestion]);

  const filteredQuestions = questions
    .filter(q => 
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(q => filterType === 'all' || q.answerType === filterType);

  const handleAddOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setForm(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return {
        ...prev,
        options: newOptions
      };
    });
  };

  const handleRemoveOption = (index: number) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      const formData = {
        questionText: form.questionText,
        answerType: form.answerType,
        correctAnswer: form.correctAnswer,
        instructions: form.instructions,
        options: form.answerType === 'multiple-choice' ? form.options : undefined
      };

      if (editingQuestion?._id) {
        await updateQuestion({ 
          id: editingQuestion._id, 
          data: formData 
        }).unwrap();
        toast({
          title: 'Success',
          description: 'Question updated successfully.',
        });
      } else {
        await createQuestion(formData).unwrap();
        toast({
          title: 'Success',
          description: 'Question created successfully.',
        });
      }

      setForm({
        questionText: '',
        answerType: 'short-answer',
        options: [],
        correctAnswer: '',
        instructions: '',
      });
      setEditingQuestion(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save question.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id).unwrap();
      toast({
        title: 'Success',
        description: 'Question deleted successfully.',
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // if (isLoading) {
  //   return (
  //     <DashboardLayout title="Questions">
  //       <div className="flex items-center justify-center h-[calc(100vh-200px)]">
  //         <Loader2 className="h-8 w-8 animate-spin" />
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Question Bank</h2>
          <p className="text-sm text-muted-foreground">
            Manage questions for listening test sections.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details to {editingQuestion ? 'update' : 'create'} a question.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text</Label>
                <Textarea
                  id="questionText"
                  name="questionText"
                  value={form.questionText}
                  onChange={(e) => setForm(prev => ({ ...prev, questionText: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answerType">Answer Type</Label>
                <Select
                  name="answerType"
                  value={form.answerType}
                  onValueChange={(value: QuestionType) =>
                    setForm(prev => ({ ...prev, answerType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.answerType === 'multiple-choice' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                    >
                      Add Option
                    </Button>
                  </div>
                  {form.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="correctAnswer">Correct Answer</Label>
                <Input
                  id="correctAnswer"
                  name="correctAnswer"
                  value={form.correctAnswer}
                  onChange={(e) => setForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={form.instructions}
                  onChange={(e) => setForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Enter instructions for answering this question..."
                />
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="w-[200px]">
          <Select
            value={filterType}
            onValueChange={(value: QuestionType | 'all') => setFilterType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {QUESTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question._id}>
            <CardHeader>
              <CardTitle>{question.questionText}</CardTitle>
              {question.instructions && (
                <CardDescription>{question.instructions}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Type: </span>
                  <span className="text-muted-foreground">{question.answerType}</span>
                </div>
                {question.options && (
                  <div>
                    <span className="font-medium">Options: </span>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {question.options.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {question.correctAnswer && (
                  <div>
                    <span className="font-medium">Correct Answer: </span>
                    <span className="text-muted-foreground">{question.correctAnswer}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingQuestion(question);
                  setIsDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(question._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question and remove it from any sections that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 