import { BookOpen, TrendingUp, MessageCircle } from 'lucide-react';

const stats = [
  {
    title: 'Practice Tests',
    value: '40+',
    description: 'Comprehensive practice tests covering all IELTS modules',
    icon: BookOpen,
    color: 'bg-ielts-green',
  },
  {
    title: 'Success Rate',
    value: '94%',
    description: 'Of our students achieve their target band score',
    icon: TrendingUp,
    color: 'bg-ielts-blue',
  },
  {
    title: 'Expert Feedback',
    value: '24/7',
    description: 'Access to detailed performance analytics and improvement tips',
    icon: MessageCircle,
    color: 'bg-ielts-purple',
  },
];

export function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Subtle background element */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent opacity-70 pointer-events-none"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {stats.map((stat, index) => (
          <div 
            key={stat.title} 
            className="stat-card opacity-0 animate-scale-in"
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center mb-4">
              <div className={`module-icon ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">{stat.title}</h3>
            </div>
            
            <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">{stat.value}</div>
            
            <p className="text-gray-600">{stat.description}</p>
            
            {/* Decorative element */}
            <div className="absolute top-3 right-3 w-20 h-20 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-50 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;
