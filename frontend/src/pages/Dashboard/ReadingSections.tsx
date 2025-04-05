import React from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2, FileText, Image, FileAudio, Search, List, X } from 'lucide-react';
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
import { readingSectionsApi, ReadingSection, CreateReadingSectionRequest, UpdateReadingSectionRequest } from '@/store/api/readingSectionsApi';
import { readingTestsApi, ReadingQuestion } from '@/store/api/readingTestsApi';

interface SectionFormData {
  sectionName: string;
  passageText: string;
  questions: string[];
  audio?: File;
  image?: File;
  pdf?: File;
}

export default function ReadingSectionsPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<ReadingSection | null>(null);
  const [selectedQuestions, setSelectedQuestions] = React.useState<string[]>([]);
  const [questionSearchTerm, setQuestionSearchTerm] = React.useState('');
  const [formData, setFormData] = React.useState<SectionFormData>({
    sectionName: '',
    passageText: '',
    questions: [],
  });

  const { toast } = useToast();
  const { data: sections = [], isLoading } = readingSectionsApi.useGetReadingSectionsQuery();
  const { data: tests = [], isLoading: isQuestionsLoading } = readingTestsApi.useGetReadingTestsQuery();
  const [createSection] = readingSectionsApi.useCreateReadingSectionMutation();
  const [updateSection] = readingSectionsApi.useUpdateReadingSectionMutation();
  const [deleteSection] = readingSectionsApi.useDeleteReadingSectionMutation();

  const questions = tests.flatMap(test => 
    test.sections.flatMap(section => section.questions)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sectionName || !formData.passageText) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the base section data
      const sectionData: CreateReadingSectionRequest = {
        sectionName: formData.sectionName.trim(),
        passageText: formData.passageText.trim(),
        questions: selectedQuestions,
        audio: formData.audio,
        image: formData.image,
        pdf: formData.pdf,
      };

      console.log('Submitting section data:', sectionData); // Debug log

      if (editingSection) {
        const updateData: UpdateReadingSectionRequest = {
          sectionName: sectionData.sectionName,
          passageText: sectionData.passageText,
          questions: sectionData.questions,
          audio: sectionData.audio,
          image: sectionData.image,
          pdf: sectionData.pdf,
        };
        
        const response = await updateSection({ 
          id: editingSection._id, 
          section: updateData 
        }).unwrap();
        console.log('Update response:', response); // Debug log
        toast({
          title: "Success",
          description: "Section updated successfully",
        });
      } else {
        const response = await createSection(sectionData).unwrap();
        console.log('Create response:', response); // Debug log
        toast({
          title: "Success",
          description: "Section created successfully",
        });
      }
      setIsOpen(false);
      resetForm();
      setSelectedQuestions([]);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error.data); // Debug log
      
      // Handle authentication errors
      if (error.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Handle authorization errors
      if (error.status === 403) {
        toast({
          title: "Authorization Error",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        return;
      }

      // Handle validation errors
      if (error.status === 400) {
        toast({
          title: "Validation Error",
          description: error.data?.message || "Invalid data format. Please check your input.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: error.data?.message || "Failed to save section. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSection(id).unwrap();
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      sectionName: '',
      passageText: '',
      questions: [],
    });
    setEditingSection(null);
    setSelectedQuestions([]);
  };

  const handleEdit = (section: ReadingSection) => {
    setEditingSection(section);
    setFormData({
      sectionName: section.sectionName,
      passageText: section.passageText,
      questions: section.questions.map(q => q._id),
    });
    setSelectedQuestions(section.questions.map(q => q._id));
    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'image' | 'pdf') => {
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

  const renderQuestionsContent = () => {
    if (isQuestionsLoading) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No questions available. Please create some questions first.
        </div>
      );
    }

    const filteredQuestions = questions.filter(question =>
      question.questionText.toLowerCase().includes(questionSearchTerm.toLowerCase()) ||
      question.instructions?.toLowerCase().includes(questionSearchTerm.toLowerCase())
    );

    if (filteredQuestions.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No questions found matching your search.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
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
                  <span className="text-muted-foreground">{question.answerType}</span>
                </div>
                {question.options && question.options.length > 0 && (
                  <div>
                    <span className="font-medium">Options: </span>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {question.options.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {question.instructions && (
                  <div>
                    <span className="font-medium">Instructions: </span>
                    <span className="text-muted-foreground">{question.instructions}</span>
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
    <DashboardLayout title="Reading Sections">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reading Sections</h2>
          <p className="text-sm text-muted-foreground">
            Manage your reading test sections here.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingSection ? 'Edit' : 'Add'} Reading Section</DialogTitle>
                <DialogDescription>
                  Fill in the details for the reading section.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="sectionName">Section Name</Label>
                  <Input
                    id="sectionName"
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    placeholder="Enter section name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="passageText">Passage Text</Label>
                  <Textarea
                    id="passageText"
                    value={formData.passageText}
                    onChange={(e) => setFormData({ ...formData, passageText: e.target.value })}
                    placeholder="Enter the passage text"
                    rows={10}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Files</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="audio">Audio File</Label>
                      <Input
                        id="audio"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileChange(e, 'audio')}
                      />
                    </div>
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
                  {editingSection ? 'Update' : 'Create'} Section
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
          {sections.map((section) => (
            <Card key={section._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base font-medium">
                  {section.sectionName}
                </CardTitle>
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
                  <div className="prose max-w-none">
                    <p className="text-sm">{section.passageText}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {section.audio && (
                      <div className="flex items-center gap-1">
                        <FileAudio className="h-4 w-4" />
                        <span>Audio</span>
                      </div>
                    )}
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
                    <div className="flex items-center gap-1">
                      <span>{section.questions.length} Questions</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <h3 className="font-medium">Questions:</h3>
                    {section.questions.map((question) => (
                      <div key={question._id} className="rounded-lg border p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{question.questionText}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Type: {question.answerType}</span>
                            {question.paragraphReference && (
                              <span>• Paragraph: {question.paragraphReference}</span>
                            )}
                          </div>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">Options:</p>
                              <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">
                                {question.options.map((option, index) => (
                                  <li key={index}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {question.instructions && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Instructions: {question.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Questions Selection Dialog */}
      <Dialog open={isQuestionsDialogOpen} onOpenChange={setIsQuestionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Questions</DialogTitle>
            <DialogDescription>
              Choose questions to include in this section.
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
    </DashboardLayout>
  );
} 