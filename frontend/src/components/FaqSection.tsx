import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is IELTS?",
    answer: "The International English Language Testing System (IELTS) is a standardized test designed to assess the English language proficiency of non-native English speakers. It is widely recognized for immigration, study, and work purposes in countries where English is the primary language of communication."
  },
  {
    question: "What are the different modules in IELTS?",
    answer: "IELTS consists of four modules: Listening, Reading, Writing, and Speaking. Each module tests a different aspect of English language proficiency, and you'll receive individual scores for each, as well as an overall band score."
  },
  {
    question: "How is the IELTS test scored?",
    answer: "IELTS is scored on a 9-band scale, with each band corresponding to a level of English proficiency. Band 9 represents expert users, while band 1 represents non-users. Most universities and immigration authorities require a minimum overall band score between 6.0 and 7.5."
  },
  {
    question: "How can I prepare for the IELTS test?",
    answer: "Regular practice is key to success in IELTS. Our platform offers comprehensive practice tests for all IELTS modules, along with detailed explanations and performance analytics to help you identify areas for improvement."
  },
  {
    question: "How long is the IELTS test valid?",
    answer: "IELTS test results are typically valid for two years from the date of the test. After this period, you may need to retake the test if required by the institution or organization you're applying to."
  }
];

export function FaqSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 bg-ielts-purple/10 rounded-full text-ielts-purple text-sm font-medium mb-4 animate-fade-in">
          Got Questions?
        </div>
        <h2 className="text-3xl font-bold animate-fade-in" style={{ animationDelay: '100ms' }}>Frequently Asked Questions</h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
          Find answers to common questions about IELTS and our practice platform
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className={cn(
                "border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 opacity-0 animate-fade-in",
              )}
              style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <AccordionTrigger className="text-left font-medium px-6 py-4 bg-white hover:bg-gray-50 data-[state=open]:bg-gray-50 transition-colors duration-300">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 px-6 py-4 bg-white">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default FaqSection;
