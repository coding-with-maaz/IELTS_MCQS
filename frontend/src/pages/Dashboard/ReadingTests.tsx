import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  useGetReadingTestsQuery,
  useDeleteReadingTestMutation,
  useUpdateReadingTestMutation,
  ReadingTest,
} from '@/store/api/readingTestsApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGetReadingSectionsQuery } from '@/store/api/readingSectionsApi';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

const formSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  testType: z.enum(["academic", "general"]),
  timeLimit: z.string().min(1, "Time limit is required"),
});

export default function ReadingTestsPage() {
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTest, setEditingTest] = useState<ReadingTest | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: tests, isLoading, error } = useGetReadingTestsQuery();
  const { data: sectionsData, isLoading: isSectionsLoading } = useGetReadingSectionsQuery();
  const [deleteTest] = useDeleteReadingTestMutation();
  const [updateTest] = useUpdateReadingTestMutation();
  
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [sectionSearchQuery, setSectionSearchQuery] = useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testName: "",
      testType: "academic",
      timeLimit: "",
    },
  });

  // Filter tests based on the current filter
  const filteredTests = filter === 'all' 
    ? tests || [] 
    : (tests || []).filter(test => test.testType === filter);

  // Get sections array from the response
  const sections = sectionsData || [];

  // Filter sections based on search query
  const filteredSections = sections.filter(section => 
    !sectionSearchQuery || 
    section.sectionName.toLowerCase().includes(sectionSearchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteTest(id).unwrap();
      toast({
        title: "Test deleted",
        description: "The reading test has been successfully deleted.",
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

  const handleDuplicate = async (test: ReadingTest) => {
    const { _id, createdAt, ...testData } = test;
    try {
      await updateTest({ 
        id: _id, 
        test: {
          testName: `${testData.testName} (Copy)`,
          testType: testData.testType,
          sections: testData.sections.map(section => section._id),
          timeLimit: testData.timeLimit,
        }
      }).unwrap();
      
      toast({
        title: "Test duplicated", 
        description: "The reading test has been successfully duplicated.",
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

  const handleEdit = (test: ReadingTest) => {
    setEditingTest(test);
    form.reset({
      testName: test.testName,
      testType: test.testType,
      timeLimit: test.timeLimit.toString(),
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!editingTest) return;

    try {
      await updateTest({
        id: editingTest._id,
        test: {
          testName: values.testName,
          testType: values.testType,
          timeLimit: parseInt(values.timeLimit),
        },
      }).unwrap();

      toast({
        title: "Test updated",
        description: "The reading test has been successfully updated.",
      });
      setEditingTest(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the test. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Reading Tests">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Reading Tests">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-red-500">Error loading tests. Please try again later.</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Reading Tests">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reading Tests</h2>
          <p className="text-sm text-muted-foreground">
            Manage all IELTS reading tests available on the platform.
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
                          <span className="font-medium">{section.sectionName}</span>
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
            <Link to="/dashboard/reading-tests/new">
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
          variant={filter === 'academic' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('academic')}
        >
          Academic
        </Button>
        <Button 
          variant={filter === 'general' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('general')}
        >
          General
        </Button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <Card key={test._id} className="overflow-hidden">
            <div className={`h-1 ${test.testType === 'academic' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex gap-2 items-center">
                <div className={`p-1.5 rounded-full ${test.testType === 'academic' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="truncate max-w-[200px]">{test.testName}</span>
                  <span className="text-xs text-muted-foreground capitalize">{test.testType}</span>
                </div>
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(test)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/reading-tests/${test._id}/sections`}>
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
                    {test.sections.reduce((total, section) => total + section.questions.length, 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {test.timeLimit} min
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Sections</span>
                  <span className="font-medium">{test.sections.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {test.createdAt ? format(parseISO(test.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs ${
                  test.testType === 'academic'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-green-600 bg-green-50'
                  } px-2 py-1 rounded-full font-medium capitalize`}>
                  {test.testType}
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
                  {section.sectionName}
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
              reading test and all its associated data.
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

      <Dialog open={!!editingTest} onOpenChange={() => setEditingTest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reading Test</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter test name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="testType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter time limit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingTest(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 