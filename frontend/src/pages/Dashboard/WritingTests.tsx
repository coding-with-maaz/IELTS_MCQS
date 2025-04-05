import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Clock, Calendar, Users, FileText, ArrowRight } from 'lucide-react';
import { writingTestsApi, WritingTest } from '@/store/api/writingTestsApi';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

export default function WritingTestsPage() {
  const [filter, setFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTest, setDeletingTest] = useState<string | null>(null);
  const [testDetails, setTestDetails] = useState<WritingTest | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: tests = [], isLoading, refetch } = writingTestsApi.useGetWritingTestsQuery();
  const [deleteTest] = writingTestsApi.useDeleteWritingTestMutation();

  const filterTests = (tests: WritingTest[]) => {
    if (filter === 'academic') {
      return tests.filter(test => test.testType === 'academic');
    } else if (filter === 'general') {
      return tests.filter(test => test.testType === 'general');
    }
    return tests;
  };

  const handleDeleteClick = (testId: string) => {
    setDeletingTest(testId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTest) return;
    
    try {
      await deleteTest(deletingTest).unwrap();
      toast({
        title: "Success",
        description: "Writing test deleted successfully",
      });
      refetch();
    } catch (error: any) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to delete test",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingTest(null);
    }
  };

  const handleViewDetails = (test: WritingTest) => {
    setTestDetails(test);
  };

  const calculateSectionCount = (test: WritingTest) => {
    const task1Count = test.sections.filter(section => section.taskType === 'task1').length;
    const task2Count = test.sections.filter(section => section.taskType === 'task2').length;
    return { task1Count, task2Count };
  };

  const calculateTotalQuestions = (test: WritingTest) => {
    return test.sections.reduce((total, section) => total + section.questions.length, 0);
  };

  return (
    <DashboardLayout title="Writing Tests">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">IELTS Writing Tests</h2>
          <p className="text-sm text-muted-foreground">
            Manage writing tests for IELTS test preparation
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/writing-tests/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create Test
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="general">General Training</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filterTests(tests).length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No writing tests found</h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'all' 
              ? 'Get started by creating your first writing test.'
              : `No ${filter} writing tests found. Try creating one or changing your filter.`}
          </p>
          <Button onClick={() => navigate('/dashboard/writing-tests/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create Test
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterTests(tests).map((test) => {
            const { task1Count, task2Count } = calculateSectionCount(test);
            const questionCount = calculateTotalQuestions(test);
            
            return (
              <Card key={test._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className="mb-2" variant={test.testType === 'academic' ? 'default' : 'secondary'}>
                      {test.testType === 'academic' ? 'Academic' : 'General'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(test)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(test._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-base">{test.testName}</CardTitle>
                  <CardDescription>
                    Created {test.createdAt ? formatDistanceToNow(new Date(test.createdAt), { addSuffix: true }) : 'recently'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{test.timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{questionCount} questions</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                      Task 1: {task1Count} section{task1Count !== 1 && 's'}
                    </div>
                    <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md">
                      Task 2: {task2Count} section{task2Count !== 1 && 's'}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate(`/dashboard/writing-tests/${test._id}`)}
                  >
                    <span>View Test</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the writing test and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Details Dialog */}
      <Dialog open={!!testDetails} onOpenChange={() => setTestDetails(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{testDetails?.testName}</DialogTitle>
            <DialogDescription>
              {testDetails?.testType === 'academic' ? 'Academic' : 'General'} Writing Test
            </DialogDescription>
          </DialogHeader>
          
          {testDetails && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Time Limit</p>
                  <p className="text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" /> 
                    {testDetails.timeLimit} minutes
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" /> 
                    {testDetails.createdAt ? format(new Date(testDetails.createdAt), 'PPP') : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Instructions</p>
                <p className="text-sm p-3 bg-muted rounded">{testDetails.instructions}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Sections</p>
                <div className="space-y-2">
                  {testDetails.sections.map((section) => (
                    <Card key={section._id}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-medium">{section.sectionName}</CardTitle>
                          <Badge variant={section.taskType === 'task1' ? 'default' : 'secondary'}>
                            {section.taskType === 'task1' ? 'Task 1' : 'Task 2'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          {section.minimumWords} words minimum • {section.timeLimit} minutes
                        </p>
                        <p className="text-xs">{section.instructions}</p>
                        {section.questions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium">Questions ({section.questions.length}):</p>
                            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                              {section.questions.map(question => (
                                <li key={question._id} className="truncate">• {question.questionText}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setTestDetails(null)}>
                  Close
                </Button>
                <Button onClick={() => navigate(`/dashboard/writing-tests/${testDetails._id}`)}>
                  View Full Test
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 