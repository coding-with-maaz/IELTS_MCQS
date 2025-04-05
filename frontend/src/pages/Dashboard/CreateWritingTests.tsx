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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { writingTestsApi, WritingTest, CreateWritingTestRequest, UpdateWritingTestRequest } from '@/store/api/writingTestsApi';
import { writingSectionsApi, WritingSection } from '@/store/api/writingSectionsApi';
import { useNavigate } from 'react-router-dom';

interface TestFormData {
  testName: string;
  testType: 'academic' | 'general';
  sections: string[];
  timeLimit: number;
  instructions: string;
  answerSheet?: File;
}

export default function CreateWritingTestsPage() {
  const navigate = useNavigate();
  const [isSectionsDialogOpen, setIsSectionsDialogOpen] = React.useState(false);
  const [selectedSections, setSelectedSections] = React.useState<string[]>([]);
  const [sectionSearchTerm, setSectionSearchTerm] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<TestFormData>({
    testName: '',
    testType: 'academic',
    sections: [],
    timeLimit: 60,
    instructions: 'Complete both tasks within the time limit.',
  });

  const { toast } = useToast();
  const { data: sections = [], isLoading: isSectionsLoading } = writingSectionsApi.useGetWritingSectionsQuery();
  const [createTest] = writingTestsApi.useCreateWritingTestMutation();

  // Check if we have at least one task1 or one task2 section
  const hasTask1 = React.useMemo(() => {
    return selectedSections.some(id => 
      sections.find(s => s._id === id)?.taskType === 'task1'
    );
  }, [selectedSections, sections]);

  const hasTask2 = React.useMemo(() => {
    return selectedSections.some(id => 
      sections.find(s => s._id === id)?.taskType === 'task2'
    );
  }, [selectedSections, sections]);

  // At least one section type must be selected
  const hasValidSections = hasTask1 || hasTask2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (!formData.testName || selectedSections.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select at least one section",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!hasValidSections) {
      toast({
        title: "Validation Error",
        description: "You must select at least one Task 1 or Task 2 section",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const testData: CreateWritingTestRequest = {
        testName: formData.testName.trim(),
        testType: formData.testType,
        sections: selectedSections,
        timeLimit: formData.timeLimit,
        instructions: formData.instructions.trim(),
        answerSheet: formData.answerSheet,
      };

      console.log('Submitting writing test data:', testData);

      const response = await createTest(testData).unwrap();
      console.log('Create response:', response);
      
      toast({
        title: "Success",
        description: "Writing test created successfully",
      });
      
      // Navigate back to the writing tests list
      navigate('/dashboard/writing-tests');
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
          description: error.data?.message || "Failed to create writing test. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
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

    // Group sections by task type
    const task1Sections = filteredSections.filter(s => s.taskType === 'task1');
    const task2Sections = filteredSections.filter(s => s.taskType === 'task2');

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Task 1 Sections</h3>
          {task1Sections.length > 0 ? (
            <div className="space-y-2">
              {task1Sections.map((section) => (
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
                      {section.instructions && (
                        <div>
                          <span className="font-medium">Instructions: </span>
                          <span className="text-muted-foreground">{section.instructions.substring(0, 50)}...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No Task 1 sections available</div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Task 2 Sections</h3>
          {task2Sections.length > 0 ? (
            <div className="space-y-2">
              {task2Sections.map((section) => (
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
                      {section.instructions && (
                        <div>
                          <span className="font-medium">Instructions: </span>
                          <span className="text-muted-foreground">{section.instructions.substring(0, 50)}...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No Task 2 sections available</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Create Writing Test">
      <div className="mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Create IELTS Writing Test</h2>
          <p className="text-sm text-muted-foreground">
            Combine writing tasks to create a complete writing test
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-7 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    placeholder="e.g., Academic Writing Test 1"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select 
                    value={formData.testType} 
                    onValueChange={(value: 'academic' | 'general') => 
                      setFormData({ ...formData, testType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="general">General Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="instructions">Test Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Enter test instructions"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="answerSheet">Answer Sheet Template (optional)</Label>
                  <Input
                    id="answerSheet"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a template for students to fill in (PDF, DOC, DOCX)
                  </p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Selected Sections</Label>
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
                  <div className="border rounded-md p-4">
                    {selectedSections.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No sections selected. Click Manage Sections to add sections to the test.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedSections.map(sectionId => {
                          const section = sections.find(s => s._id === sectionId);
                          return section ? (
                            <div key={section._id} className="flex items-center justify-between bg-secondary/30 p-2 rounded">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {section.sectionName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {section.taskType === 'task1' ? 'Task 1' : 'Task 2'} • {section.questions.length} questions
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSectionSelect(section._id);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  {!hasValidSections && (
                    <p className="text-xs text-red-500">
                      * You need to select at least one Task 1 or Task 2 section
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/writing-tests')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting || !hasValidSections}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Test
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Test Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium">Task 1</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasTask1 
                      ? `${selectedSections.filter(id => sections.find(s => s._id === id)?.taskType === 'task1').length} section(s) selected` 
                      : 'No section selected'}
                  </p>
                  <div className="text-xs flex items-center mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>20 minutes • 150 words minimum</span>
                  </div>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Task 2</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasTask2 
                      ? `${selectedSections.filter(id => sections.find(s => s._id === id)?.taskType === 'task2').length} section(s) selected` 
                      : 'No section selected'}
                  </p>
                  <div className="text-xs flex items-center mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>40 minutes • 250 words minimum</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-md mt-4">
                  <h3 className="text-sm font-medium mb-2">Requirements</h3>
                  <ul className="text-xs text-slate-700 space-y-1">
                    <li className="flex items-start">
                      <div className={`h-4 w-4 mr-2 ${hasValidSections ? 'text-green-500' : 'text-red-500'}`}>
                        {hasValidSections ? '✓' : '✗'}
                      </div>
                      <span>At least one Task 1 or Task 2 section</span>
                    </li>
                    <li className="flex items-start">
                      <div className={`h-4 w-4 mr-2 ${formData.testName ? 'text-green-500' : 'text-red-500'}`}>
                        {formData.testName ? '✓' : '✗'}
                      </div>
                      <span>Test name provided</span>
                    </li>
                    <li className="flex items-start">
                      <div className={`h-4 w-4 mr-2 ${formData.instructions ? 'text-green-500' : 'text-red-500'}`}>
                        {formData.instructions ? '✓' : '✗'}
                      </div>
                      <span>Instructions provided</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sections Dialog */}
      <Dialog open={isSectionsDialogOpen} onOpenChange={setIsSectionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Sections</DialogTitle>
            <DialogDescription>
              Choose sections to include in this writing test.
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