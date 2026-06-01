"use client";

import React, { useEffect, useMemo, useRef, Suspense } from "react";
import { DocumentType, documentTypeToSlug } from "@/lib/documents";
import {
  Shield,
  Handshake,
  Copyright,
  BadgeCheck,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDocumentsStore } from "@/hooks/use-documents-store";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const typeCards: Array<{
  type: DocumentType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
}> = [
  {
    type: DocumentType.MOM,
    title: "Memorandum of Meeting (MOM)",
    subtitle: "Create meeting minutes and action items",
    icon: <FileText className="h-5 w-5" />,
    accentClass: "from-primary/15 to-primary/5",
  },
  {
    type: DocumentType.NDA,
    title: "Non‑Disclosure Agreement (NDA)",
    subtitle: "Protect confidential information between parties",
    icon: <Shield className="h-5 w-5" />,
    accentClass: "from-yellow-400/15 to-yellow-400/5",
  },
  {
    type: DocumentType.MOU,
    title: "Memorandum of Understanding (MOU)",
    subtitle: "Outline cooperation and expectations",
    icon: <Handshake className="h-5 w-5" />,
    accentClass: "from-emerald-400/15 to-emerald-400/5",
  },
  {
    type: DocumentType.IP_ASSIGNMENT,
    title: "IP Assignment Agreement",
    subtitle: "Transfer ownership of intellectual property",
    icon: <Copyright className="h-5 w-5" />,
    accentClass: "from-sky-400/15 to-sky-400/5",
  },
  {
    type: DocumentType.OFFER_LETTER,
    title: "Offer Letter",
    subtitle: "Formalize a role, compensation, and start date",
    icon: <BadgeCheck className="h-5 w-5" />,
    accentClass: "from-pink-400/15 to-pink-400/5",
  },
];

function parseArrayInput(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseActionItems(value: string) {
  // expects lines like: task|owner|dueDate
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [task, owner, dueDate] = line.split("|").map((s) => s.trim());
      return { task, owner, dueDate };
    })
    .filter((x) => x.task && x.owner && x.dueDate);
}

function DocumentsPageContent(): JSX.Element {
  const {
    selectedType,
    setType,
    formData,
    updateField,
    setDraft,
    draft,
    isGenerating,
    setGenerating,
  } = useDocumentsStore();
  const formRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Preselect type via ?type=nda etc. - client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = (params.get("type") || "").toUpperCase();
      const values = Object.values(DocumentType);
      if (t && values.includes(t as DocumentType)) {
        if (!selectedType || selectedType !== (t as DocumentType)) {
          setType(t as DocumentType);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectTypeAndScroll(t: DocumentType): Promise<void> {
    // Check authentication before allowing document type selection
    try {
      const { getSession } = await import('@/lib/supabase-auth');
      const session = await getSession();
      
      if (!session || !session.user) {
        alert(
          "Please login or sign up to use the document drafting service.\n\n" +
          "You will be redirected to the login page."
        );
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('[Documents] Auth check error:', error);
      alert('Authentication error. Please try logging in again.');
      window.location.href = '/login';
      return;
    }
    
    setType(t);
    // Update URL for shareability
    const qs = new URLSearchParams(window.location.search);
    qs.set("type", t.toLowerCase());
    router.replace(`/documents?${qs.toString()}`);
    // Smooth scroll
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleGenerate(): Promise<void> {
    if (!selectedType) return;
    
    // Check authentication using Supabase Auth
    try {
      const { getSession } = await import('@/lib/supabase-auth');
      const session = await getSession();
      
      if (!session || !session.user) {
        alert(
          "Please login or sign up to generate documents.\n\n" +
          "You will be redirected to the login page."
        );
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('[Documents] Auth check error:', error);
      alert('Authentication error. Please try logging in again.');
      window.location.href = '/login';
      return;
    }
    
    setGenerating(true);
    try {
      let data: Record<string, unknown> = { ...formData };
      if (selectedType === DocumentType.MOM) {
        data = {
          ...data,
          attendees: parseArrayInput(String(formData["attendees"] || "")),
          agendaPoints: parseArrayInput(String(formData["agendaPoints"] || "")),
          actionItems: parseActionItems(String(formData["actionItems"] || "")),
          notes: String(formData["notes"] || ""),
        };
      }
      if (
        selectedType === DocumentType.NDA ||
        selectedType === DocumentType.MOU
      ) {
        const tm = Number(formData["termMonths"]);
        if (!Number.isNaN(tm)) data["termMonths"] = tm;
      }
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, data }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        draft?: string;
        error?: string;
      };
      if (json.ok && json.draft) {
        setDraft(json.draft);
      } else {
        setDraft(json.error ?? "Failed to generate");
      }
    } catch {
      setDraft("Failed to generate");
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy(): void {
    if (!draft) return;
    void navigator.clipboard.writeText(draft);
  }

  function handleDownload(): void {
    if (!draft) return;
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (selectedType ?? "document") + ".txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative bg-background pt-16 sm:pt-20 pb-16 sm:pb-20 overflow-hidden">
          {/* Ambient glow effects matching landing page */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,193,7,0.08),transparent_60%)] pointer-events-none"></div>
          <div className="absolute top-1/5 left-0 w-full h-1/3 bg-gradient-to-r from-transparent via-primary/3 to-transparent pointer-events-none"></div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-24 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-primary/10 blur-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-secondary/10 blur-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          />

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              className="text-center mb-8 sm:mb-10 px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-body font-bold mb-3 sm:mb-4 leading-tight text-foreground"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
              >
                Automated Document{" "}
                <span className="text-primary">Drafting</span>
              </motion.h1>
              <motion.p
                className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                Generate elegant, professional legal documents in minutes. From
                NDAs to Offer Letters, we've got you covered.
              </motion.p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr gap-4 sm:gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {typeCards.map((card) => (
                <motion.div
                  key={card.type}
                  className="transition-all"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <SpotlightCard className="group text-left h-full rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl active:shadow-md transition-shadow">
                    <Link
                      href={`/documents/${documentTypeToSlug(card.type)}`}
                      className="block"
                    >
                      <div
                        className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-b ${card.accentClass} text-primary shadow-inner`}
                      >
                        {card.icon}
                      </div>
                      <div className="mt-2.5 sm:mt-3">
                        <div className="text-sm sm:text-base font-semibold leading-snug">
                          {card.title}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                          {card.subtitle}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground text-xs sm:text-xs px-2.5 sm:px-3 py-1 transition-all group-hover:bg-primary/90 active:scale-95">
                          Create Document
                        </span>
                      </div>
                    </Link>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function DocumentsPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-foreground">Loading...</div>
        </div>
      }
    >
      <DocumentsPageContent />
    </Suspense>
  );
}
