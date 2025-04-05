import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, Calendar, Clock, User, FileAudio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  useGetSpeakingTestsQuery, 
  useDeleteSpeakingTestMutation,
  SpeakingTest
} from '@/store/api/speakingTestsApi';
import { Badge } from '@/components/ui/badge';
import { useGetUserSubmissionsQuery } from '@/store/api/submittedSpeakingTestsApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
}

export default function SpeakingTestsPage() {
  const { data: tests = [], isLoading, refetch } = useGetSpeakingTestsQuery();
  const [deleteTest, { isLoading: isDeleting }] = useDeleteSpeakingTestMutation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const { isAdmin } = useSelector((state: RootState) => ({
    isAdmin: state.auth.user?.role === 'admin'
  }));
  const { data: submissions = [] } = useGetUserSubmissionsQuery(undefined, { skip: isAdmin });

  const getFileUrl = (file: FileInfo | undefined, type: 'test' | 'submission') => {
    if (!file) return null;
    return `${import.meta.env.VITE_API_URL}/speaking-tests/audio/${type}/${file.filename}`;
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTest(id).unwrap();
      setConfirmDelete(null);
      toast({
        title: "Success",
        description: "Speaking test deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to delete test",
        variant: "destructive",
      });
    }
  };

  const createNewTest = () => {
    navigate("/dashboard/speaking-tests/new");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isTestAttempted = (testId: string) => {
    return submissions.some(submission => submission.test._id === testId);
  };

  return (
    <DashboardLayout title="Speaking Tests">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">IELTS Speaking Tests</h1>
          {isAdmin && (
            <Button onClick={createNewTest} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Test
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center my-12">
            <p className="text-gray-500 mb-4">No speaking tests found.</p>
            {isAdmin && (
              <Button 
                onClick={createNewTest} 
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create Your First Test
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card key={test._id} className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{test.testName}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(test.createdAt)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="capitalize">
                        {test.testType} Test
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.timeLimit} min
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {test.sections?.length || 0} sections
                      </Badge>
                      {test.audioFile && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <FileAudio className="h-3 w-3" />
                          <a 
                            href={getFileUrl(test.audioFile, 'test')}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Audio
                          </a>
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {test.instructions || "No instructions provided."}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 space-x-2">
                  {isAdmin ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/dashboard/speaking-tests/edit/${test._id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Dialog open={confirmDelete === test._id} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => setConfirmDelete(test._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to delete "{test.testName}"? This action cannot be undone.</p>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                              variant="outline"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(test._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Button 
                      variant={isTestAttempted(test._id) ? "outline" : "default"}
                      className="w-full"
                      onClick={() => navigate(`/speaking/test/${test._id}`)}
                    >
                      {isTestAttempted(test._id) ? (
                        <>
                          <User className="h-4 w-4 mr-2" />
                          View My Attempts
                        </>
                      ) : (
                        <>
                          <FileAudio className="h-4 w-4 mr-2" />
                          Take Test
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 