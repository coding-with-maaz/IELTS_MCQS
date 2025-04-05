import React from 'react';

const values = [
  {
    title: "Inclusivity",
    description: "We design with all learners in mind, ensuring our platform is accessible regardless of background.",
    color: "bg-ielts-blue",
    icon: "🌍"
  },
  {
    title: "Excellence",
    description: "We are committed to the highest standards in educational content and user experience.",
    color: "bg-ielts-green",
    icon: "✨"
  },
  {
    title: "Innovation",
    description: "We continuously evolve our approach to incorporate the latest in educational technology.",
    color: "bg-ielts-purple",
    icon: "💡"
  },
  {
    title: "Empathy",
    description: "We understand the challenges of language learning and design our systems with care.",
    color: "bg-orange-500",
    icon: "❤️"
  },
  {
    title: "Integrity",
    description: "We maintain ethical standards in our content, data handling, and business practices.",
    color: "bg-teal-500",
    icon: "🛡️"
  },
  {
    title: "Collaboration",
    description: "We believe in the power of community and shared knowledge to enhance learning.",
    color: "bg-pink-500",
    icon: "🤝"
  }
];

export const Values = () => {
  return (
    <section className="py-20 bg-soft-gray">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 transition-all duration-700"
             style={{ transform: 'translateY(40px)' }}>
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-ielts-purple uppercase bg-ielts-purple/10 rounded-full">
            Our Values
          </span>
          <h2 className="heading-lg mb-6 text-premium-black">
            The Principles That Guide Us
          </h2>
          <p className="text-lg text-premium-gray">
            Our core values shape every aspect of our platform and guide our decision-making process. They reflect our commitment to creating a positive, effective learning environment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 animate-on-scroll opacity-0"
              style={{ 
                transform: 'translateY(40px)',
                transitionDelay: `${150 + index * 100}ms`
              }}
            >
              <div className={`${value.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl mb-6`}>
                <span className="sr-only">{value.title}</span>
                <div className="w-6 h-6"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-premium-black">{value.title}</h3>
              <p className="text-premium-gray">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
