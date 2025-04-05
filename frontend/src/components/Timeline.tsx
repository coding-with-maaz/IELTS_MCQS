import React from 'react';

const milestones = [
  {
    year: "2018",
    title: "Founding",
    description: "LearnWise was founded with a mission to democratize IELTS preparation.",
    color: "border-ielts-blue"
  },
  {
    year: "2019",
    title: "First Platform Launch",
    description: "Launched our initial platform with reading and listening practice tests.",
    color: "border-ielts-green"
  },
  {
    year: "2020",
    title: "Writing Assessment Tool",
    description: "Developed our AI-powered writing feedback system for essay evaluation.",
    color: "border-ielts-purple"
  },
  {
    year: "2021",
    title: "Speaking Practice Integration",
    description: "Added interactive speaking practice modules with speech recognition.",
    color: "border-orange-500"
  },
  {
    year: "2022",
    title: "Global Expansion",
    description: "Expanded our user base to over 100 countries worldwide.",
    color: "border-teal-500"
  },
  {
    year: "2023",
    title: "Complete Redesign",
    description: "Launched our completely redesigned platform with enhanced features.",
    color: "border-pink-500"
  }
];

export const Timeline = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 transition-all duration-700"
             style={{ transform: 'translateY(40px)' }}>
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-ielts-green uppercase bg-ielts-green/10 rounded-full">
            Our Journey
          </span>
          <h2 className="heading-lg mb-6 text-premium-black">
            The LearnWise Story
          </h2>
          <p className="text-lg text-premium-gray">
            From our humble beginnings to becoming a globally recognized platform, our journey has been defined by innovation and a commitment to excellence.
          </p>
        </div>
        
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 transform md:translate-x-[-50%] top-0 bottom-0 w-px bg-gray-200"></div>
          
          {/* Timeline items */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div 
                key={index} 
                className={`relative flex flex-col md:flex-row items-start gap-8 animate-on-scroll opacity-0 transition-all duration-700`}
                style={{ 
                  transform: index % 2 === 0 ? 'translateX(-40px)' : 'translateX(40px)',
                  transitionDelay: `${150 + index * 100}ms`
                }}
              >
                {/* Year marker */}
                <div className="absolute left-6 md:left-1/2 transform md:translate-x-[-50%] flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full bg-white ${milestone.color} border-2 flex items-center justify-center z-10`}>
                    <span className="text-sm font-bold text-premium-black">{milestone.year}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:ml-auto'}`}>
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-xl font-semibold mb-2 text-premium-black">{milestone.title}</h3>
                    <p className="text-premium-gray">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
