import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Pencil, Trash2, FileAudio, FileText, Image } from 'lucide-react';
import {
  useGetSpeakingSectionsQuery,
  useCreateSpeakingSectionMutation,
  useUpdateSpeakingSectionMutation,
  useDeleteSpeakingSectionMutation,
  SpeakingSection
} from '@/store/api/speakingSectionsApi';

const formSchema = z.object({
  sectionName: z.string().min(1, 'Section name is required'),
  partType: z.enum(['part1', 'part2', 'part3'], {
    required_error: 'Part type is required',
  }),
  instructions: z.string().min(1, 'Instructions are required'),
  timeLimit: z.coerce.number().positive('Time limit must be positive').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SpeakingSectionsPage() {
  const { data: sections = [], isLoading: isLoadingSections, refetch } = useGetSpeakingSectionsQuery();
  const [createSection, { isLoading: isCreating }] = useCreateSpeakingSectionMutation();
  const [updateSection, { isLoading: isUpdating }] = useUpdateSpeakingSectionMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSpeakingSectionMutation();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sectionName: '',
      partType: 'part1',
      instructions: '',
      timeLimit: 2, // Default time limit for speaking sections
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset();
      setEditingSectionId(null);
      setSelectedAudio(null);
      setSelectedPdf(null);
      setSelectedImage(null);
    }
  }, [isDialogOpen, form]);

  // Set form values when editing
  useEffect(() => {
    if (editingSectionId) {
      const section = sections.find(s => s._id === editingSectionId);
      if (section) {
        form.setValue('sectionName', section.sectionName);
        form.setValue('partType', section.partType);
        form.setValue('instructions', section.instructions);
        if (section.timeLimit) {
          form.setValue('timeLimit', section.timeLimit);
        }
      }
    }
  }, [editingSectionId, sections, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      if (editingSectionId) {
        // Update existing section
        await updateSection({
          id: editingSectionId,
          section: {
            ...values,
            audio: selectedAudio || undefined,
            pdf: selectedPdf || undefined,
            image: selectedImage || undefined,
          }
        }).unwrap();
        toast({
          title: "Success",
          description: "Speaking section updated successfully",
        });
      } else {
        // Create new section - explicitly provide required fields to satisfy TypeScript
        await createSection({
          sectionName: values.sectionName,
          partType: values.partType,
          instructions: values.instructions,
          timeLimit: values.timeLimit,
          audio: selectedAudio || undefined,
          pdf: selectedPdf || undefined,
          image: selectedImage || undefined,
        }).unwrap();
        toast({
          title: "Success",
          description: "Speaking section created successfully",
        });
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Error saving section:', error);
      if (error.status === 401) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
      } else if (error.status === 403) {
        toast({
          title: "Permission Error",
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
          description: error.data?.message || "Failed to save section. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
      try {
        await deleteSection(id).unwrap();
        toast({
          title: "Success",
          description: "Section deleted successfully",
        });
        refetch();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.data?.message || "Failed to delete section",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (section: SpeakingSection) => {
    setEditingSectionId(section._id);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'pdf' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'audio') setSelectedAudio(file);
      else if (type === 'pdf') setSelectedPdf(file);
      else if (type === 'image') setSelectedImage(file);
    }
  };

  const getPartTypeLabel = (type: string) => {
    switch (type) {
      case 'part1': return 'Part 1 - Introduction and Interview';
      case 'part2': return 'Part 2 - Individual Long Turn';
      case 'part3': return 'Part 3 - Two-way Discussion';
      default: return type;
    }
  };

  const getFileUrl = (file: FileInfo | undefined, type: 'test' | 'submission') => {
    if (!file) return null;
    return `${import.meta.env.VITE_API_URL}/speaking-sections/audio/${type}/${file.filename}`;
  };

  const isLoading = isLoadingSections || isCreating || isUpdating || isDeleting;

  return (
    <DashboardLayout title="Speaking Sections">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">IELTS Speaking Sections</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSectionId ? 'Edit' : 'Add'} Speaking Section</DialogTitle>
                <DialogDescription>
                  Fill in the details below to {editingSectionId ? 'update' : 'create'} a speaking section.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sectionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Speaking Part 1: Hobbies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="partType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a part type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="part1">Part 1 - Introduction and Interview</SelectItem>
                            <SelectItem value="part2">Part 2 - Individual Long Turn</SelectItem>
                            <SelectItem value="part3">Part 3 - Two-way Discussion</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter instructions for the speaking section" 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
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
                          <Input 
                            type="number" 
                            placeholder="2"
                            min={1}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel>Audio File (Instructions/Questions)</FormLabel>
                    <Input 
                      type="file" 
                      accept="audio/*" 
                      onChange={(e) => handleFileChange(e, 'audio')}
                    />
                    {editingSectionId && !selectedAudio && sections.find(s => s._id === editingSectionId)?.audioFile && (
                      <div className="text-sm text-gray-500">
                        Current audio file will be retained unless a new one is uploaded
                      </div>
                    )}
                    {selectedAudio && (
                      <div className="text-sm text-green-600">
                        New file selected: {selectedAudio.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>PDF File (Optional)</FormLabel>
                    <Input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => handleFileChange(e, 'pdf')}
                    />
                    {editingSectionId && !selectedPdf && sections.find(s => s._id === editingSectionId)?.pdf && (
                      <div className="text-sm text-gray-500">
                        Current PDF will be retained unless a new one is uploaded
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Image File (Optional)</FormLabel>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'image')}
                    />
                    {editingSectionId && !selectedImage && sections.find(s => s._id === editingSectionId)?.image && (
                      <div className="text-sm text-gray-500">
                        Current image will be retained unless a new one is uploaded
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full mt-4"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingSectionId ? 'Update' : 'Create'} Section
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingSections ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center my-12">
            <p className="text-gray-500 mb-4">No speaking sections found.</p>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add Your First Section
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card key={section._id} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{section.sectionName}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(section)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(section._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    <div>
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {getPartTypeLabel(section.partType)}
                      </span>
                      {section.timeLimit && (
                        <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium ml-2">
                          {section.timeLimit} minutes
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{section.instructions}</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex justify-between w-full text-sm text-gray-500">
                    <div className="flex items-center">
                      {section.audioFile && (
                        <span className="flex items-center mr-3" title={section.audioFile.filename}>
                          <FileAudio className="h-4 w-4 mr-1" />
                          <a 
                            href={getFileUrl(section.audioFile, 'test')}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Audio
                          </a>
                        </span>
                      )}
                      {section.pdf && (
                        <span className="flex items-center mr-3" title={section.pdf.filename}>
                          <FileText className="h-4 w-4 mr-1" />
                          <a 
                            href={`${import.meta.env.VITE_API_URL}/uploads/${section.pdf.path}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            PDF
                          </a>
                        </span>
                      )}
                      {section.image && (
                        <span className="flex items-center" title={section.image.filename}>
                          <Image className="h-4 w-4 mr-1" />
                          <a 
                            href={`${import.meta.env.VITE_API_URL}/uploads/${section.image.path}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Image
                          </a>
                        </span>
                      )}
                    </div>
                    <div>Created: {new Date(section.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 