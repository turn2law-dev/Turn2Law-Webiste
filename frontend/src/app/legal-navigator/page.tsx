"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MapPin,
  FileText,
  Building2,
  Paperclip,
  Globe,
  Phone,
  Clock,
  AlertCircle,
  RotateCcw,
  Copy,
  Share2,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Landmark,
  ChevronRight,
  ChevronDown,
  Scale,
  Zap,
  Timer,
  BookOpen,
  Navigation,
  Shield,
  XCircle,
  BadgeAlert,
  Wallet,
  Users,
  Lightbulb,
  CalendarClock,
  TrendingUp,
  Gavel,
  Info,
  ListChecks,
  Star,
  Printer,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
interface RecommendedAuthority {
  name: string;
  type: string;
  description: string;
}

interface OfficeDetails {
  name: string;
  address: string;
  contact: string;
  working_hours: string;
  locality: string;
}

interface OnlinePortal {
  available: boolean;
  link: string;
  label: string;
}

interface ActionStep {
  step: string;
  detail: string;
}

interface AlternateAuthority {
  name: string;
  reason: string;
  when_to_use: string;
}

interface CostEstimate {
  court_fee: string;
  lawyer_fee_range: string;
  total_estimate: string;
  notes: string;
}

interface HelplineNumber {
  label: string;
  number: string;
}

