import React from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { readingQuestionsApi, ReadingQuestion } from '@/store/api/readingQuestionsApi';

const answerTypes: { value: ReadingQuestion['answerType']; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false-not-given', label: 'True/False/Not Given' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'sentence-completion', label: 'Sentence Completion' },
  { value: 'notes-completion', label: 'Notes Completion' },
  { value: 'summary-completion', label: 'Summary Completion' },
  { value: 'matching-paragraphs', label: 'Matching Paragraphs' },
  { value: 'matching', label: 'Matching' }
];

interface QuestionFormData {
  questionText: string;
  answerType: ReadingQuestion['answerType'];
  options?: string[];
  correctAnswer: string;
  instructions?: string;
  paragraphReference?: number;
}

export default function ReadingQuestionsPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<ReadingQuestion | null>(null);
  const [formData, setFormData] = React.useState<QuestionFormData>({
    questionText: '',
    answerType: 'multiple-choice',
    options: [],
    correctAnswer: '',
    instructions: '',
    paragraphReference: undefined
  });

  const { toast } = useToast();
  const { data: questions = [], isLoading } = readingQuestionsApi.useGetReadingQuestionsQuery();
  const [createQuestion] = readingQuestionsApi.useCreateReadingQuestionMutation();
  const [updateQuestion] = readingQuestionsApi.useUpdateReadingQuestionMutation();
  const [deleteQuestion] = readingQuestionsApi.useDeleteReadingQuestionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.questionText || !formData.answerType || !formData.correctAnswer) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Format the data for API submission
    const questionData = {
      questionText: formData.questionText.trim(),
      answerType: formData.answerType,
      correctAnswer: formData.correctAnswer.trim(),
      ...(formData.options && formData.options.length > 0 && {
        options: formData.options.filter(option => option.trim() !== '')
      }),
      ...(formData.instructions && {
        instructions: formData.instructions.trim()
      }),
      ...(formData.paragraphReference && {
        paragraphReference: Number(formData.paragraphReference)
      })
    };

    try {
      if (editingQuestion) {
        await updateQuestion({ 
          id: editingQuestion._id, 
          question: questionData 
        }).unwrap();
        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        await createQuestion(questionData).unwrap();
        toast({
          title: "Success",
          description: "Question created successfully",
        });
      }
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to save question",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id).unwrap();
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      answerType: 'multiple-choice',
      options: [],
      correctAnswer: '',
      instructions: '',
      paragraphReference: undefined
    });
    setEditingQuestion(null);
  };

  const handleEdit = (question: ReadingQuestion) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      answerType: question.answerType,
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      instructions: question.instructions || '',
      paragraphReference: question.paragraphReference
    });
    setIsOpen(true);
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => {
      const newOptions = [...(prev.options || [])];
      newOptions[index] = value;
      return {
        ...prev,
        options: newOptions
      };
    });
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <DashboardLayout title="Reading Questions">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reading Questions</h2>
          <p className="text-sm text-muted-foreground">
            Manage your reading test questions here.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingQuestion ? 'Edit' : 'Add'} Reading Question</DialogTitle>
                <DialogDescription>
                  Fill in the details for the reading question.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    placeholder="Enter the question text"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="answerType">Answer Type</Label>
                  <Select
                    value={formData.answerType}
                    onValueChange={(value: ReadingQuestion['answerType']) => 
                      setFormData({ ...formData, answerType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select answer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {answerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value as ReadingQuestion['answerType']}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.answerType === 'multiple-choice' && (
                  <div className="grid gap-2">
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
                    {formData.options?.map((option, index) => (
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
                <div className="grid gap-2">
                  <Label htmlFor="correctAnswer">Correct Answer</Label>
                  <Input
                    id="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    placeholder="Enter the correct answer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Enter instructions for the question"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paragraphReference">Paragraph Reference (Optional)</Label>
                  <Input
                    id="paragraphReference"
                    type="number"
                    value={formData.paragraphReference || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      paragraphReference: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Enter paragraph number"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingQuestion ? 'Update' : 'Create'} Question
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Card key={question._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base font-medium">
                  {question.questionText}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEdit(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDelete(question._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>{' '}
                    {answerTypes.find(t => t.value === question.answerType)?.label}
                  </div>
                  {question.options && question.options.length > 0 && (
                    <div>
                      <span className="font-medium">Options:</span>
                      <ul className="list-disc list-inside ml-2">
                        {question.options.map((option, index) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {question.instructions && (
                    <div>
                      <span className="font-medium">Instructions:</span>{' '}
                      {question.instructions}
                    </div>
                  )}
                  {question.paragraphReference && (
                    <div>
                      <span className="font-medium">Paragraph Reference:</span>{' '}
                      {question.paragraphReference}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
} 