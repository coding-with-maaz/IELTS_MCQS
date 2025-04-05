import React from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2, Image, FileText } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  writingQuestionsApi, 
  WritingQuestion, 
  CreateWritingQuestionRequest, 
  UpdateWritingQuestionRequest 
} from '@/store/api/writingQuestionsApi';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormData {
  questionText: string;
  questionType: 'graph-description' | 'process-description' | 'map-description' | 'table-description' | 'diagram-description' | 'easy';
  instructions: string;
  diagram?: File | null;
  wordCount: number;
}

export default function WritingQuestionsPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<WritingQuestion | null>(null);
  const [selectedDiagram, setSelectedDiagram] = React.useState<File | null>(null);
  const [formData, setFormData] = React.useState<FormData>({
    questionText: '',
    questionType: 'process-description',
    instructions: '',
    wordCount: 150,
  });

  const { toast } = useToast();
  const { data: questions = [], isLoading } = writingQuestionsApi.useGetWritingQuestionsQuery();
  const [createQuestion] = writingQuestionsApi.useCreateWritingQuestionMutation();
  const [updateQuestion] = writingQuestionsApi.useUpdateWritingQuestionMutation();
  const [updateDiagram] = writingQuestionsApi.useUpdateWritingQuestionDiagramMutation();
  const [deleteQuestion] = writingQuestionsApi.useDeleteWritingQuestionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.questionText || !formData.questionType || !formData.instructions) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate question type
      const validQuestionTypes = [
        'graph-description',
        'process-description',
        'map-description',
        'table-description',
        'diagram-description',
        'easy'
      ];

      if (!validQuestionTypes.includes(formData.questionType)) {
        toast({
          title: "Validation Error",
          description: "Invalid question type selected",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // For Task 1 question types, diagram is required
      const isTask1Type = [
        'graph-description',
        'process-description',
        'map-description',
        'table-description',
        'diagram-description'
      ].includes(formData.questionType);

      if (isTask1Type && !selectedDiagram) {
        toast({
          title: "Validation Error",
          description: "Please upload a diagram for Task 1 question types",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create new question
      const questionData: CreateWritingQuestionRequest = {
        questionText: formData.questionText.trim(),
        questionType: formData.questionType,
        instructions: formData.instructions.trim(),
        wordCount: formData.wordCount,
        diagram: selectedDiagram || undefined
      };
      
      console.log('Submitting question data:', questionData);
      
      await createQuestion(questionData).unwrap();
      toast({
        title: "Success",
        description: "Question created successfully",
      });
      
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle different types of errors
      if (error.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
      } else if (error.status === 403) {
        toast({
          title: "Authorization Error",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
      } else if (error.status === 400) {
        toast({
          title: "Validation Error",
          description: error.data?.message || "Invalid data format. Please check your input.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.data?.message || "Failed to save question. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
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
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'process-description',
      instructions: '',
      wordCount: 150,
    });
    setEditingQuestion(null);
    setSelectedDiagram(null);
  };

  const handleEdit = (question: WritingQuestion) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      questionType: question.questionType,
      instructions: question.instructions,
      wordCount: question.wordCount,
    });
    setIsOpen(true);
  };

  const handleDiagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDiagram(file);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'graph-description': 'Graph Description',
      'process-description': 'Process Description',
      'map-description': 'Map Description',
      'table-description': 'Table Description',
      'diagram-description': 'Diagram Description',
      'easy': 'Easy Question',
    };
    return labels[type] || type;
  };

  return (
    <DashboardLayout title="Writing Questions">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">IELTS Writing Task 1 Questions</h2>
          <p className="text-sm text-muted-foreground">
            Manage diagram-based writing questions for Task 1 (150 words).
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingQuestion ? 'Edit' : 'Add'} Writing Question</DialogTitle>
                <DialogDescription>
                  Create an IELTS Writing Task 1 question with a diagram or image.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select 
                    value={formData.questionType} 
                    onValueChange={(value: 'graph-description' | 'process-description' | 'map-description' | 'table-description' | 'diagram-description' | 'easy') => 
                      setFormData({ ...formData, questionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="graph-description">Graph Description (Task 1)</SelectItem>
                      <SelectItem value="process-description">Process Description (Task 1)</SelectItem>
                      <SelectItem value="map-description">Map Description (Task 1)</SelectItem>
                      <SelectItem value="table-description">Table Description (Task 1)</SelectItem>
                      <SelectItem value="diagram-description">Diagram Description (Task 1)</SelectItem>
                      <SelectItem value="easy">Easy Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    placeholder="E.g., The diagram shows how electricity is generated by a hydroelectric dam."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="E.g., Write a 150-word report for a university lecturer explaining how the process works."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="wordCount">Word Count</Label>
                  <Input
                    id="wordCount"
                    type="number"
                    value={formData.wordCount}
                    onChange={(e) => setFormData({ ...formData, wordCount: parseInt(e.target.value) })}
                    min={100}
                    max={300}
                  />
                  <p className="text-xs text-muted-foreground">Default word count for Task 1 is 150 words</p>
                </div>
                
                {[
                  'graph-description', 
                  'process-description', 
                  'map-description', 
                  'table-description', 
                  'diagram-description'
                ].includes(formData.questionType) && (
                  <div className="grid gap-2">
                    <Label htmlFor="diagram">Diagram/Image (Required)</Label>
                    <Input
                      id="diagram"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDiagramChange}
                    />
                    {editingQuestion && editingQuestion.diagramUrl && !selectedDiagram && (
                      <Alert>
                        <AlertDescription className="flex items-center justify-between">
                          <span>
                            Current diagram: {editingQuestion.diagramUrl.split('/').pop()}
                          </span>
                          <a 
                            href={editingQuestion.diagramUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View
                          </a>
                        </AlertDescription>
                      </Alert>
                    )}
                    {selectedDiagram && (
                      <Alert>
                        <AlertDescription>
                          New diagram selected: {selectedDiagram.name}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
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
      ) : questions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No writing questions found</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first Task 1 writing question.</p>
          <Button onClick={() => { resetForm(); setIsOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {questions.map((question) => (
            <Card key={question._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">{getQuestionTypeLabel(question.questionType)}</Badge>
                    <CardTitle className="text-xl">{question.questionText}</CardTitle>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Instructions:</h4>
                  <p className="text-sm text-muted-foreground">{question.instructions}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Word Count: {question.wordCount}</h4>
                </div>
                
                <div className="flex flex-col gap-2">
                  <h4 className="font-medium mb-1">Diagram:</h4>
                  <div className="border rounded-lg overflow-hidden max-w-xl">
                    {question.diagramUrl && question.diagramUrl.endsWith('.pdf') ? (
                      <div className="flex items-center gap-2 p-4">
                        <FileText className="h-6 w-6" />
                        <a 
                          href={question.diagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View PDF Diagram
                        </a>
                      </div>
                    ) : (
                      <img 
                        src={question.diagramUrl} 
                        alt={question.questionText}
                        className="w-full h-auto object-contain"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
} 