import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, PlayCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div 
      className="hero-section relative min-h-[90vh] flex items-center pt-32 pb-24 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ 
        backgroundImage: 'url(/hero-bg.jpg)', // Add this image to public folder
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60"></div>

      {/* Floating particles for visual interest */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-12 h-12 rounded-full bg-ielts-blue/20 backdrop-blur-xl animate-float opacity-70"></div>
        <div className="absolute top-[60%] left-[70%] w-16 h-16 rounded-full bg-ielts-green/20 backdrop-blur-xl animate-float opacity-70" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[80%] w-10 h-10 rounded-full bg-ielts-purple/20 backdrop-blur-xl animate-float opacity-70" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[70%] left-[20%] w-14 h-14 rounded-full bg-orange-500/20 backdrop-blur-xl animate-float opacity-70" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-5 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <span className="text-white/90 text-sm font-medium">
              Prepare for IELTS with confidence
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight opacity-0 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            Your Journey to IELTS<br className="hidden sm:block" /> Success Starts Here
          </h1>

          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10 opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            Access comprehensive practice tests and resources for all IELTS modules: 
            <span className="text-ielts-blue font-medium"> Listening</span>,
            <span className="text-ielts-green font-medium"> Reading</span>,
            <span className="text-ielts-purple font-medium"> Writing</span>, and
            <span className="text-orange-500 font-medium"> Speaking</span>.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-10 opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for IELTS practice tests..."
                className="bg-white/95 backdrop-blur-md pl-12 pr-16 py-6 rounded-full border-none shadow-lg w-full placeholder:text-gray-500 focus:ring-2 focus:ring-ielts-blue/50 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                className="absolute right-1.5 top-1.5 rounded-full bg-ielts-blue hover:bg-ielts-blue/90 p-5 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={!searchQuery.trim()}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </form>
          
          <div className="flex flex-wrap justify-center gap-5 opacity-0 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <Link to="/tests/listening">
              <Button size="lg" className="bg-ielts-blue hover:bg-ielts-blue/90 text-white py-6 px-8 font-medium rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]">
                <PlayCircle className="h-5 w-5" />
                Start Practice Test
              </Button>
            </Link>
            <Link to="/resources">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white/20 py-6 px-8 font-medium rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px]"
              >
                <BookOpen className="h-5 w-5" />
                Free Resources
              </Button>
            </Link>
          </div>

          {/* Visual indicators */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
            <div className="flex space-x-1 animate-pulse-soft">
              <span className="w-1.5 h-1.5 bg-white/80 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
