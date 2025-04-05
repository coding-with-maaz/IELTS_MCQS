
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "International Student",
    rating: 5,
    testimonial: "The practice tests on this platform were incredibly helpful in my IELTS preparation. The detailed feedback helped me identify my weaknesses and improve. I achieved a band score of 8.0!",
    location: "United Kingdom"
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    role: "Medical Professional",
    rating: 5,
    testimonial: "As a doctor preparing for international relocation, I needed a high IELTS score. The practice materials here were comprehensive and authentic. Achieved my target score on the first attempt!",
    location: "United Arab Emirates"
  },
  {
    id: 3,
    name: "Mei Lin",
    role: "Graduate Student",
    rating: 4,
    testimonial: "The listening tests were particularly helpful as they closely matched the actual exam format. The platform's interface is intuitive and performance tracking is excellent.",
    location: "Singapore"
  },
  {
    id: 4,
    name: "Carlos Rodriguez",
    role: "IT Professional",
    rating: 5,
    testimonial: "I was struggling with the writing module until I found this platform. The detailed feedback and sample answers helped me understand what examiners look for.",
    location: "Spain"
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const maxIndex = Math.ceil(testimonials.length / itemsPerPage) - 1;

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">What Our Students Say</h2>
        <p className="text-gray-600 mt-4">
          Success stories from students who achieved their target IELTS scores
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md flex flex-col animate-scale-in"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4 flex-grow">"{testimonial.testimonial}"</p>
              <div className="mt-4">
                <p className="font-semibold">{testimonial.name}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                  <span>{testimonial.role}</span>
                  <span>{testimonial.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length > itemsPerPage && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext} 
              disabled={currentIndex === maxIndex}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
