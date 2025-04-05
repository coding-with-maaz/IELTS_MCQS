import { BookOpen, Users, Target, Award, Clock, Brain, Globe, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Comprehensive Practice Tests",
    description: "Access a wide range of practice tests for all IELTS modules - Listening, Reading, Writing, and Speaking."
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Targeted Preparation",
    description: "Focus on specific areas with our specialized practice materials and detailed feedback."
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Real Exam Simulation",
    description: "Experience authentic IELTS test conditions with our timed practice sessions."
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "Smart Learning",
    description: "Track your progress and identify areas for improvement with our analytics dashboard."
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Global Community",
    description: "Join a worldwide community of IELTS aspirants and share your learning journey."
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Performance Analytics",
    description: "Get detailed insights into your performance and track your improvement over time."
  }
];

const stats = [
  { number: "10,000+", label: "Active Users" },
  { number: "500+", label: "Practice Tests" },
  { number: "95%", label: "Success Rate" },
  { number: "24/7", label: "Support" }
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              About ABS IELTS
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Empowering students worldwide to achieve their IELTS goals through comprehensive practice and expert guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Our Mission</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Making IELTS Success Accessible to All
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              At ABS IELTS, we believe that quality IELTS preparation should be accessible to everyone. 
              Our platform combines cutting-edge technology with proven learning methodologies to help you achieve your desired band score.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="relative p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold">{stat.number}</div>
                <div className="mt-2 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ready to start your IELTS journey?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join thousands of successful students who have achieved their IELTS goals with us.
            </p>
            <div className="mt-8">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 