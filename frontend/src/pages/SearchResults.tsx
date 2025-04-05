import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearchTestsQuery } from '../store/api/searchApi';
import Navigation from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, BookOpen, Headphones, FileText, Mic, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data, isLoading, error } = useSearchTestsQuery(
    { query, type: selectedType === 'all' ? undefined : selectedType },
    { skip: !query }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listening':
        return <Headphones className="h-5 w-5 text-ielts-blue" />;
      case 'reading':
        return <BookOpen className="h-5 w-5 text-ielts-green" />;
      case 'writing':
        return <FileText className="h-5 w-5 text-ielts-purple" />;
      case 'speaking':
        return <Mic className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string = 'medium') => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-500 bg-green-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      case 'hard':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>
          <form onSubmit={handleSearch} className="max-w-2xl mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for IELTS practice tests..."
                className="pl-10 pr-16 py-6 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                className="absolute right-1.5 top-1.5"
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </div>
          </form>
          {data && (
            <p className="text-gray-600">
              {data.data.total} results found for "{query}"
            </p>
          )}
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="listening">Listening</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="speaking">Speaking</TabsTrigger>
          </TabsList>
        </Tabs>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load search results. Please try again later.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : !query ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a search term to find tests.</p>
          </div>
        ) : data?.data.results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.results.map((result) => (
              <Card key={result.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(result.type)}
                      <CardTitle className="text-xl">{result.title}</CardTitle>
                    </div>
                    {result.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>
                        {result.difficulty}
                      </span>
                    )}
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{result.duration} minutes</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to={`/tests/${result.type}/${result.id}`}>
                      Start Test
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults; 