import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Clock, FileText, Info, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useGetListeningTestsQuery, type ListeningTest } from '@/store/api/listeningTestsApi';
import { useGetSectionsQuery, type Section } from '@/store/api/sectionsApi';
import { useGetQuestionsQuery, type Question } from '@/store/api/questionsApi';
import Navigation from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TestCardProps {
  test: ListeningTest;
}

export function ListeningTestsPage() {
  const [filter, setFilter] = useState<'all' | 'academic' | 'general'>('all');
  const { data: response, isLoading, error } = useGetListeningTestsQuery();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load listening tests',
      });
    }
  }, [error, toast]);

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

  const tests = response?.data?.tests || [];

  // Filter tests based on selected tab
  const filteredTests = filter === 'all' 
    ? tests 
    : tests.filter(test => test.type === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">IELTS Listening Tests</h1>
                <p className="mt-2 text-lg text-gray-600">
                  Practice your listening skills with our comprehensive collection of IELTS-style tests
                </p>
              </div>
              <div className="hidden sm:block">
                <Button className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Exam Guide</span>
                </Button>
              </div>
            </div>
          </header>
          
          <Tabs defaultValue="all" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger 
                  value="all" 
                  onClick={() => setFilter('all')}
                >
                  All Tests
                </TabsTrigger>
                {/* <TabsTrigger 
                  value="academic" 
                  onClick={() => setFilter('academic')}
                >
                  Academic
                </TabsTrigger>
                <TabsTrigger 
                  value="general" 
                  onClick={() => setFilter('general')}
                >
                  General Training
                </TabsTrigger> */}
              </TabsList>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <TestCard key={test._id} test={test} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="academic" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <TestCard key={test._id} test={test} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="general" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <TestCard key={test._id} test={test} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Test Card Component
function TestCard({ test }: TestCardProps) {
  const getTestTypeColor = (type: 'academic' | 'general') => {
    return type === 'academic' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1.5 ${test.type === 'academic' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-start space-x-3">
          <div className={`p-2 mt-0.5 rounded-full flex-shrink-0 ${getTestTypeColor(test.type)}`}>
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <div className="truncate">{test.title}</div>
            <p className="text-xs text-gray-500 font-normal mt-1 capitalize">{test.type} Test</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{test.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>{test.sections.length * 10} questions</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Link to={`/tests/listening/${test._id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-focus">
              <span>Start Test</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default ListeningTestsPage; 