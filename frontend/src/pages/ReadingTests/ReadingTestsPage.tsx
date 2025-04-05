import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Clock,
  FileText,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useGetReadingTestsQuery } from '@/store/api/readingTestsApi';

export default function ReadingTestsPage() {
  const [filter, setFilter] = useState('all');
  const { data: tests, isLoading, error } = useGetReadingTestsQuery();
  
  // Filter tests based on the current filter
  const filteredTests = filter === 'all' 
    ? tests || [] 
    : (tests || []).filter(test => test.testType === filter);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-red-500">Error loading tests. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reading Tests</h1>
        <p className="text-muted-foreground">
          Practice with our collection of IELTS reading tests. Choose between academic and general training tests.
        </p>
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
          <Card key={test._id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
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
              </div>
              
              <Button asChild className="w-full">
                <Link to={`/tests/reading/${test._id}`}>
                  Start Test <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 