"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const faqData = [
  {
    question: "What is Turn2Law and how does it work?",
    answer:
      "Turn2Law is a next-generation legal platform designed to simplify access to legal services for everyone. We connect you to trusted legal professionals and AI-powered resources instantly. Whether you're facing an emergency, drafting critical documents, or seeking legal advice, Turn2Law provides on-demand lawyer matching, automated document drafting, and AI-powered legal chatbot assistance to make justice accessible, affordable, and efficient.",
  },
  {
    question: "How does the AI-powered lawyer matching system work?",
    answer:
      "Our intelligent matching system uses advanced ML algorithms to pair you with qualified lawyers based on your specific legal needs and case requirements. Simply describe your legal situation, and our system analyzes your requirements to connect you with the most suitable legal expert from our network of over 200+ verified lawyers. The matching considers specialization, experience, location, and case complexity to ensure you get the right legal support.",
  },
  {
    question: "What legal services does Turn2Law offer?",
    answer:
      "Turn2Law offers three core services: (1) Online Client-Lawyer Matchmaking - Connect with expert lawyers tailored to your specific legal needs, (2) Automated Document Drafting - Generate professional legal documents like NDAs, contracts, and agreements in minutes using our AI-powered system, and (3) Legal Services with AI Chatbot Access - Get instant legal guidance 24/7 from our AI-powered chatbot that provides immediate answers to your legal questions.",
  },
  {
    question: "Is my data secure and confidential on Turn2Law?",
    answer:
      "Absolutely. We take data security and client confidentiality very seriously. All communications, documents, and personal information are encrypted and protected using industry-standard security protocols. Our platform complies with legal confidentiality requirements, and all lawyers on our network are bound by professional ethics and attorney-client privilege. Your legal matters remain completely private and secure.",
  },
  {
    question: "Can I consult a lawyer virtually through Turn2Law?",
    answer:
      "Yes! Virtual consulting is one of our core features. You can access expert legal advice and consultations anytime, anywhere, from the comfort of your home. Our platform supports video consultations, secure messaging, and document sharing, making it convenient to get professional legal support without the need for in-person meetings. This saves you time and travel costs while ensuring you get quality legal assistance.",
  },
];

const KnowAboutUs = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="know-about-us" className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-8"
        >
          <h2 className="mb-4 text-3xl font-body font-bold text-foreground lg:text-4xl">
            Know about <span className="text-primary">us</span>
          </h2>
          <p className="max-w-2xl font-body text-lg text-muted-foreground">
            Get answers to frequently asked questions about our platform and
            services
          </p>
        </motion.div>

        <div className="max-w-4xl space-y-3">
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
              className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                activeIndex === index
                  ? "border-border/40 bg-muted/30 dark:bg-[#0E0E0E]"
                  : "border-border/20 bg-background hover:border-border/40"
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left"
              >
                <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3 dark:bg-primary/20">
                  <span className="text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                </div>

                <span className="flex-1 font-body text-base font-semibold text-foreground">
                  {faq.question}
                </span>

                <div
                  className={`flex-shrink-0 text-muted-foreground transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeIndex === index
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5 pt-2">
                  <div className="border-t border-border/20 pl-16 pr-4 pt-3">
                    <p className="font-body text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KnowAboutUs;
