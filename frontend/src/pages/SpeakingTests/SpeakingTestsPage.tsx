import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Clock, FileText, ArrowRight } from 'lucide-react';
import { useGetSpeakingTestsQuery } from '@/store/api/speakingTestsApi';
import { Loader2 } from 'lucide-react';

export default function SpeakingTestsPage() {
  const [filter, setFilter] = useState('all');
  const { data: tests = [], isLoading, error } = useGetSpeakingTestsQuery();

  const filteredTests = filter === 'all' 
    ? tests 
    : tests.filter(test => test.testType === filter);

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
        <h1 className="text-3xl font-bold mb-2">Speaking Tests</h1>
        <p className="text-muted-foreground">
          Practice with our collection of IELTS speaking tests. Choose between different test types and improve your speaking skills.
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
          variant={filter === 'interview' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('interview')}
        >
          Interview
        </Button>
        <Button 
          variant={filter === 'presentation' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('presentation')}
        >
          Presentation
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <Card key={test._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-1 bg-orange-500"></div>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex gap-2 items-center">
                <div className="p-1.5 rounded-full bg-orange-100 text-orange-500">
                  <Mic className="h-4 w-4" />
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
                  <span className="text-muted-foreground">Parts</span>
                  <span className="font-medium flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {test.sections?.length || 0}
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
                <Link to={`/tests/speaking/${test._id}`}>
                  Start Test <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredTests.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            No speaking tests found.
          </div>
        )}
      </div>
    </div>
  );
} 