import React from 'react';
import { GraduationCap, Globe, Target } from 'lucide-react';

export const Mission = () => {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-150" 
               style={{ transform: 'translateY(40px)' }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-ielts-blue uppercase bg-ielts-blue/10 rounded-full">
              Our Mission
            </span>
            <h2 className="heading-lg mb-6 text-premium-black">
              Bridging Language Barriers Around the World
            </h2>
            <p className="text-lg text-premium-gray mb-8">
              At LearnWise, we believe in the power of language proficiency to open doors to global opportunities. Our mission is to democratize access to high-quality IELTS preparation materials, making them accessible to learners worldwide.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="p-3 rounded-full bg-ielts-blue/10 text-ielts-blue">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Educational Excellence</h3>
                  <p className="text-premium-gray">
                    We're committed to providing the most accurate, comprehensive and up-to-date IELTS preparation materials aligned with official exam standards.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="p-3 rounded-full bg-ielts-green/10 text-ielts-green">
                    <Globe className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Global Accessibility</h3>
                  <p className="text-premium-gray">
                    We design our platform to be accessible to learners from diverse cultural backgrounds and technological capabilities.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="p-3 rounded-full bg-ielts-purple/10 text-ielts-purple">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Continuous Innovation</h3>
                  <p className="text-premium-gray">
                    We constantly evolve our methods and technology to provide the most effective learning experience possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-on-scroll opacity-0 transition-all duration-700 delay-300"
               style={{ transform: 'translateX(40px)' }}>
            <div className="relative z-10 overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Students studying together" 
                className="w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-ielts-blue/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-ielts-purple/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
