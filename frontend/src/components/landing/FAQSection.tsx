import { memo } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';

const faqs = [
  {
    question: 'Is Job Tracker really free?',
    answer: 'Yes! Job Tracker is completely free forever. No credit card required, no hidden fees, no premium plans. We believe everyone should have access to great job search tools.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply click "Get Started Free" and sign in with your Google account. You can start adding jobs immediately - it takes less than a minute to set up.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use Google OAuth for secure authentication, and your data is encrypted and stored safely. We never share your information with third parties.',
  },
  {
    question: 'Can I use it on mobile?',
    answer: 'Yes! Job Tracker is fully responsive and works great on desktop, tablet, and mobile devices. Access your job board from anywhere.',
  },
  {
    question: 'What features are included?',
    answer: 'All features are included: Kanban board, interview calendar, resume manager, job analytics, tags, notes, and more. Everything is free!',
  },
];

function FAQSection() {
  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 scroll-reveal">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Everything you need to know
          </p>
        </div>

        <Accordion type="single" defaultValue="item-0" className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="scroll-reveal bg-white dark:bg-slate-900">
              <AccordionTrigger>
                <span className="text-base sm:text-lg">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default memo(FAQSection);

