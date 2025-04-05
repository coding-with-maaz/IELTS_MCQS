import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Headphones, Clock, FileText, ArrowLeft, Download, HelpCircle, FileCheck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useGetListeningTestQuery, type ListeningTest, type SectionData } from '@/store/api/listeningTestsApi';
import Navigation from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SectionCardProps {
  section: SectionData;
  index: number;
}

// Helper function to download files
const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
};

// Section Card Component
function SectionCard({ section, index }: SectionCardProps) {
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    if (!section.pdf) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No PDF available for this section',
      });
      return;
    }

    try {
      await downloadFile(`http://backend.abspak.com/${section.pdf}`, `${section.sectionName}.pdf`);
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download PDF',
      });
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-900">
              {index + 1}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {section.sectionName}
            </p>
            <p className="text-sm text-gray-500">
              {section.questionCount} Questions
            </p>
            {section.description && (
              <p className="text-xs text-gray-500 mt-1">
                {section.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {section.audio && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Headphones className="h-4 w-4" />
              Audio
            </div>
          )}
          {section.pdf && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-gray-500 flex items-center gap-1"
              onClick={handleDownloadPdf}
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ListeningTestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useGetListeningTestQuery(id!);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load test details',
      });
      navigate('/tests/listening');
    }
  }, [error, toast, navigate]);

  const handleDownloadAnswerSheet = async () => {
    if (!response?.data?.test?.answerSheet) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No answer sheet available for this test',
      });
      return;
    }

    try {
      await downloadFile(
        `http://backend.abspak.com/${response.data.test.answerSheet}`,
        `${response.data.test.title}_answer_sheet.pdf`
      );
      toast({
        title: 'Success',
        description: 'Answer sheet downloaded successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download answer sheet',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  const test = response?.data?.test;

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Test Not Found</h2>
            <p className="mt-2 text-gray-600">The test you're looking for doesn't exist.</p>
            <Button
              variant="link"
              className="mt-4"
              onClick={() => navigate('/tests/listening')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/tests/listening')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Button>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{test.title}</CardTitle>
                    <CardDescription className="mt-2">{test.description}</CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    test.type === 'academic' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {test.type} Test
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{test.duration} minutes</p>
                      <p className="text-sm text-gray-500">Duration</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{test.totalQuestions} Questions</p>
                      <p className="text-sm text-gray-500">Total Questions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{test.difficulty}</p>
                      <p className="text-sm text-gray-500">Difficulty</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Test Sections</h3>
                  <div className="space-y-4">
                    {test.sectionsData.map((section, index) => (
                      <SectionCard 
                        key={section._id} 
                        section={section}
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-4">
                  {/* <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleDownloadAnswerSheet}
                  >
                    <Download className="h-4 w-4" />
                    Download Answer Sheet
                  </Button> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Section PDFs
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {test.sectionsData.map((section, index) => (
                        section.pdf && (
                          <DropdownMenuItem
                            key={section._id}
                            onClick={() => {
                              downloadFile(
                                `http://backend.abspak.com/${section.pdf}`,
                                `${section.sectionName}.pdf`
                              ).then(() => {
                                toast({
                                  title: 'Success',
                                  description: `${section.sectionName} PDF downloaded successfully`,
                                });
                              }).catch(() => {
                                toast({
                                  variant: 'destructive',
                                  title: 'Error',
                                  description: `Failed to download ${section.sectionName} PDF`,
                                });
                              });
                            }}
                          >
                            Section {index + 1}: {section.sectionName}
                          </DropdownMenuItem>
                        )
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Instructions
                  </Button>
                </div>
                
                <Button 
                  className="gap-2" 
                  size="lg"
                  onClick={() => navigate(`/tests/listening/${test._id}/take`)}
                >
                  <Headphones className="h-4 w-4" />
                  Start Test
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default ListeningTestDetails; 