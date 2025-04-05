
import { CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: "Authentic Test Experience",
    description: "Practice with tests that closely resemble the format and difficulty level of the actual IELTS exam.",
  },
  {
    title: "Detailed Performance Analytics",
    description: "Get comprehensive insights into your performance across all test modules.",
  },
  {
    title: "Personalized Feedback",
    description: "Receive specific suggestions for improvement based on your practice test results.",
  },
  {
    title: "Expert-Crafted Content",
    description: "All our practice materials are designed by experienced IELTS instructors.",
  },
  {
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed progress reports.",
  },
  {
    title: "Mobile Compatibility",
    description: "Practice anytime, anywhere with our mobile-friendly platform.",
  },
];

export function FeatureSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Why Choose Our Platform</h2>
        <p className="text-gray-600 mt-4">
          Our comprehensive IELTS preparation tools are designed to help you achieve your target score
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
              <h3 className="text-lg font-semibold">{feature.title}</h3>
            </div>
            <p className="text-gray-600 ml-9">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureSection;
