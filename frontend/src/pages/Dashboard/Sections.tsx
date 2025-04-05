import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FileText,
  Loader2,
  Upload,
  X,
  Search,
  Music,
  Image,
  FileText as FileIcon,
  List
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useGetSectionsQuery, 
  useGetSectionQuery,
  useCreateSectionMutation, 
  useUpdateSectionMutation, 
  useDeleteSectionMutation,
  Section 
} from '@/store/api/sectionsApi';
import {   Question,
  QuestionType,
  useGetQuestionsQuery, } from '@/store/api/questionsApi';

interface SectionFormData {
  sectionName: string;
  description: string;
  questions: string[];
  audio?: File;
  image?: File;
  pdf?: File;
}

export default function SectionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  
  const { data: sectionsResponse, isLoading: isSectionsLoading } = useGetSectionsQuery();
  const { data: questionsResponse, isLoading: isQuestionsLoading, error: questionsError } = useGetQuestionsQuery();
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Extract data from API responses
  const sections = sectionsResponse?.data || [];
  // The questions response is already an array, so we don't need to extract .data
  const questions = questionsResponse || [];
  console.log('Questions available:', questions);

  const filteredSections = sections.filter(section => 
    section.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderQuestionsContent = () => {
    if (isQuestionsLoading) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      );
    }

    if (questionsError) {
      return (
        <div className="text-center text-muted-foreground py-8">
          Error loading questions. Please try again.
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

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Add selected questions to formData
    if (selectedQuestions.length > 0) {
      // Convert array to JSON string and log for debugging
      const questionsJson = JSON.stringify(selectedQuestions);
      console.log('Selected questions:', selectedQuestions);
      console.log('Questions JSON:', questionsJson);
      formData.set('questions[]', questionsJson);
    } else {
      console.log('No questions selected');
      formData.set('questions[]', JSON.stringify([]));
    }

    // Log all form data for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Ensure required fields are present
    const sectionName = formData.get('sectionName');
    if (!sectionName) {
      toast({
        title: "Error",
        description: "Section name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createSection(formData).unwrap();
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Section created successfully",
        });
        setIsCreateDialogOpen(false);
        setSelectedQuestions([]);
        setIsQuestionsDialogOpen(false);
      } else {
        throw new Error(response.message || "Failed to create section");
      }
    } catch (error) {
      console.error('Error creating section:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create section",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingSection) return;

    const formData = new FormData(event.currentTarget);
    
    // Add selected questions to formData
    if (selectedQuestions.length > 0) {
      const questionsJson = JSON.stringify(selectedQuestions);
      console.log('Selected questions for edit:', selectedQuestions);
      console.log('Questions JSON for edit:', questionsJson);
      formData.set('questions[]', questionsJson);
    } else {
      console.log('No questions selected for edit');
      formData.set('questions[]', JSON.stringify([]));
    }

    // Log all form data for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Ensure required fields are present
    const sectionName = formData.get('sectionName');
    if (!sectionName) {
      toast({
        title: "Error",
        description: "Section name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await updateSection({
        id: editingSection._id,
        data: formData
      }).unwrap();

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Section updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingSection(null);
        setSelectedQuestions([]);
      } else {
        throw new Error(response.message || "Failed to update section");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteSection(id).unwrap();
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Section deleted successfully",
        });
        setDeleteId(null);
      } else {
        throw new Error(response.message || "Failed to delete section");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Get the existing form if it exists
    const form = event.target.closest('form');
    if (form) {
      const formData = new FormData(form);
      formData.set(event.target.name, file);
    }
  };

  const handleQuestionSelect = (questionId: string) => {
    console.log('Selecting/deselecting question:', questionId);
    setSelectedQuestions(prev => {
      const newSelection = prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId];
      console.log('Updated selection:', newSelection);
      return newSelection;
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // if (isSectionsLoading) {
  //   return (
  //     <DashboardLayout title="Sections">
  //       <div className="flex items-center justify-center h-[calc(100vh-200px)]">
  //         <Loader2 className="h-8 w-8 animate-spin" />
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    // <DashboardLayout title="Sections">
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Sections</h2>
          <p className="text-sm text-muted-foreground">
            Manage all sections available for listening tests.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Section
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSections.map((section) => (
          <Card key={section._id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {section.sectionName}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setEditingSection(section);
                    setSelectedQuestions(section.questions.map(q => q._id));
                    setIsEditDialogOpen(true);
                  }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteId(section._id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {section.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.audio && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Music className="mr-1 h-4 w-4" />
                      Audio
                    </div>
                  )}
                  {section.image && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Image className="mr-1 h-4 w-4" />
                      Image
                    </div>
                  )}
                  {section.pdf && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileIcon className="mr-1 h-4 w-4" />
                      PDF
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {section.questions.length} Questions
                  </span>
                  <span className="text-muted-foreground">
                    Created {formatDate(section.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Create/Edit Section Dialog */}
      <Dialog 
        open={isCreateDialogOpen || isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingSection(null);
            setSelectedQuestions([]);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <form onSubmit={isEditDialogOpen ? handleEdit : handleCreate} encType="multipart/form-data">
            <DialogHeader>
              <DialogTitle>
                {isEditDialogOpen ? 'Edit Section' : 'Create New Section'}
              </DialogTitle>
              <DialogDescription>
                {isEditDialogOpen ? 'Update the section details.' : 'Add a new section that can be used in listening tests.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sectionName">Name *</Label>
                <Input
                  id="sectionName"
                  name="sectionName"
                  defaultValue={editingSection?.sectionName}
                  placeholder="Enter section name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingSection?.description}
                  placeholder="Enter section description"
                />
              </div>
              <div className="grid gap-2">
                <Label>Files</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="audio" className="mb-2 block">Audio</Label>
                    <Input
                      id="audio"
                      name="audio"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                    />
                    {editingSection?.audio && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Current: {editingSection.audio}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="image" className="mb-2 block">Image</Label>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {editingSection?.image && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Current: {editingSection.image}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="pdf" className="mb-2 block">PDF</Label>
                    <Input
                      id="pdf"
                      name="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                    {editingSection?.pdf && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Current: {editingSection.pdf}
                      </p>
                    )}
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
                {isEditDialogOpen ? 'Save Changes' : 'Create Section'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              section and remove it from any tests that use it.
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