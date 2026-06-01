"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const faqData = [
  {
    question: "What is Turn2Law and how does it work?",
    answer: "Turn2Law is a next-generation legal platform designed to simplify access to legal services for everyone. We connect you to trusted legal professionals and AI-powered resources instantly. Whether you're facing an emergency, drafting critical documents, or seeking legal advice, Turn2Law provides on-demand lawyer matching, automated document drafting, and AI-powered legal chatbot assistance to make justice accessible, affordable, and efficient.",
  },
  {
    question: "How does the AI-powered lawyer matching system work?",
    answer: "Our intelligent matching system uses advanced ML algorithms to pair you with qualified lawyers based on your specific legal needs and case requirements. Simply describe your legal situation, and our system analyzes your requirements to connect you with the most suitable legal expert from our network of over 200+ verified lawyers.",
  },
  {
    question: "What legal services does Turn2Law offer?",
    answer: "Turn2Law offers three core services: Online Client-Lawyer Matchmaking, Automated Document Drafting — generate professional legal documents like NDAs, contracts, and agreements in minutes, and Legal Services with AI Chatbot Access — get instant legal guidance 24/7.",
  },
  {
    question: "Is my data secure and confidential on Turn2Law?",
    answer: "Absolutely. All communications, documents, and personal information are encrypted and protected using industry-standard security protocols. Our platform complies with legal confidentiality requirements, and all lawyers are bound by professional ethics and attorney-client privilege.",
  },
  {
    question: "Can I consult a lawyer virtually through Turn2Law?",
    answer: "Yes! Virtual consulting is one of our core features. You can access expert legal advice and consultations anytime, anywhere, from the comfort of your home. Our platform supports video consultations, secure messaging, and document sharing.",
  },
];

const KnowAboutUs = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="know-about-us" className="section-with-orbs min-h-screen flex flex-col justify-center bg-background py-20 px-6 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid items-start gap-14 md:grid-cols-[1fr_2fr]">

          {/* Left — slide from left */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -90, filter: "blur(18px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, ease: EASE }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-5 py-2 text-xs font-medium text-foreground/60 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              FAQ
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight">
              Know about <span className="text-primary">us</span>
            </h2>
            <p className="mt-4 text-base text-foreground/55 leading-relaxed max-w-xs">
              Get answers to frequently asked questions about our platform and services
            </p>

            {/* Decorative line */}
            <motion.div
              className="mt-8 h-px bg-gradient-to-r from-primary/40 to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            />
          </motion.div>

          {/* Right — accordion with stagger */}
          <div className="space-y-0 divide-y divide-border/40">
            {faqData.map((faq, i) => (
              <motion.div
                key={i}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 60, filter: "blur(12px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.85, delay: i * 0.12, ease: EASE }}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                  className="flex w-full items-center justify-between py-6 text-left gap-4 group"
                >
                  <div className="flex items-start gap-5">
                    <span className="text-xs font-mono text-foreground/30 pt-0.5 flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    className="flex-shrink-0 h-8 w-8 rounded-full border border-border/60 flex items-center justify-center text-foreground/40 transition-colors group-hover:border-primary/40 group-hover:text-primary"
                    animate={{ rotate: activeIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    {activeIndex === i ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {activeIndex === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: EASE }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="pl-9 pb-6 text-base text-foreground/55 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowAboutUs;
