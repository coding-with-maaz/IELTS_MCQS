import React from 'react';

const teamMembers = [
  {
    name: "Dr. Emily Chen",
    role: "Founder & CEO",
    bio: "Former IELTS examiner with 15+ years of experience in language education.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Michael Rodriguez",
    role: "Chief Learning Officer",
    bio: "PhD in Educational Technology with expertise in adaptive learning systems.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Sarah Kim",
    role: "Head of Content",
    bio: "Linguistics specialist with experience developing materials for Cambridge English.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "James Wilson",
    role: "CTO",
    bio: "Former Google engineer passionate about using technology to enhance education.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  }
];

export const Team = () => {
  return (
    <section className="py-20 bg-soft-gray">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 transition-all duration-700"
             style={{ transform: 'translateY(40px)' }}>
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-orange-500 uppercase bg-orange-500/10 rounded-full">
            Our Team
          </span>
          <h2 className="heading-lg mb-6 text-premium-black">
            Meet the People Behind LearnWise
          </h2>
          <p className="text-lg text-premium-gray">
            Our diverse team of educators, technologists, and language experts is united by a passion for helping learners achieve their goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="group animate-on-scroll opacity-0 transition-all duration-700"
              style={{ 
                transform: 'translateY(40px)',
                transitionDelay: `${150 + index * 100}ms`
              }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1 text-premium-black">{member.name}</h3>
                <p className="text-ielts-blue mb-3">{member.role}</p>
                <p className="text-premium-gray mt-auto">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
