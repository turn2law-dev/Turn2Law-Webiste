"use client";

import React, { Suspense } from "react";
import { motion } from "motion/react";
import { Sparkles, Clock, Download, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DocumentWizard from "@/components/docengine/DocumentWizard";

const BENEFITS = [
  { icon: Sparkles,      label: "AI-assisted drafting" },
  { icon: Clock,         label: "Ready in under 60 seconds" },
  { icon: Download,      label: "Download as PDF" },
  { icon: CheckCircle2,  label: "Legally structured templates" },
];

function DocumentsPageInner() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow pt-24 pb-20">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(200,146,42,0.10),transparent)]" />

          <div className="container mx-auto px-4 sm:px-6 pt-8 pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Document engine connected · PDF generation live
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
                Legal Documents,{" "}
                <span className="text-primary">Drafted Instantly</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Generate professional, court-ready legal documents in under a
                minute. Fill in the details — we handle the rest.
              </p>
            </motion.div>

            {/* Benefits strip */}
            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {BENEFITS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-xs sm:text-sm text-muted-foreground shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Document Wizard ── */}
        <section className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <DocumentWizard />
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DocumentsPageInner />
    </Suspense>
  );
}
