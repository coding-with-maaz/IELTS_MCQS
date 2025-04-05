import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Headphones, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Copy,
  Clock,
  FileText,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  useGetListeningTestsQuery,
  useDeleteListeningTestMutation,
  useUpdateListeningTestMutation,
  ListeningTest,
  ListeningTestResponse,
} from '@/store/api/listeningTestsApi';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGetSectionsQuery } from '@/store/api/sectionsApi';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

export default function ListeningTestsPage() {
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: testsData, isLoading, error } = useGetListeningTestsQuery();
  const { data: sectionsData, isLoading: isSectionsLoading } = useGetSectionsQuery();
  const [deleteTest] = useDeleteListeningTestMutation();
  const [updateTest] = useUpdateListeningTestMutation();
  
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [sectionSearchQuery, setSectionSearchQuery] = useState('');
  
  // Get tests array from the response
  const tests = testsData?.data?.tests || [];
  
  // Filter tests based on the current filter
  const filteredTests = filter === 'all' 
    ? tests 
    : tests.filter(test => test.difficulty === filter);

  // Get sections array from the response
  const sections = sectionsData?.data?.sections || [];

  // Filter sections based on search query
  const filteredSections = sections.filter(section => 
    !sectionSearchQuery || 
    section.name.toLowerCase().includes(sectionSearchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteTest(id).unwrap();
      toast({
        title: "Test deleted",
        description: "The listening test has been successfully deleted.",
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (test: ListeningTest) => {
    const { _id, createdAt, sections, ...testData } = test;
    try {
      await updateTest({ 
        id: _id, 
        test: {
          ...testData,
          title: `${testData.title} (Copy)`,
        }
      }).unwrap();
      
      toast({
        title: "Test duplicated", 
        description: "The listening test has been successfully duplicated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate the test. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => {
      const isSelected = prev.includes(sectionId);
      if (isSelected) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
    setOpen(false);
  };

  // if (isLoading) {
  //   return (
  //     <DashboardLayout title="Listening Tests">
  //       <div className="flex items-center justify-center h-[calc(100vh-200px)]">
  //         <Loader2 className="h-8 w-8 animate-spin" />
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  // if (error) {
  //   return (
  //     <DashboardLayout title="Listening Tests">
  //       <div className="flex items-center justify-center h-[calc(100vh-200px)]">
  //         <p className="text-red-500">Error loading tests. Please try again later.</p>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }
  
  return (
    // <DashboardLayout title="Listening Tests">
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Listening Tests</h2>
          <p className="text-sm text-muted-foreground">
            Manage all IELTS listening tests available on the platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                Select sections...
                <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Search sections..." 
                  value={sectionSearchQuery}
                  onValueChange={setSectionSearchQuery}
                />
                <CommandEmpty>No sections found.</CommandEmpty>
                <CommandGroup>
                  {filteredSections.map((section) => {
                    const isSelected = selectedSections.includes(section._id);
                    return (
                      <CommandItem
                        key={section._id}
                        onSelect={() => toggleSection(section._id)}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                            isSelected && "bg-primary text-primary-foreground"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-medium">{section.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Section
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button asChild>
            <Link to="/dashboard/listening-tests/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Test
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex items-center space-x-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Tests
        </Button>
        <Button 
          variant={filter === 'hard' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('hard')}
        >
          Hard
        </Button>
        <Button 
          variant={filter === 'medium' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('medium')}
        >
          Medium
        </Button>
        <Button 
          variant={filter === 'easy' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('easy')}
        >
          Easy
        </Button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <Card key={test._id} className="overflow-hidden">
            <div className={`h-1 ${test.difficulty === 'hard' ? 'bg-red-500' : test.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex gap-2 items-center">
                <div className={`p-1.5 rounded-full ${test.difficulty === 'hard' ? 'bg-red-100 text-red-500' : test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-500' : 'bg-green-100 text-green-500'}`}>
                  <Headphones className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="truncate max-w-[200px]">{test.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">{test.difficulty}</span>
                </div>
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/listening-tests/${test._id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/listening-tests/${test._id}/sections`}>
                      <FileText className="mr-2 h-4 w-4" /> Manage Sections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(test)}>
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => setDeleteId(test._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {test.sections.length}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {test.duration} min
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Sections</span>
                  <span className="font-medium">{test.sections.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(parseISO(test.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs ${
                  test.difficulty === 'hard'
                    ? 'text-red-600 bg-red-50'
                    : test.difficulty === 'medium'
                    ? 'text-yellow-600 bg-yellow-50'
                    : 'text-green-600 bg-green-50'
                  } px-2 py-1 rounded-full font-medium capitalize`}>
                  {test.difficulty}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSections.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedSections.map((sectionId) => {
            const section = sections.find(s => s._id === sectionId);
            return section ? (
              <Badge
                key={sectionId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span className="truncate max-w-[200px]">
                  {section.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(sectionId);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              listening test and all its associated data.
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
