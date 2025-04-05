import React from 'react';

export const Partners = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 transition-all duration-700"
             style={{ transform: 'translateY(40px)' }}>
          <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-teal-500 uppercase bg-teal-500/10 rounded-full">
            Our Partners
          </span>
          <h2 className="heading-lg mb-6 text-premium-black">
            Collaborating for Excellence
          </h2>
          <p className="text-lg text-premium-gray">
            We work with leading educational institutions and language testing experts to ensure our platform meets the highest standards.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {[...Array(6)].map((_, index) => (
            <div 
              key={index}
              className="grayscale hover:grayscale-0 transition-all duration-300 animate-on-scroll opacity-0"
              style={{ 
                transform: 'translateY(20px)',
                transitionDelay: `${150 + index * 50}ms`
              }}
            >
              <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-xl font-bold text-gray-400">Partner {index + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
