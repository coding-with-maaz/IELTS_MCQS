import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, ArrowRight, LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Test {
  id: string;
  title: string;
  type: string;
  description: string;
  difficulty: string;
  duration: number;
}

interface TestsSectionProps {
  title: string;
  icon: ReactNode;
  testType: string;
  isLoading?: boolean;
  error?: any;
  tests?: Test[];
}

const TestsSection = ({ title, icon, testType, isLoading, error, tests = [] }: TestsSectionProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-500 bg-green-50 border border-green-100';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50 border border-yellow-100';
      case 'hard':
        return 'text-red-500 bg-red-50 border border-red-100';
      default:
        return 'text-blue-500 bg-blue-50 border border-blue-100';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load {title}. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getTestTypeColor = () => {
    switch (testType) {
      case 'listening':
        return 'from-ielts-blue/5 to-transparent';
      case 'reading':
        return 'from-ielts-green/5 to-transparent';
      case 'writing':
        return 'from-ielts-purple/5 to-transparent';
      case 'speaking':
        return 'from-orange-500/5 to-transparent';
      default:
        return 'from-gray-100 to-transparent';
    }
  };

  const getTestTypeBorderColor = () => {
    switch (testType) {
      case 'listening':
        return 'border-ielts-blue/20';
      case 'reading':
        return 'border-ielts-green/20';
      case 'writing':
        return 'border-ielts-purple/20';
      case 'speaking':
        return 'border-orange-500/20';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <section className={cn(
      "container mx-auto px-4 py-16 relative overflow-hidden",
    )}>
      {/* Background gradient based on test type */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-64 bg-gradient-to-b opacity-70",
        getTestTypeColor()
      )}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="animate-fade-in-left">
              {icon}
            </div>
            <h2 className="text-2xl font-bold animate-fade-in-left" style={{ animationDelay: '100ms' }}>
              {title}
            </h2>
          </div>
          <Button asChild className="animate-fade-in-right">
            <Link to={`/tests/${testType}`} className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="flex flex-col animate-pulse">
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
            ))
          ) : tests.length > 0 ? (
            // Actual test cards
            tests.slice(0, 3).map((test, index) => (
              <Card 
                key={test.id} 
                className={cn(
                  "flex flex-col test-card animate-scale-in relative overflow-hidden border",
                  getTestTypeBorderColor()
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Subtle gradient background */}
                <div className={cn(
                  "absolute inset-0 opacity-30 bg-gradient-to-br",
                  getTestTypeColor()
                )}></div>
                
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{test.title}</CardTitle>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty}
                    </span>
                  </div>
                  <CardDescription className="mt-2">{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration} minutes</span>
                  </div>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Button 
                    className={cn(
                      "w-full transition-all duration-300",
                      testType === 'listening' && "bg-ielts-blue hover:bg-ielts-blue/90",
                      testType === 'reading' && "bg-ielts-green hover:bg-ielts-green/90",
                      testType === 'writing' && "bg-ielts-purple hover:bg-ielts-purple/90",
                      testType === 'speaking' && "bg-orange-500 hover:bg-orange-500/90"
                    )}
                    asChild
                  >
                    <Link to={`/tests/${testType}/${test.id}`}>
                      Start Test
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            // No tests available
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No {title} available at the moment.</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/resources">Browse Resources</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestsSection;