interface LegalNavigatorResult {
  problem_summary: string;
  category: string;
  subcategory: string;
  urgency: "immediate" | "high" | "medium" | "low";
  urgency_reason: string;
  estimated_timeline: string;
  recommended_authority: RecommendedAuthority;
  alternate_authorities: AlternateAuthority[];
  action_steps: ActionStep[];
  documents_required: string[];
  do_not_do: string[];
  rights_of_the_person: string[];
  limitation_period: string;
  cost_estimate: CostEstimate;
  helpline_numbers: HelplineNumber[];
  success_rate_note: string;
  precedent_note: string;
  office_details: OfficeDetails;
  online_portal: OnlinePortal;
  map_link: string;
  maps_embed_query: string;
  ipc_sections: string[];
  key_facts: string[];
  legal_note: string;
  turn2law_cta: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────────────────────────────────────
const urgencyConfig = {
  immediate: { label: "Act Immediately", score: 4, barColor: "bg-red-500",    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50",       dot: "bg-red-500"    },
  high:      { label: "High Priority",   score: 3, barColor: "bg-orange-500", className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/50", dot: "bg-orange-500" },
  medium:    { label: "Medium Priority", score: 2, barColor: "bg-yellow-400", className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/50", dot: "bg-yellow-500" },
  low:       { label: "Low Priority",    score: 1, barColor: "bg-green-500",  className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50",   dot: "bg-green-500"  },
};

const categoryStyles: Record<string, string> = {
  Consumer:         "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50",
  Civil:            "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800/50",
  Labour:           "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/50",
  Corporate:        "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/50",
  Criminal:         "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50",
  "Public Grievance": "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50",
};

// ─────────────────────────────────────────────────────────────────────────────
//  Skeleton
// ─────────────────────────────────────────────────────────────────────────────
const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-lg bg-muted/60", className)} />
);

const LoadingSkeleton = () => (
  <div className="space-y-5 mt-8">
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground font-body">Analysing your legal issue…</p>
        <p className="text-xs text-muted-foreground font-body mt-0.5">Identifying authority, IPC/BNS sections, rights, cost & local office</p>
      </div>
    </div>
    <Shimmer className="h-24 w-full" />
    <div className="grid grid-cols-2 gap-4"><Shimmer className="h-20" /><Shimmer className="h-20" /></div>
    <Shimmer className="h-52 w-full" />
    <Shimmer className="h-40 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Shimmer className="h-36" /><Shimmer className="h-36" /></div>
    <Shimmer className="h-36 w-full" />
    <Shimmer className="h-64 w-full" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Section wrapper
// ─────────────────────────────────────────────────────────────────────────────
const Section = ({
  label, icon: Icon, children, accent, warning, className, badge,
}: {
  label: string; icon: React.ElementType; children: React.ReactNode;
  accent?: boolean; warning?: boolean; className?: string; badge?: React.ReactNode;
}) => (
  <div className={cn("rounded-2xl border bg-card p-6", accent ? "border-primary/30" : warning ? "border-orange-300/60 dark:border-orange-700/40" : "border-border/60", className)}>
    <div className="flex items-center justify-between gap-2 mb-5">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 flex-shrink-0", accent ? "text-primary" : warning ? "text-orange-500" : "text-muted-foreground")} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground font-body">{label}</span>
      </div>
      {badge}
    </div>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Urgency Meter (4 dots)
// ─────────────────────────────────────────────────────────────────────────────
const UrgencyMeter = ({ urgency }: { urgency: keyof typeof urgencyConfig }) => {
  const cfg = urgencyConfig[urgency] ?? urgencyConfig.medium;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4].map((d) => (
        <span key={d} className={cn("h-2 w-6 rounded-full transition-all", d <= cfg.score ? cfg.barColor : "bg-muted")} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Tick-off document checklist item
// ─────────────────────────────────────────────────────────────────────────────
const DocCheckItem = ({ doc, checked, onToggle }: { doc: string; checked: boolean; onToggle: () => void }) => (
  <li className="flex items-start gap-3 cursor-pointer group" onClick={onToggle}>
    <span className={cn("flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all",
      checked ? "bg-primary border-primary" : "border-border/70 group-hover:border-primary/50")}>
      {checked && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
    </span>
    <span className={cn("text-sm font-body transition-all", checked ? "text-muted-foreground line-through" : "text-foreground")}>
      {doc}
    </span>
  </li>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Google Maps Embed with GPS Directions button
// ─────────────────────────────────────────────────────────────────────────────
const MapEmbed = ({ query, mapLink, officeName }: { query: string; mapLink: string; officeName: string }) => {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&z=15`;

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => window.open(`https://www.google.com/maps/dir/${coords.latitude},${coords.longitude}/${encodeURIComponent(query)}`, "_blank"),
        () => window.open(mapLink, "_blank")
      );
    } else {
      window.open(mapLink, "_blank");
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/60">
      <iframe src={src} width="100%" height="280" style={{ border: 0 }} allowFullScreen loading="lazy"
        referrerPolicy="no-referrer-when-downgrade" title={`Location of ${officeName}`} className="w-full" />
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/40 border-t border-border/40 flex-wrap gap-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body min-w-0">
          <Navigation className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="truncate max-w-[180px]">{officeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGPS}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors font-body">
            <Navigation className="h-3 w-3" />GPS Directions
          </button>
          <a href={mapLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors font-body">
            <ExternalLink className="h-3 w-3" />Open in Maps
          </a>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function LegalNavigatorPage() {
  const [problem, setProblem] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LegalNavigatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedAlt, setExpandedAlt] = useState<number | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "rights" | "donts">("steps");
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { getSession, getUserProfile } = await import("@/lib/supabase-auth");
        const session = await getSession();
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          if (profile) setCurrentUser({ id: profile.id, email: profile.email });
        }
      } catch { /* unauthenticated */ }
    })();
  }, []);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const handleSubmit = async () => {
    if (!problem.trim() || !location.trim()) { setError("Please describe your problem and provide your location."); return; }
    if (problem.trim().length < 10) { setError("Please describe your problem in more detail."); return; }
    setError(null); setLoading(true); setResult(null);
    setExpandedStep(null); setExpandedAlt(null); setCheckedDocs({}); setShowAllSteps(false); setActiveTab("steps");
    try {
      const res = await fetch(`${BACKEND_URL}/api/legal-navigator`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_description: problem.trim(), location: location.trim(), ...(currentUser && { user_id: currentUser.id, user_email: currentUser.email }) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Something went wrong.");
      setResult(json.data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get a response. Please try again.");
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setResult(null); setError(null); setProblem(""); setLocation("");
    setExpandedStep(null); setExpandedAlt(null); setCheckedDocs({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => textareaRef.current?.focus(), 400);
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = [
      "Legal Navigator — Turn2Law", "=".repeat(30),
      `Problem: ${result.problem_summary}`,
      `Category: ${result.category} — ${result.subcategory}`,
      `Urgency: ${result.urgency?.toUpperCase()} — ${result.urgency_reason}`,
      `Timeline: ${result.estimated_timeline}`,
      `Limitation: ${result.limitation_period}`,
      `Authority: ${result.recommended_authority?.name}`,
      "",
      "Action Steps:",
      ...result.action_steps.map((s, i) => `${i + 1}. ${s.step}: ${s.detail}`),
      "",
      "Your Rights:",
      ...(result.rights_of_the_person?.map(r => `• ${r}`) ?? []),
      "",
      "Do NOT do:",
      ...(result.do_not_do?.map(d => `✗ ${d}`) ?? []),
      "",
      "Documents Required:",
      ...(result.documents_required?.map(d => `• ${d}`) ?? []),
      "",
      `Cost Estimate: ${result.cost_estimate?.total_estimate}`,
      `Office: ${result.office_details?.name}`,
      `Address: ${result.office_details?.address}`,
      `Contact: ${result.office_details?.contact}`,
      "",
      `Helplines: ${result.helpline_numbers?.map(h => `${h.label}: ${h.number}`).join(" | ")}`,
      "",
      `Precedent: ${result.precedent_note}`,
      "",
      `Note: ${result.legal_note}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!result) return;
    if (navigator.share) {
      await navigator.share({ title: "Turn2Law Legal Navigator", text: `${result.category} case analysed. Authority: ${result.recommended_authority?.name}. Urgency: ${result.urgency?.toUpperCase()}.`, url: window.location.href });
    } else { handleCopy(); }
  };

  const examples = [
    { problem: "My landlord is not returning my ₹80,000 security deposit after I vacated", location: "Chennai, Adyar" },
    { problem: "Employer hasn't paid my salary for 3 months and is now threatening termination", location: "Bangalore, Koramangala" },
    { problem: "Got cheated in a UPI scam, transferred ₹1,20,000 to a fraudster", location: "Delhi, Rohini" },
    { problem: "Refrigerator stopped working after 2 months, company refusing refund", location: "Mumbai, Andheri" },
    { problem: "My brother was murdered and the police are refusing to register our FIR", location: "Hyderabad, Banjara Hills" },
    { problem: "Wife wants divorce and sole custody of children — what are my rights?", location: "Pune, Kothrud" },
  ];

  const urgencyCfg = result ? (urgencyConfig[result.urgency] ?? urgencyConfig.medium) : null;
  const visibleSteps = showAllSteps ? (result?.action_steps ?? []) : (result?.action_steps ?? []).slice(0, 4);
  const stepsTotal = result?.action_steps?.length ?? 0;
  const docsCheckedCount = Object.values(checkedDocs).filter(Boolean).length;
  const docsTotal = result?.documents_required?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-20">

        {/* ── Hero ── */}
        <section className="border-b border-border/40 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-5 font-body">
                <Scale className="h-3 w-3" />AI Legal Navigator
              </p>
              <h1 className="font-headline text-4xl md:text-[3.25rem] font-bold text-foreground leading-[1.08] tracking-tight mb-5">
                Know exactly where to go<br />
                <span className="text-primary">and what to do.</span>
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto font-body mb-8">
                Describe your legal problem. Our AI identifies the exact local authority, IPC/BNS sections, your rights, cost estimate, limitation period, and the specific office — with GPS directions.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["✓ Exact local office","✓ GPS directions","✓ IPC / BNS sections","✓ Your legal rights","✓ Cost estimate","✓ Limitation period","✓ Do's & Don'ts","✓ One-tap helplines"].map(f => (
                  <span key={f} className="rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs text-muted-foreground font-body">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Input ── */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Problem */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-body">
                  Describe your legal issue <span className="text-primary">*</span>
                </label>
                <textarea
                  ref={textareaRef} value={problem}
                  onChange={(e) => setProblem(e.target.value.slice(0, 2000))}
                  placeholder="e.g. My landlord has refused to return my ₹50,000 security deposit two months after I vacated. He is threatening eviction and has also damaged my belongings."
                  rows={5}
                  className={cn("w-full rounded-xl border border-border/70 bg-background px-4 py-3",
                    "text-sm text-foreground placeholder:text-muted-foreground/50 leading-relaxed font-body",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 resize-none transition-all")}
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-muted-foreground/60 font-body">More detail = better results. Include names, amounts, and dates.</p>
                  <p className={cn("text-[11px] font-body", problem.length > 1800 ? "text-orange-500" : "text-muted-foreground/60")}>{problem.length} / 2000</p>
                </div>
              </div>
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-body">
                  Your location <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="Locality, City — e.g. Koramangala, Bangalore or Rohini, Delhi"
                    className={cn("w-full rounded-xl border border-border/70 bg-background pl-10 pr-4 py-3",
                      "text-sm text-foreground placeholder:text-muted-foreground/50 font-body",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all")}
                    disabled={loading} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-1 font-body">Include your locality (not just city) for the most accurate office recommendation.</p>
              </div>
              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-body">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />{error}
                </div>
              )}
              {/* Submit */}
              <Button onClick={handleSubmit} disabled={loading || !problem.trim() || !location.trim()}
                className="w-full h-12 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-body transition-all">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                    Analysing your case…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Get Legal Guidance<ChevronRight className="h-4 w-4" /></span>
                )}
              </Button>
              {/* Examples */}
              {!result && !loading && (
                <div className="pt-1">
                  <p className="text-[11px] text-muted-foreground/70 mb-2.5 font-body">Try an example</p>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((ex) => (
                      <button key={ex.problem} onClick={() => { setProblem(ex.problem); setLocation(ex.location); }}
                        className="rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border transition-all font-body text-left">
                        {ex.problem}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Loading ── */}
        {loading && (
          <section className="pb-16">
            <div className="container mx-auto px-4 max-w-2xl"><LoadingSkeleton /></div>
          </section>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <section ref={resultRef} className="pb-24">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto space-y-4">

                {/* ── Action bar ── */}
                <div className="flex items-start justify-between gap-3 flex-wrap pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground font-body">Analysis complete</span>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border font-body", categoryStyles[result.category] || "bg-muted text-muted-foreground border-border")}>{result.category}</span>
                    {urgencyCfg && (
                      <span className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-body", urgencyCfg.className)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", urgencyCfg.dot)} />{urgencyCfg.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-body">
                      <Copy className="h-3 w-3" />{copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-body">
                      <Printer className="h-3 w-3" />Print
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-body">
                      <Share2 className="h-3 w-3" />Share
                    </button>
                    <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-body">
                      <RotateCcw className="h-3 w-3" />New
                    </button>
                  </div>
                </div>

                {/* ── Urgency + Timeline ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-body">Urgency</p>
                      {urgencyCfg && <span className="text-xs font-bold text-foreground font-body">{urgencyCfg.label}</span>}
                    </div>
                    {urgencyCfg && <UrgencyMeter urgency={result.urgency} />}
                    <p className="text-xs text-muted-foreground mt-2 leading-snug font-body line-clamp-2">{result.urgency_reason}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-body">Timeline</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground font-body leading-snug">{result.estimated_timeline}</p>
                    {result.limitation_period && (
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-1.5 font-body flex items-start gap-1">
                        <CalendarClock className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{result.limitation_period}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Case Summary ── */}
                <Section label="Case Summary" icon={FileText} accent>
                  <p className="text-sm text-foreground leading-relaxed font-body">{result.problem_summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.subcategory && (
                      <span className="rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-foreground font-body">{result.subcategory}</span>
                    )}
                    <span className={cn("rounded-md border px-2.5 py-1 text-[11px] font-semibold font-body", categoryStyles[result.category] || "bg-muted text-muted-foreground border-border")}>{result.category} Law</span>
                  </div>
                  {result.ipc_sections?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5 font-body">Applicable Sections</p>
                      <div className="flex flex-wrap gap-2">
                        {result.ipc_sections.map((s) => (
                          <span key={s} className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary font-body">
                            <BookOpen className="h-3 w-3" />{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>

                {/* ── Primary Authority ── */}
                <Section label="Primary Authority" icon={Landmark} accent>
                  <h3 className="font-headline text-xl font-bold text-foreground leading-tight mb-1">{result.recommended_authority?.name}</h3>
                  <span className={cn("inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-3 font-body", categoryStyles[result.category] || "bg-muted text-muted-foreground border-border")}>
                    {result.recommended_authority?.type}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed font-body">{result.recommended_authority?.description}</p>
                  {result.success_rate_note && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 px-3.5 py-3">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed font-body">
                        <span className="font-semibold">Success rate — </span>{result.success_rate_note}
                      </p>
                    </div>
                  )}
                  {result.precedent_note && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-muted/40 border border-border/50 px-3.5 py-3">
                      <Gavel className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed font-body">
                        <span className="font-semibold text-foreground">Case law — </span>{result.precedent_note}
                      </p>
                    </div>
                  )}
                </Section>

                {/* ── Tabbed: Steps / Rights / Don'ts ── */}
                <div className="rounded-2xl border border-primary/30 bg-card overflow-hidden">
                  <div className="flex border-b border-border/60">
                    {([ { key: "steps", label: "Action Steps", icon: Scale }, { key: "rights", label: "Your Rights", icon: Shield }, { key: "donts", label: "Don'ts", icon: XCircle } ] as const).map(({ key, label, icon: Icon }) => (
                      <button key={key} onClick={() => setActiveTab(key)}
                        className={cn("flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold font-body transition-all border-b-2",
                          activeTab === key ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground")}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-6">
                    {activeTab === "steps" && (
                      <>
                        <ol className="space-y-3">
                          {visibleSteps.map((step, idx) => {
                            const s = typeof step === "string" ? { step, detail: "" } : step;
                            const isOpen = expandedStep === idx;
                            return (
                              <li key={idx}>
                                <button onClick={() => setExpandedStep(isOpen ? null : idx)} className="w-full flex items-start gap-4 text-left group">
                                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5 tabular-nums">{idx + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground font-body leading-snug group-hover:text-primary transition-colors">{s.step}</p>
                                    {isOpen && s.detail && <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-body">{s.detail}</p>}
                                  </div>
                                  {s.detail && <ChevronRight className={cn("h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform", isOpen && "rotate-90")} />}
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                        {stepsTotal > 4 && (
                          <button onClick={() => setShowAllSteps(!showAllSteps)} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline font-body">
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAllSteps && "rotate-180")} />
                            {showAllSteps ? "Show fewer steps" : `Show all ${stepsTotal} steps`}
                          </button>
                        )}
                        <p className="text-[11px] text-muted-foreground/60 mt-4 font-body">Tap any step to expand detailed instructions.</p>
                      </>
                    )}
                    {activeTab === "rights" && (
                      result.rights_of_the_person?.length > 0 ? (
                        <ul className="space-y-3">
                          {result.rights_of_the_person.map((right, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center mt-0.5">
                                <Shield className="h-3 w-3 text-secondary" />
                              </span>
                              <span className="text-sm text-foreground font-body leading-relaxed">{right}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground font-body">Rights information not available.</p>
                    )}
                    {activeTab === "donts" && (
                      result.do_not_do?.length > 0 ? (
                        <ul className="space-y-3">
                          {result.do_not_do.map((dont, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground font-body leading-relaxed">{dont}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground font-body">No specific warnings for this case type.</p>
                    )}
                  </div>
                </div>

                {/* ── Documents Checklist ── */}
                <Section label="Documents Checklist" icon={ListChecks}
                  badge={docsTotal > 0 ? (
                    <span className="text-[11px] font-semibold text-muted-foreground font-body bg-muted/50 rounded-full px-2.5 py-0.5">{docsCheckedCount}/{docsTotal} ready</span>
                  ) : undefined}>
                  {docsTotal > 0 ? (
                    <>
                      <ul className="space-y-3">
                        {result.documents_required.map((doc, idx) => (
                          <DocCheckItem key={idx} doc={doc} checked={!!checkedDocs[idx]} onToggle={() => setCheckedDocs(p => ({ ...p, [idx]: !p[idx] }))} />
                        ))}
                      </ul>
                      {docsCheckedCount > 0 && docsCheckedCount === docsTotal && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 px-3.5 py-2.5">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400 font-body">All documents ready — you can proceed to file!</p>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground/60 mt-3 font-body">Tap each item to mark as collected.</p>
                    </>
                  ) : <p className="text-sm text-muted-foreground font-body">No specific documents listed.</p>}
                </Section>

                {/* ── Cost Estimate ── */}
                {result.cost_estimate && (
                  <Section label="Cost Estimate" icon={Wallet}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Court Fee",       value: result.cost_estimate.court_fee,         icon: Landmark,  highlight: false },
                        { label: "Lawyer Fee",       value: result.cost_estimate.lawyer_fee_range,  icon: Scale,     highlight: false },
                        { label: "Total Estimate",   value: result.cost_estimate.total_estimate,    icon: Wallet,    highlight: true  },
                      ].map(({ label, value, icon: I, highlight }) => (
                        <div key={label} className={cn("rounded-xl border p-3.5", highlight ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/20")}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <I className={cn("h-3.5 w-3.5", highlight ? "text-primary" : "text-muted-foreground")} />
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-body">{label}</p>
                          </div>
                          <p className={cn("text-sm font-semibold font-body", highlight ? "text-primary" : "text-foreground")}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {result.cost_estimate.notes && (
                      <div className="flex items-start gap-2.5 rounded-lg bg-muted/40 border border-border/50 px-3.5 py-3">
                        <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground font-body leading-relaxed">{result.cost_estimate.notes}</p>
                      </div>
                    )}
                  </Section>
                )}

                {/* ── Key Facts ── */}
                {result.key_facts?.length > 0 && (
                  <Section label="Key Facts to Know" icon={Lightbulb}>
                    <ul className="space-y-3">
                      {result.key_facts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700/50 flex items-center justify-center mt-0.5">
                            <Lightbulb className="h-2.5 w-2.5 text-yellow-600 dark:text-yellow-400" />
                          </span>
                          <span className="text-sm text-foreground font-body leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {/* ── Specific Office ── */}
                <Section label="Specific Local Office" icon={Building2} accent>
                  <h4 className="font-headline text-lg font-bold text-foreground mb-3 leading-snug">{result.office_details?.name}</h4>
                  <div className="space-y-2.5 text-sm mb-5">
                    {result.office_details?.locality && (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground font-body font-semibold">{result.office_details.locality}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-foreground font-body">{result.office_details?.address}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-foreground font-body">{result.office_details?.contact}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-foreground font-body">{result.office_details?.working_hours}</span>
                    </div>
                  </div>
                  {result.maps_embed_query && (
                    <MapEmbed query={result.maps_embed_query} mapLink={result.map_link} officeName={result.office_details?.name ?? "Office"} />
                  )}
                </Section>

                {/* ── Alternate Authorities ── */}
                {result.alternate_authorities?.length > 0 && (
                  <Section label="Alternate Authorities" icon={Users}>
                    <div className="space-y-2.5">
                      {result.alternate_authorities.map((alt, idx) => {
                        const isOpen = expandedAlt === idx;
                        return (
                          <div key={idx} className="rounded-xl border border-border/60 overflow-hidden">
                            <button onClick={() => setExpandedAlt(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <Landmark className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-semibold text-foreground font-body truncate">{alt.name}</span>
                              </div>
                              <ChevronDown className={cn("h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 space-y-2 border-t border-border/40 pt-3">
                                <p className="text-xs text-muted-foreground font-body"><span className="font-semibold text-foreground">Why relevant: </span>{alt.reason}</p>
                                <p className="text-xs text-muted-foreground font-body"><span className="font-semibold text-foreground">When to use: </span>{alt.when_to_use}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* ── Online Portal ── */}
                <Section label="Online Filing" icon={Globe}>
                  {result.online_portal?.available ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400 font-body">Online filing available</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">You can file your complaint online — no need to visit the office in person.</p>
                      <a href={result.online_portal.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors font-body">
                        <Globe className="h-4 w-4" />{result.online_portal.label || "Go to Official Portal"}<ExternalLink className="h-3.5 w-3.5 text-primary/60" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 text-sm text-muted-foreground font-body">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                      No online portal available for this case type. Physical visit required.
                    </div>
                  )}
                </Section>

                {/* ── Helpline Numbers ── */}
                {result.helpline_numbers?.length > 0 && (
                  <Section label="Emergency & Helpline Numbers" icon={Phone}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {result.helpline_numbers.map((h, idx) => (
                        <a key={idx} href={`tel:${h.number}`}
                          className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 hover:bg-muted/60 hover:border-primary/30 transition-all group">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground font-body leading-snug truncate">{h.label}</p>
                            <p className="text-sm font-bold text-primary font-body tabular-nums">{h.number}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 mt-3 font-body">Tap any card to call directly from your device.</p>
                  </Section>
                )}

                {/* ── Disclaimer ── */}
                <div className="rounded-xl border border-border/50 bg-muted/20 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <BadgeAlert className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed font-body">
                      <span className="font-semibold text-foreground">Disclaimer — </span>{result.legal_note}
                    </p>
                  </div>
                </div>

                {/* ── CTA ── */}
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary mb-1 font-body">Need hands-on help?</p>
                      <h3 className="font-headline text-xl font-bold text-foreground leading-snug">We handle it end-to-end for you.</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 font-body">{result.turn2law_cta}</p>
                  <div className="flex flex-wrap gap-3">
                    <a href="/consult">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 h-10 text-sm font-semibold font-body">
                        Consult a Lawyer<ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                    <a href="/consult">
                      <Button variant="outline" className="rounded-xl px-5 h-10 text-sm font-medium border-border/70 font-body">Book a Free Call</Button>
                    </a>
                  </div>
                </div>

                {/* Reset */}
                <div className="pt-2 text-center">
                  <button onClick={handleReset} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                    <RotateCcw className="h-3.5 w-3.5" />Ask another question
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── How it works (no result state) ── */}
        {!result && !loading && (
          <section className="py-16 border-t border-border/40">
            <div className="container mx-auto px-4 max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-8 text-center font-body">How it works</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40 mb-10">
                {[
                  { n: "01", title: "Describe", body: "Write your issue in plain language. Mention your locality and city for precise, specific office results." },
                  { n: "02", title: "AI Analyses", body: "Classifies case, identifies IPC/BNS sections, your rights, limitation period, cost and exact local authority." },
                  { n: "03", title: "Act", body: "Follow the step-by-step plan, use GPS to find the office, tick off documents, or hire a Turn2Law lawyer." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="bg-card px-7 py-8">
                    <p className="font-headline text-3xl font-bold text-primary/20 mb-4">{n}</p>
                    <p className="text-sm font-semibold text-foreground mb-1.5 font-body">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-body">{body}</p>
                  </div>
                ))}
              </div>
              {/* Feature grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: MapPin,        title: "Exact Office",       desc: "Specific local court or authority — not a generic government link" },
                  { icon: Navigation,    title: "GPS Directions",     desc: "One-tap to get live turn-by-turn directions from your location" },
                  { icon: BookOpen,      title: "IPC / BNS Sections", desc: "Correct criminal or civil sections cited with descriptions" },
                  { icon: Shield,        title: "Your Legal Rights",  desc: "All rights you hold under Indian law for this exact situation" },
                  { icon: Wallet,        title: "Cost Estimate",      desc: "Court fees and lawyer cost ranges so you're not surprised" },
                  { icon: XCircle,       title: "Common Mistakes",    desc: "Things people do that ruin their case — know to avoid them" },
                  { icon: CalendarClock, title: "Limitation Period",  desc: "Exact deadline to file — missing it can end your case" },
                  { icon: ListChecks,    title: "Doc Checklist",      desc: "Interactive checklist — tick off documents as you collect them" },
                  { icon: Phone,         title: "Helpline Numbers",   desc: "One-tap call to police, legal aid, consumer, and specialist helplines" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="rounded-xl border border-border/60 bg-card p-4">
                    <Icon className="h-4 w-4 text-primary mb-2.5" />
                    <p className="text-xs font-semibold text-foreground mb-1 font-body">{title}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug font-body">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
