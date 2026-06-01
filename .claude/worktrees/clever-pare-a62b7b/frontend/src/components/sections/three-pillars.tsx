"use client";

import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.95, filter: "blur(8px)" },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
};

const tools = [
  {
    id: "01",
    label: "AI ASSISTANT",
    href: "/lawgpt",
    title: "Ask anything. Get cited answers.",
    description: "LawGPT is built on Indian law — IPC, BNS, and 50+ statutes. Free to use, 24/7.",
    cta: "Start a chat",
    preview: (
      <div className="mt-5 rounded-xl border border-border/50 bg-background/70 p-3 text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">L</div>
            <span className="text-xs font-semibold text-foreground">LawGPT</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-primary font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />ONLINE
          </span>
        </div>
        <div className="flex justify-end mb-2">
          <div className="rounded-xl rounded-tr-sm bg-muted px-3 py-2 text-xs text-foreground/70 max-w-[80%]">
            Can my landlord evict me without notice?
          </div>
        </div>
        <div className="rounded-xl rounded-tl-sm bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-foreground/80 max-w-[90%]">
          No. Under Section 106 of the Transfer of Property Act, your landlord must give written notice.
        </div>
      </div>
    ),
  },
  {
    id: "02",
    label: "MATCHMAKING",
    href: "/consult",
    title: "Counsel paired to your case.",
    description: "200+ verified lawyers. Matched by model — not by who paid for placement.",
    cta: "Find your lawyer",
    preview: (
      <div className="mt-5 rounded-xl border border-border/50 bg-background/70 p-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">PR</div>
            <div>
              <p className="text-xs font-semibold text-foreground">Adv. Priya Raman</p>
              <p className="text-[10px] text-foreground/50">Property · Bengaluru · 12 yrs</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium text-primary border border-primary/30 rounded-full px-2 py-0.5">
            ✓ Verified
          </span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-foreground/50 mb-1">
            <span>Match score</span><span className="font-semibold text-foreground">96%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[96%] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "03",
    label: "DOCUMENT DRAFTING",
    href: "/documents",
    title: "Contracts in minutes, not days.",
    description: "NDAs, agreements, legal notices — generated, customized, ready to send.",
    cta: "Draft a document",
    preview: (
      <div className="mt-5 rounded-xl border border-border/50 bg-background/70 p-3 text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">Mutual NDA — v3.docx</p>
              <p className="text-[10px] text-foreground/50 uppercase tracking-wide">Ready in 47 seconds</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium text-primary border border-primary/30 rounded-full px-2 py-0.5">
            ✓ Reviewed
          </span>
        </div>
        <div className="space-y-2">
          {[90, 70, 85, 55].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${i === 3 ? "bg-primary/40" : "bg-foreground/15"}`} style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function ThreePillarsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="section-with-orbs min-h-screen flex flex-col justify-center bg-background py-20 px-6 overflow-hidden">
      <div className="container mx-auto">

        {/* Header */}
        <motion.div
          variants={headingVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-14 text-center"
        >
          {/* Line reveal */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="h-px bg-primary/40"
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            />
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-5 py-2 text-xs font-medium text-foreground/60">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              What you&apos;ll use
            </div>
            <motion.div
              className="h-px bg-primary/40"
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            />
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight">
            Three tools.{" "}
            <span className="text-primary">Built for India.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {tools.map((tool) => (
            <motion.div key={tool.id} variants={cardVariants}>
              <Link href={tool.href} className="group block h-full">
                <div className="h-full rounded-2xl glass-card glass-card-hover p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold tracking-widest text-foreground/40">
                      {tool.id} / {tool.label}
                    </span>
                    <div className="h-7 w-7 rounded-full border border-border/60 flex items-center justify-center text-foreground/40 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground leading-snug">{tool.title}</h3>
                  <p className="mt-2 text-sm text-foreground/55 leading-relaxed">{tool.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">
                    {tool.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                  {tool.preview}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
