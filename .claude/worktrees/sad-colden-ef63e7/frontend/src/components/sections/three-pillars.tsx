"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const pillars = [
  {
    href: "/consult",
    title: "Online Client-Lawyer Matchmaking",
    description:
      "Connect with the right legal expert instantly. Our intelligent matching system pairs you with qualified lawyers based on your specific legal needs and case requirements.",
    gradient: "from-[#83B8B2] via-[#79ADA8] to-[#6AA19C]",
    accent: "01",
  },
  {
    href: "/lawgpt",
    title: "Legal Services with AI Chatbot Access",
    description:
      "Get instant legal guidance 24/7. Our AI-powered legal chatbot provides immediate answers to your legal questions and helps you understand complex legal concepts.",
    gradient: "from-[#D8AA69] via-[#CF9A56] to-[#C48743]",
    accent: "02",
  },
  {
    href: "/documents",
    title: "Automated Document Drafting",
    description:
      "Generate professional legal documents in minutes. Our AI-powered system creates accurate, customized legal documents tailored to your needs.",
    gradient: "from-[#E3C989] via-[#DAB96F] to-[#D2A957]",
    accent: "03",
  },
];

export default function ThreePillarsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-background pt-12 pb-24 md:pt-16 md:pb-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-body font-bold text-foreground lg:text-4xl">
            Our <span className="text-primary">Three Pillars</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-body text-muted-foreground">
            Turn2Law revolutionizes legal services through three innovative solutions
          </p>
        </motion.div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24, scale: prefersReducedMotion ? 1 : 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.09, ease: "easeOut" }}
              className="h-full"
            >
              <Link href={pillar.href} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/35 bg-background/85 p-5 shadow-[0_24px_40px_-30px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_46px_-28px_rgba(0,0,0,0.45)] sm:p-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-[0.82] transition-opacity duration-300 group-hover:opacity-[0.9]`} />
                  <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.18),transparent_40%,rgba(0,0,0,0.12))]" />
                  <div className="absolute right-4 top-4 rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-xs font-semibold tracking-[0.12em] text-[#1B2430]/85">
                    {pillar.accent}
                  </div>

                  <div className="relative z-10 flex h-full flex-col">
                    <h3 className="mb-4 max-w-[16ch] text-left text-balance text-2xl font-body font-semibold leading-tight tracking-[-0.015em] text-[#1E2732]">
                      {pillar.title}
                    </h3>
                    <p className="text-left text-base font-body leading-relaxed text-[#2A3644]/88">
                      {pillar.description}
                    </p>

                    <div className="mt-6 flex items-center text-sm font-semibold tracking-[0.01em] text-[#1F2A36]">
                      Learn more
                      <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
