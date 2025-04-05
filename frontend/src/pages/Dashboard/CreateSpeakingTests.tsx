import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, ChevronLeft, FileAudio, Clock, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetSpeakingSectionsQuery,
  SpeakingSection 
} from '@/store/api/speakingSectionsApi';
import { 
  useCreateSpeakingTestMutation, 
  useGetSpeakingTestQuery, 
  useUpdateSpeakingTestMutation 
} from '@/store/api/speakingTestsApi';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface FileInfo {
  filename: string;
  path: string;
  mimetype: string;
}

export default function CreateSpeakingTests() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  
  const { toast } = useToast();
  
  // Form state
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState<'academic' | 'general'>('academic');
  const [instructions, setInstructions] = useState('');
  const [timeLimit, setTimeLimit] = useState(15); // Default 15 minutes for speaking test
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Queries
  const { data: sections = [], isLoading: isLoadingSections } = useGetSpeakingSectionsQuery();
  const { data: testData, isLoading: isLoadingTest } = useGetSpeakingTestQuery(id || '', { 
    skip: !isEditMode 
  });
  const [createTest] = useCreateSpeakingTestMutation();
  const [updateTest] = useUpdateSpeakingTestMutation();
  
  // Load test data when editing
  useEffect(() => {
    if (isEditMode && testData) {
      setTestName(testData.testName);
      setTestType(testData.testType);
      setInstructions(testData.instructions);
      setTimeLimit(testData.timeLimit);
      if (testData.sections) {
        setSelectedSections(testData.sections.map(section => section._id));
      }
    }
  }, [isEditMode, testData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate
      if (!testName || !instructions) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if at least one section is selected
      if (selectedSections.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one section",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const formData = {
        testName,
        testType,
        instructions,
        timeLimit,
        sections: selectedSections,
        audioFile: audioFile || undefined,
      };
      
      if (isEditMode) {
        await updateTest({ 
          id: id!, 
          test: formData 
        }).unwrap();
        toast({
          title: "Success",
          description: "Speaking test updated successfully",
        });
      } else {
        await createTest(formData).unwrap();
        toast({
          title: "Success",
          description: "Speaking test created successfully",
        });
      }
      
      navigate('/dashboard/speaking-tests');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to save test",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };
  
  const filteredSections = sections.filter(section => 
    section.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.instructions.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getPartTypeLabel = (type: string) => {
    switch (type) {
      case 'part1': return 'Part 1 - Introduction and Interview';
      case 'part2': return 'Part 2 - Individual Long Turn';
      case 'part3': return 'Part 3 - Two-way Discussion';
      default: return type;
    }
  };
  
  const isLoading = isLoadingSections || (isEditMode && isLoadingTest);
  
  const getFileUrl = (file: FileInfo | undefined, type: 'test' | 'submission') => {
    if (!file) return null;
    return `${import.meta.env.VITE_API_URL}/speaking-tests/audio/${type}/${file.filename}`;
  };
  
  return (
    <DashboardLayout title={isEditMode ? "Edit Speaking Test" : "Create Speaking Test"}>
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/dashboard/speaking-tests')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? "Edit Speaking Test" : "Create New Speaking Test"}
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Test Details */}
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testName">Test Name*</Label>
                    <Input
                      id="testName"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="e.g., IELTS Speaking Test 1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Test Type*</Label>
                    <RadioGroup 
                      value={testType} 
                      onValueChange={(value) => setTestType(value as 'academic' | 'general')}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="academic" id="academic" />
                        <Label htmlFor="academic">Academic</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general">General Training</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)*</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      min={1}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instructions">Instructions*</Label>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Enter test instructions here..."
                      className="h-32"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="audioFile">Audio Instructions (Optional)</Label>
                    <Input
                      id="audioFile"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                    />
                    {isEditMode && testData?.audioFile && !audioFile && (
                      <p className="text-sm text-gray-500 mt-2">
                        Current audio file will be retained unless a new one is uploaded
                      </p>
                    )}
                    {audioFile && (
                      <p className="text-sm text-green-500 mt-2">
                        New audio selected: {audioFile.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Test' : 'Create Test'}
                </Button>
              </div>
              
              {/* Right column - Section Selection */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <Label>Speaking Sections</Label>
                  <div className="mt-2 relative">
                    <Input
                      placeholder="Search sections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                
                <div className="space-y-4 mt-2">
                  <p className="text-sm text-gray-500">
                    Select speaking sections to include in this test. A complete IELTS speaking test should include at least one part from each section (Part 1, Part 2, and Part 3).
                  </p>
                  
                  {filteredSections.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                      No speaking sections found. Please create sections first.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {['part1', 'part2', 'part3'].map(partType => {
                        const partSections = filteredSections.filter(s => s.partType === partType);
                        if (partSections.length === 0) return null;
                        
                        return (
                          <div key={partType} className="space-y-2">
                            <h3 className="font-medium">{getPartTypeLabel(partType)}</h3>
                            <div className="grid grid-cols-1 gap-2">
                              {partSections.map((section) => (
                                <Card
                                  key={section._id}
                                  className={`cursor-pointer transition-all ${
                                    selectedSections.includes(section._id)
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'hover:border-gray-300'
                                  }`}
                                  onClick={() => toggleSection(section._id)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium">{section.sectionName}</p>
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                          {section.instructions}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        {section.timeLimit && (
                                          <Badge variant="outline" className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {section.timeLimit} min
                                          </Badge>
                                        )}
                                        {section.audioFile && (
                                          <Badge variant="outline" className="flex items-center gap-1">
                                            <FileAudio className="h-3 w-3" />
                                            <a 
                                              href={getFileUrl(section.audioFile, 'test')}
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="hover:underline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                window.open(getFileUrl(section.audioFile, 'test'), '_blank');
                                              }}
                                            >
                                              Audio
                                            </a>
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <p className="font-medium">Selected Sections: {selectedSections.length}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSections.map(id => {
                      const section = sections.find(s => s._id === id);
                      if (!section) return null;
                      
                      return (
                        <Badge 
                          key={id}
                          variant="secondary"
                          className="px-3 py-1 cursor-pointer hover:bg-gray-200"
                          onClick={() => toggleSection(id)}
                        >
                          {section.sectionName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
} 