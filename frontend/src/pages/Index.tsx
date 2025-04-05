import { Headphones, BookOpen, FileText, Mic } from 'lucide-react';
import Navigation from '../components/Navbar';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import TestsSection from '../components/TestsSection';
import FeatureSection from '../components/FeatureSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CtaSection from '../components/CtaSection';
import FaqSection from '../components/FaqSection';
import { Footer } from '../components/Footer';
import { useGetListeningTestsQuery } from '../store/api/listeningTestsApi';
import { useGetReadingTestsQuery } from '../store/api/readingTestsApi';
import { useGetWritingTestsQuery } from '../store/api/writingTestsApi';
import { useGetSpeakingTestsQuery } from '../store/api/speakingTestsApi';
import { useGetCurrentUserQuery } from '../store/api/authApi';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  // Get authentication status
  const { data: userData } = useGetCurrentUserQuery();
  const isAuthenticated = userData?.success && !!userData?.data?.user;

  // Fetch data from all test APIs
  const { 
    data: listeningTests, 
    isLoading: isLoadingListening,
    error: listeningError 
  } = useGetListeningTestsQuery();

  const { 
    data: readingTests, 
    isLoading: isLoadingReading,
    error: readingError 
  } = useGetReadingTestsQuery();

  const { 
    data: writingTests, 
    isLoading: isLoadingWriting,
    error: writingError 
  } = useGetWritingTestsQuery();

  const { 
    data: speakingTests, 
    isLoading: isLoadingSpeaking,
    error: speakingError 
  } = useGetSpeakingTestsQuery();

  // Helper function to format test data
  const formatTestsData = (tests: any[] = [], type: string) => {
    return tests.map(test => ({
      id: test._id,
      title: test.title || test.testName,
      type: test.type || test.testType,
      description: test.description || `${type} test for IELTS preparation`,
      difficulty: test.difficulty || 'medium',
      duration: test.duration || test.timeLimit || 60,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-0">
        <Hero />
        
        <StatsSection />
        
        {isAuthenticated ? (
          <>
            <TestsSection 
              title="Listening Tests" 
              icon={<Headphones className="h-6 w-6 text-ielts-blue" />} 
              testType="listening"
              isLoading={isLoadingListening}
              error={listeningError}
              tests={listeningTests ? formatTestsData(
                Array.isArray(listeningTests) ? listeningTests : listeningTests.data?.tests,
                'Listening'
              ) : []}
            />
            
            <div className="bg-gray-50 py-16">
              <TestsSection 
                title="Reading Tests" 
                icon={<BookOpen className="h-6 w-6 text-ielts-green" />} 
                testType="reading"
                isLoading={isLoadingReading}
                error={readingError}
                tests={formatTestsData(readingTests, 'Reading')}
              />
            </div>
            
            <div className="bg-gray-50 py-16">
              <TestsSection 
                title="Writing Tests" 
                icon={<FileText className="h-6 w-6 text-ielts-purple" />} 
                testType="writing"
                isLoading={isLoadingWriting}
                error={writingError}
                tests={formatTestsData(writingTests, 'Writing')}
              />
            </div>
            
            <TestsSection 
              title="Speaking Tests" 
              icon={<Mic className="h-6 w-6 text-orange-500" />} 
              testType="speaking"
              isLoading={isLoadingSpeaking}
              error={speakingError}
              tests={formatTestsData(speakingTests, 'Speaking')}
            />
          </>
        ) : (
          <CtaSection />
        )}
        
        <FaqSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
