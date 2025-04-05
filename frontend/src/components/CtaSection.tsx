import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function CtaSection() {
  const features = [
    "Full access to all practice tests",
    "Track your progress with detailed analytics",
    "Get personalized feedback on your performance",
    "Study with structured learning paths"
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-ielts-blue/5 via-ielts-green/5 to-ielts-purple/5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-ielts-blue/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ielts-purple/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100 gap-8">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 bg-ielts-blue/10 rounded-full text-ielts-blue text-sm font-medium mb-4 animate-fade-in">
              Premium Preparation
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>Ready to achieve your target IELTS band score?</h2>
            <p className="text-lg text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Start your preparation journey today with our comprehensive practice tests and get personalized feedback on your performance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 animate-fade-in-left" 
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <CheckCircle2 className="h-5 w-5 text-ielts-green" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full lg:w-auto animate-fade-in" style={{ animationDelay: '600ms' }}>
            <Link to="/login" className="w-full">
              <Button className="w-full lg:w-64 py-6 bg-ielts-blue hover:bg-ielts-blue/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                Login Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/signup" className="w-full">
              <Button variant="outline" className="w-full lg:w-64 py-6 border-2 border-ielts-blue text-ielts-blue hover:bg-ielts-blue/5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
