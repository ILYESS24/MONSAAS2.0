import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqItems = [
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 2-4 weeks in advance for standard projects. For larger enterprise implementations, 4-8 weeks lead time is ideal to ensure proper planning and resource allocation."
  },
  {
    question: "How much does the service cost, and what is included?",
    answer: "Our pricing is transparent and based on project scope. Each plan includes strategy consultation, implementation, training materials, and dedicated support. Contact us for a custom quote tailored to your specific needs."
  },
  {
    question: "What if I don't have a technical team or any technical knowledge?",
    answer: "That's not a problem at all. Our process is built for business owners and teams who have no technical background. We explain every step in plain language and handle all technical setup and integrations for you."
  },
  {
    question: "What happens if I want to cancel the subscription?",
    answer: "You can cancel your subscription at any time with no penalties. Your data remains accessible for 30 days post-cancellation, and we provide export tools to ensure you retain all your work."
  },
  {
    question: "What if I'm not satisfied with the result?",
    answer: "We offer a satisfaction guarantee. If you're not happy with the results within the first 30 days, we'll work with you to make it right or provide a full refund. Your success is our priority."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="min-h-screen w-full bg-black relative py-20 px-6 md:px-12">
      {/* Geometric grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/5" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/5" />
        <div className="absolute left-0 right-0 top-1/4 h-px bg-white/5" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          className="font-display font-black text-6xl md:text-7xl lg:text-8xl text-white tracking-[-0.02em] mb-16"
        >
          FAQ
        </motion.h2>

        {/* FAQ Items */}
        <div className="space-y-0">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              viewport={{ once: true, amount: 0.3 }}
              className="border-t border-white/10"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-6">
                  {/* Number */}
                  <span className="text-sm font-body text-white/40 w-8">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {/* Question */}
                  <span className="font-body text-lg md:text-xl font-medium text-white group-hover:text-white/70 transition-colors">
                    {item.question}
                  </span>
                </div>
                {/* Toggle Icon */}
                <motion.div
                  animate={{ rotate: openIndex === index ? 0 : 0 }}
                  className="flex-shrink-0 ml-4"
                >
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-white/60" />
                  ) : (
                    <Plus className="w-5 h-5 text-white/60" />
                  )}
                </motion.div>
              </button>

              {/* Answer */}
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pl-14">
                      <p className="text-xs md:text-sm font-body tracking-[0.08em] uppercase text-white/50 leading-relaxed max-w-2xl">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {/* Bottom border */}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
};

export default FAQ;
