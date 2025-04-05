import React from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2, FileText, Clock, Search, List, X } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { readingTestsApi, ReadingTest, CreateReadingTestRequest, UpdateReadingTestRequest } from '@/store/api/readingTestsApi';
import { readingSectionsApi, ReadingSection } from '@/store/api/readingSectionsApi';
import { useGetCurrentUserQuery } from '@/store/api/authApi';

interface TestFormData {
  testName: string;
  testType: 'academic' | 'general';
  sections: string[];
  timeLimit: number;
  answerSheet?: File;
}

export default function ReadingTestsPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSectionsDialogOpen, setIsSectionsDialogOpen] = React.useState(false);
  const [editingTest, setEditingTest] = React.useState<ReadingTest | null>(null);
  const [selectedSections, setSelectedSections] = React.useState<string[]>([]);
  const [sectionSearchTerm, setSectionSearchTerm] = React.useState('');
  const { data: currentUser } = useGetCurrentUserQuery();
  const [formData, setFormData] = React.useState<TestFormData>({
    testName: '',
    testType: 'academic',
    sections: [],
    timeLimit: 60,
  });

  const { toast } = useToast();
  const { data: tests = [], isLoading } = readingTestsApi.useGetReadingTestsQuery();
  const { data: sections = [], isLoading: isSectionsLoading } = readingSectionsApi.useGetReadingSectionsQuery();
  const [createTest] = readingTestsApi.useCreateReadingTestMutation();
  const [updateTest] = readingTestsApi.useUpdateReadingTestMutation();
  const [deleteTest] = readingTestsApi.useDeleteReadingTestMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.testName || !formData.testType || selectedSections.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one section",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!currentUser?.data?.user?.id) {
        toast({
          title: "Authentication Error",
          description: "User data not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('testName', formData.testName.trim());
      formDataToSubmit.append('testType', formData.testType);
      formDataToSubmit.append('sections', JSON.stringify(selectedSections));
      formDataToSubmit.append('timeLimit', formData.timeLimit.toString());
      formDataToSubmit.append('createdBy', currentUser.data.user.id);

      if (formData.answerSheet) {
        formDataToSubmit.append('answerSheet', formData.answerSheet);
      }

      console.log('Submitting test data:', {
        testName: formData.testName.trim(),
        testType: formData.testType,
        sections: selectedSections,
        timeLimit: formData.timeLimit,
        createdBy: currentUser.data.user.id
      });

      if (editingTest) {
        const response = await updateTest({ 
          id: editingTest._id, 
          test: formDataToSubmit as unknown as UpdateReadingTestRequest
        }).unwrap();
        console.log('Update response:', response);
        toast({
          title: "Success",
          description: "Test updated successfully",
        });
      } else {
        const response = await createTest(formDataToSubmit as unknown as CreateReadingTestRequest).unwrap();
        console.log('Create response:', response);
        toast({
          title: "Success",
          description: "Test created successfully",
        });
      }
      setIsOpen(false);
      resetForm();
      setSelectedSections([]);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error.data);
      
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
        description: error.data?.message || "Failed to save test. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTest(id).unwrap();
      toast({
        title: "Success",
        description: "Test deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      testName: '',
      testType: 'academic',
      sections: [],
      timeLimit: 60,
    });
    setEditingTest(null);
    setSelectedSections([]);
  };

  const handleEdit = (test: ReadingTest) => {
    setEditingTest(test);
    setFormData({
      testName: test.testName,
      testType: test.testType,
      sections: test.sections.map(s => s._id),
      timeLimit: test.timeLimit,
    });
    setSelectedSections(test.sections.map(s => s._id));
    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, answerSheet: file }));
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSections(prev => {
      const newSelection = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      return newSelection;
    });
  };

  const renderSectionsContent = () => {
    if (isSectionsLoading) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sections...</p>
        </div>
      );
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No sections available. Please create some sections first.
        </div>
      );
    }

    const filteredSections = sections.filter(section =>
      section.sectionName.toLowerCase().includes(sectionSearchTerm.toLowerCase())
    );

    if (filteredSections.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No sections found matching your search.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredSections.map((section) => (
          <Card 
            key={section._id} 
            className={`cursor-pointer transition-colors ${
              selectedSections.includes(section._id) ? 'border-primary' : ''
            }`} 
            onClick={() => handleSectionSelect(section._id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {section.sectionName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Questions: </span>
                  <span className="text-muted-foreground">{section.questions.length}</span>
                </div>
                <div>
                  <span className="font-medium">Passage: </span>
                  <span className="text-muted-foreground line-clamp-2">{section.passageText}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout title="Reading Tests">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reading Tests</h2>
          <p className="text-sm text-muted-foreground">
            Manage your reading tests here.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingTest ? 'Edit' : 'Add'} Reading Test</DialogTitle>
                <DialogDescription>
                  Fill in the details for the reading test.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    placeholder="Enter test name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select
                    value={formData.testType}
                    onValueChange={(value: 'academic' | 'general') => 
                      setFormData({ ...formData, testType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    max="180"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="answerSheet">Answer Sheet (PDF)</Label>
                  <Input
                    id="answerSheet"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSectionsDialogOpen(true)}
                    >
                      <List className="mr-2 h-4 w-4" />
                      Manage Sections
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {selectedSections.length} sections selected
                    </div>
                    {selectedSections.length > 0 && (
                      <div className="border rounded-lg p-4 space-y-2">
                        {selectedSections.map(sectionId => {
                          const section = sections.find(s => s._id === sectionId);
                          return section ? (
                            <div key={section._id} className="flex items-center justify-between">
                              <span className="text-sm truncate flex-1">{section.sectionName}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSectionSelect(section._id)}
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
                  {editingTest ? 'Update' : 'Create'} Test
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
          {tests.map((test) => (
            <Card key={test._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base font-medium">
                  {test.testName}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEdit(test)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDelete(test._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{test.testType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{test.timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{test.sections.length} Sections</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <h3 className="font-medium">Sections:</h3>
                    {test.sections.map((section) => (
                      <div key={section._id} className="rounded-lg border p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{section.sectionName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{section.questions.length} Questions</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {section.passageText}
                          </p>
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

      {/* Sections Selection Dialog */}
      <Dialog open={isSectionsDialogOpen} onOpenChange={setIsSectionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Sections</DialogTitle>
            <DialogDescription>
              Choose sections to include in this test.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sections..."
                  value={sectionSearchTerm}
                  onChange={(e) => setSectionSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {renderSectionsContent()}
          </div>
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedSections.length} sections selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedSections([])}>
                Clear Selection
              </Button>
              <Button onClick={() => setIsSectionsDialogOpen(false)}>Done</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 