import React from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2, FileText, Image, Search, List, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  writingSectionsApi, 
  WritingSection, 
  CreateWritingSectionRequest, 
  UpdateWritingSectionRequest 
} from '@/store/api/writingSectionsApi';
import { writingQuestionsApi, WritingQuestion } from '@/store/api/writingQuestionsApi';

interface TaskFormData {
  sectionName: string;
  taskType: 'task1' | 'task2';
  instructions: string;
  minimumWords: number;
  timeLimit: number;
  questions: string[];
  pdf?: File;
  image?: File;
}

export default function WritingTasksPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<WritingSection | null>(null);
  const [selectedQuestions, setSelectedQuestions] = React.useState<string[]>([]);
  const [questionSearchTerm, setQuestionSearchTerm] = React.useState('');
  const [formData, setFormData] = React.useState<TaskFormData>({
    sectionName: '',
    taskType: 'task1',
    instructions: '',
    minimumWords: 150,
    timeLimit: 20,
    questions: [],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { toast } = useToast();
  const { data: sections = [], isLoading } = writingSectionsApi.useGetWritingSectionsQuery();
  const { data: questions = [], isLoading: isQuestionsLoading } = writingQuestionsApi.useGetWritingQuestionsQuery();
  const [createSection] = writingSectionsApi.useCreateWritingSectionMutation();
  const [updateSection] = writingSectionsApi.useUpdateWritingSectionMutation();
  const [deleteSection] = writingSectionsApi.useDeleteWritingSectionMutation();

  // Check if we have any Task 2 sections available
  const hasTask2Sections = React.useMemo(() => {
    return sections.some(section => section.taskType === 'task2');
  }, [sections]);

  // Function to create a basic Task 2 section template
  const createTask2Template = async () => {
    try {
      setIsSubmitting(true);
      
      // Find a question to use (can be any question since it's just for template)
      const firstQuestion = questions.length > 0 ? questions[0]._id : null;
      
      if (!firstQuestion) {
        toast({
          title: "Error",
          description: "You need to create at least one writing question first",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const sectionData: CreateWritingSectionRequest = {
        sectionName: "Essay Writing Task",
        taskType: "task2",
        instructions: "Write an essay on the given topic. Give reasons for your answer and include any relevant examples from your knowledge or experience.",
        questions: [firstQuestion],
        minimumWords: 250,
        timeLimit: 40
      };
      
      await createSection(sectionData).unwrap();
      
      toast({
        title: "Success",
        description: "Task 2 template created successfully. You can now edit it or use it in your tests.",
      });
      
    } catch (error: any) {
      console.error('Error creating Task 2 template:', error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to create Task 2 template",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.sectionName || selectedQuestions.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields and select at least one question",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Set default values based on task type
      const defaultMinWords = formData.taskType === 'task2' ? 250 : 150;
      const defaultTimeLimit = formData.taskType === 'task2' ? 40 : 20;
      const minimumWords = Number(formData.minimumWords) || defaultMinWords;
      const timeLimit = Number(formData.timeLimit) || defaultTimeLimit;

      // Ensure instructions has a default value if empty
      const instructions = formData.instructions?.trim() || 
        (formData.taskType === 'task2' 
          ? 'Write an essay on the given topic.' 
          : 'Describe the diagram in your own words.');

      const sectionData: CreateWritingSectionRequest = {
        sectionName: formData.sectionName.trim(),
        taskType: formData.taskType,
        instructions: instructions,
        questions: selectedQuestions,
        minimumWords,
        timeLimit,
        pdf: formData.pdf,
        image: formData.image,
      };

      console.log("Submitting data:", sectionData); // Debug log

      if (editingSection) {
        const updateData: UpdateWritingSectionRequest = {
          sectionName: sectionData.sectionName,
          taskType: sectionData.taskType,
          instructions: sectionData.instructions,
          questions: sectionData.questions,
          minimumWords: sectionData.minimumWords,
          timeLimit: sectionData.timeLimit,
          pdf: sectionData.pdf,
          image: sectionData.image,
        };
        
        await updateSection({ 
          id: editingSection._id, 
          section: updateData 
        }).unwrap();
        
        toast({
          title: "Success",
          description: "Writing task updated successfully",
        });
      } else {
        await createSection(sectionData).unwrap();
        toast({
          title: "Success",
          description: "Writing task created successfully",
        });
      }
      setIsOpen(false);
      resetForm();
      setSelectedQuestions([]);
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
          description: error.data?.message || "Failed to save writing task. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this writing task? This action cannot be undone.")) {
      try {
        await deleteSection(id).unwrap();
        toast({
          title: "Success",
          description: "Writing task deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete writing task",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      sectionName: '',
      taskType: 'task1',
      instructions: '',
      minimumWords: 150,
      timeLimit: 20,
      questions: [],
    });
    setEditingSection(null);
    setSelectedQuestions([]);
  };

  const handleEdit = (section: WritingSection) => {
    setEditingSection(section);
    setFormData({
      sectionName: section.sectionName,
      taskType: section.taskType,
      instructions: section.instructions,
      minimumWords: section.minimumWords,
      timeLimit: section.timeLimit,
      questions: section.questions.map(q => q._id),
    });
    setSelectedQuestions(section.questions.map(q => q._id));
    setIsOpen(true);
  };

  const handleTaskTypeChange = (value: 'task1' | 'task2') => {
    setFormData(prev => ({
      ...prev,
      taskType: value,
      minimumWords: value === 'task1' ? 150 : 250,
      timeLimit: value === 'task1' ? 20 : 40,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSelection = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      return newSelection;
    });
  };

  const getTaskTypeLabel = (type: 'task1' | 'task2') => {
    return type === 'task1' ? 'Task 1 (150 words)' : 'Task 2 (250 words)';
  };

  const filterQuestionsByTaskType = (questions: WritingQuestion[]) => {
    if (formData.taskType === 'task1') {
      // Task 1 types are diagram/chart based
      return questions.filter(q => [
        'graph-description', 
        'process-description', 
        'map-description', 
        'table-description', 
        'diagram-description'
      ].includes(q.questionType));
    } else {
      // For Task 2, return all questions that are not specifically for Task 1
      // If no such questions exist, return all questions as fallback
      const task2Questions = questions.filter(q => ![
        'graph-description', 
        'process-description', 
        'map-description', 
        'table-description', 
        'diagram-description'
      ].includes(q.questionType));
      
      return task2Questions.length > 0 ? task2Questions : questions;
    }
  };

  const renderQuestionsContent = () => {
    if (isQuestionsLoading) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      );
    }

    const filteredQuestions = filterQuestionsByTaskType(questions);

    if (filteredQuestions.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No questions available for this task type. Please create some questions first.
        </div>
      );
    }

    const searchFilteredQuestions = filteredQuestions.filter(question =>
      question.questionText.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
      question.instructions.toLowerCase().includes(questionSearchTerm.toLowerCase())
    );

    if (searchFilteredQuestions.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No questions found matching your search.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {searchFilteredQuestions.map((question) => (
          <Card 
            key={question._id} 
            className={`cursor-pointer transition-colors ${
              selectedQuestions.includes(question._id) ? 'border-primary' : ''
            }`} 
            onClick={() => handleQuestionSelect(question._id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {question.questionText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Type: </span>
                  <span className="text-muted-foreground">{question.questionType}</span>
                </div>
                {question.instructions && (
                  <div>
                    <span className="font-medium">Instructions: </span>
                    <span className="text-muted-foreground">{question.instructions}</span>
                  </div>
                )}
                {question.diagramUrl && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Diagram: </span>
                    <a 
                      href={question.diagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout title="Writing Tasks">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">IELTS Writing Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Manage writing tasks for IELTS test preparation.
          </p>
        </div>
        <div className="flex gap-2">
          {!hasTask2Sections && (
            <Button variant="outline" onClick={createTask2Template} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Task 2 Template
            </Button>
          )}
          <Button onClick={() => { resetForm(); setIsOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingSection ? 'Edit' : 'Add'} Writing Task</DialogTitle>
              <DialogDescription>
                Create a writing task section for an IELTS test.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sectionName">Task Name</Label>
                <Input
                  id="sectionName"
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="Enter task name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="taskType">Task Type</Label>
                <Select 
                  value={formData.taskType} 
                  onValueChange={(value: 'task1' | 'task2') => handleTaskTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task1">Task 1 (150 words)</SelectItem>
                    <SelectItem value="task2">Task 2 (250 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Enter task instructions"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minimumWords">Minimum Words</Label>
                  <Input
                    id="minimumWords"
                    type="number"
                    value={formData.minimumWords}
                    onChange={(e) => setFormData({ ...formData, minimumWords: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Files</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">Image File</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdf">PDF File</Label>
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'pdf')}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Questions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsQuestionsDialogOpen(true)}
                  >
                    <List className="mr-2 h-4 w-4" />
                    Manage Questions
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {selectedQuestions.length} questions selected
                  </div>
                  {selectedQuestions.length > 0 && (
                    <div className="border rounded-lg p-4 space-y-2">
                      {selectedQuestions.map(questionId => {
                        const question = questions.find(q => q._id === questionId);
                        return question ? (
                          <div key={question._id} className="flex items-center justify-between">
                            <span className="text-sm truncate flex-1">{question.questionText}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuestionSelect(question._id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingSection ? 'Update' : 'Create'} Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Questions Dialog */}
      <Dialog open={isQuestionsDialogOpen} onOpenChange={setIsQuestionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Questions</DialogTitle>
            <DialogDescription>
              Choose questions to include in this writing task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={questionSearchTerm}
                  onChange={(e) => setQuestionSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {renderQuestionsContent()}
          </div>
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedQuestions.length} questions selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedQuestions([])}>
                Clear Selection
              </Button>
              <Button onClick={() => setIsQuestionsDialogOpen(false)}>Done</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No writing tasks found</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first writing task.</p>
          <Button onClick={() => { resetForm(); setIsOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <Badge className="mb-2">{getTaskTypeLabel(section.taskType)}</Badge>
                  <CardTitle className="text-base font-medium">
                    {section.sectionName}
                  </CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEdit(section)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDelete(section._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Instructions:</h3>
                    <p className="text-sm text-muted-foreground">{section.instructions}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-medium">Words: </span>
                      <span className="text-muted-foreground">{section.minimumWords}</span>
                    </div>
                    <div>
                      <span className="font-medium">Time: </span>
                      <span className="text-muted-foreground">{section.timeLimit} min</span>
                    </div>
                    <div>
                      <span className="font-medium">Questions: </span>
                      <span className="text-muted-foreground">{section.questions.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {section.image && (
                      <div className="flex items-center gap-1">
                        <Image className="h-4 w-4" />
                        <span>Image</span>
                      </div>
                    )}
                    {section.pdf && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>PDF</span>
                      </div>
                    )}
                  </div>
                  {section.questions.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Questions:</h3>
                      <div className="space-y-2">
                        {section.questions.map((question) => (
                          <div key={question._id} className="border rounded-lg p-3">
                            <p className="text-sm">{question.questionText}</p>
                            {question.diagramUrl && (
                              <div className="mt-2 flex items-center gap-2">
                                <a
                                  href={question.diagramUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                >
                                  <Image className="h-3 w-3" /> View Diagram
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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