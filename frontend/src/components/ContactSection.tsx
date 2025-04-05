import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-ielts-blue/5 to-ielts-purple/5">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-scroll opacity-0 transition-all duration-700" 
               style={{ transform: 'translateY(40px)' }}>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-pink-500 uppercase bg-pink-500/10 rounded-full">
              Get In Touch
            </span>
            <h2 className="heading-lg mb-6 text-premium-black">
              We'd Love to Hear From You
            </h2>
            <p className="text-lg text-premium-gray mb-8">
              Whether you have a question about our platform, need technical support, or want to explore partnership opportunities, our team is here to help.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="p-3 rounded-full bg-ielts-blue/10 text-ielts-blue">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                  <p className="text-premium-gray">
                    <a href="mailto:contact@learnwise.com" className="animated-underline text-ielts-blue">contact@learnwise.com</a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="p-3 rounded-full bg-ielts-green/10 text-ielts-green">
                    <Phone className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                  <p className="text-premium-gray">
                    <a href="tel:+18001234567" className="animated-underline text-ielts-green">+1 (800) 123-4567</a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="p-3 rounded-full bg-ielts-purple/10 text-ielts-purple">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
                  <p className="text-premium-gray">
                    123 Education Lane<br />
                    San Francisco, CA 94107
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg animate-on-scroll opacity-0 transition-all duration-700"
               style={{ transform: 'translateX(40px)' }}>
            <h3 className="text-2xl font-semibold mb-6 text-premium-black">Send a Message</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-premium-gray mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ielts-blue focus:border-transparent outline-none transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-premium-gray mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ielts-blue focus:border-transparent outline-none transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-premium-gray mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ielts-blue focus:border-transparent outline-none transition-all duration-200"
                  placeholder="How can we help you?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-premium-gray mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ielts-blue focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full px-6 py-3 bg-ielts-blue text-white font-medium rounded-lg shadow-sm hover:bg-ielts-blue/90 focus:ring-4 focus:ring-ielts-blue/50 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
