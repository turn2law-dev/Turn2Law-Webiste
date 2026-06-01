"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, MessageSquare, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 90, scale: 0.88, filter: "blur(18px)" },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 1.05, ease: EASE },
  },
};

const tools = [
  {
    id: "01",
    label: "AI ASSISTANT",
    href: "/lawgpt",
    accentColor: "#3b82f6",
    icon: MessageSquare,
    title: "Ask anything.\nGet cited answers.",
    description: "LawGPT is built on Indian law — IPC, BNS, and 50+ statutes. Free to use, 24/7.",
    cta: "Start a chat",
    preview: (
      <div className="mt-6 rounded-2xl border border-border/60 bg-background p-4 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-600">L</div>
            <span className="text-xs font-semibold text-foreground">LawGPT</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />LIVE
          </span>
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-muted px-3.5 py-2 text-xs text-foreground/65 max-w-[85%]">
            Can my landlord evict me without notice?
          </div>
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-blue-50 border border-blue-100 px-3.5 py-2.5 text-xs text-foreground/75 leading-relaxed max-w-[95%]">
          No. Under <span className="text-blue-600 font-semibold">Section 106, Transfer of Property Act</span> — written notice is mandatory.
        </div>
      </div>
    ),
  },
  {
    id: "02",
    label: "MATCHMAKING",
    href: "/consult",
    accentColor: "#C8922A",
    icon: Users,
    title: "Counsel paired\nto your case.",
    description: "200+ verified lawyers matched by AI — not by who paid for placement.",
    cta: "Find your lawyer",
    preview: (
      <div className="mt-6 rounded-2xl border border-border/60 bg-background p-4 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">PR</div>
            <div>
              <p className="text-xs font-semibold text-foreground">Adv. Priya Raman</p>
              <p className="text-[10px] text-foreground/45">Property · Bengaluru · 12 yrs</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-primary border border-primary/30 rounded-full px-2.5 py-1">✓ Verified</span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-foreground/45 mb-1.5">
            <span>AI Match score</span>
            <span className="font-bold text-foreground/80">96%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-primary to-yellow-500" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Property Law", "Bengaluru", "English"].map(t => (
            <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-foreground/50 border border-border/60">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "03",
    label: "DOCUMENT DRAFTING",
    href: "/documents",
    accentColor: "#10b981",
    icon: FileText,
    title: "Contracts in\nminutes, not days.",
    description: "NDAs, agreements, legal notices — generated, customized, and ready to send.",
    cta: "Draft a document",
    preview: (
      <div className="mt-6 rounded-2xl border border-border/60 bg-background p-4 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Mutual NDA — v3.docx</p>
              <p className="text-[10px] text-emerald-600 uppercase tracking-wide font-medium">Ready in 47 seconds</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 border border-emerald-200 rounded-full px-2.5 py-1 bg-emerald-50">✓ Done</span>
        </div>
        <div className="space-y-2">
          {[
            { w: 90, color: "bg-foreground/15" },
            { w: 70, color: "bg-foreground/10" },
            { w: 85, color: "bg-foreground/15" },
            { w: 50, color: "bg-primary/40" },
          ].map((row, i) => (
            <div key={i} className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.w}%` }} />
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
    <section className="section-with-orbs relative min-h-screen flex flex-col justify-center bg-background py-24 px-6 overflow-hidden">

      <div className="container mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 70, filter: "blur(14px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, ease: EASE }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div className="h-px bg-primary/50"
              initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.2, ease: EASE }}
            />
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-5 py-2 text-xs font-semibold text-foreground/50 tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              What you&apos;ll use
            </span>
            <motion.div className="h-px bg-primary/50"
              initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.2, ease: EASE }}
            />
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-tight">
            Three tools.{" "}
            <span className="text-primary">Built for India.</span>
          </h2>
          <p className="mt-4 text-foreground/45 text-base max-w-lg mx-auto leading-relaxed">
            Everything you need to navigate Indian law — in one platform.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {tools.map((tool) => (
            <motion.div key={tool.id} variants={cardVariants} className="h-full">
              <Link href={tool.href} className="group block h-full">
                <div className="relative h-full rounded-3xl p-7 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,1) inset",
                  }}
                >
                  {/* Accent top border */}
                  <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${tool.accentColor}80, transparent)` }}
                  />

                  {/* Icon + label row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${tool.accentColor}15`, border: `1px solid ${tool.accentColor}25` }}>
                        <tool.icon style={{ width: 18, height: 18, color: tool.accentColor }} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/35">
                        {tool.id} / {tool.label}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-border/50 flex items-center justify-center text-foreground/30 group-hover:border-primary/40 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-300">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight whitespace-pre-line mb-3">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-foreground/50 leading-relaxed">{tool.description}</p>

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold transition-all duration-200"
                    style={{ color: tool.accentColor }}>
                    {tool.cta}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Preview */}
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
