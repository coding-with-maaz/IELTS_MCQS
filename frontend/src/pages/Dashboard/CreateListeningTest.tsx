import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useCreateListeningTestMutation, CreateListeningTestRequest } from '@/store/api/listeningTestsApi';
import { Section, useGetSectionsQuery } from '@/store/api/sectionsApi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const),
  type: z.enum(['academic', 'general'] as const),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
});

type FormData = z.infer<typeof formSchema>;

interface CreateListeningTestData extends FormData {
  sections: Section[];
}

export default function CreateListeningTest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [createTest] = useCreateListeningTestMutation();
  const { data: sectionsResponse, isLoading: isLoadingSections } = useGetSectionsQuery();

  // Check authentication and admin role on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this page',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can create tests',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
  }, [navigate, toast]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'medium' as const,
      type: 'academic' as const,
      duration: 30,
    },
  });

  // Extract sections from API response
  const sections = sectionsResponse?.data || [];
  
  // Filter available sections
  const availableSections = sections.filter(
    section => !selectedSections.includes(section._id)
  );

  const onSubmit = async (values: FormData) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a test',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        toast({
          title: 'Error',
          description: 'Only administrators can create tests',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      if (selectedSections.length === 0) {
        toast({
          title: 'Error',
          description: 'Please add at least one section to the test',
          variant: 'destructive',
        });
        return;
      }

      if (selectedSections.length > 4) {
        toast({
          title: 'Error',
          description: 'A test cannot have more than 4 sections',
          variant: 'destructive',
        });
        return;
      }

      // Create the test data with all required fields
      const testData: CreateListeningTestRequest = {
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        type: values.type,
        duration: values.duration,
        sections: selectedSections
      };

      console.log('Sending test data:', testData);
      console.log('Using auth token:', token);

      const response = await createTest(testData).unwrap();
      console.log('Create test response:', response);

      if (response.success) {
        toast({
          title: 'Success',
          description: response.message || 'Listening test created successfully',
        });
        navigate('/dashboard/listening-tests');
      } else {
        throw new Error(response.message || 'Failed to create test');
      }
    } catch (error: any) {
      console.error('Error creating test:', error);
      
      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        toast({
          title: 'Authentication Error',
          description: 'You are not authorized to create tests. Please log in with an admin account.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      toast({
        title: 'Error',
        description: error.data?.message || error.message || 'Failed to create listening test',
        variant: 'destructive',
      });
    }
  };

  const handleAddSection = (sectionId: string) => {
    setSelectedSections(prev => [...prev, sectionId]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSelectedSections(prev => prev.filter(id => id !== sectionId));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedSections(items);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Listening Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter test title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter test description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="general">General Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoadingSections || availableSections.length === 0}
              >
                Create Test
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Test Sections</h2>
          
          {/* Available Sections */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Available Sections</h3>
            <div className="space-y-2">
              {availableSections.map(section => (
                <div
                  key={section._id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <span>{section.sectionName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddSection(section._id)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Sections */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Sections ({selectedSections.length})
            </h3>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {selectedSections.map((sectionId, index) => {
                      const section = sections.find(s => s._id === sectionId);
                      if (!section) return null;

                      return (
                        <Draggable
                          key={sectionId}
                          draggableId={sectionId}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <span>{section.sectionName}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSection(sectionId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
} 