"use client";

/**
 * DocumentWizard.tsx — 9-step legal document generation wizard
 * Wired to FastAPI engine via Next.js proxy at /api/docengine/[...path]
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Shield, Handshake, Copyright, BadgeCheck, FileText, UserPlus, ClipboardList,
  CheckCircle2, AlertCircle, Loader2, Upload, ChevronDown, ChevronRight,
  Download, ExternalLink, RotateCcw, Eye, EyeOff, Key,
  Building2, Brush, Image as ImageIcon, ArrowRight, ArrowLeft, Trash2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocTypeId = "NDA" | "MOU" | "IP_Agreement" | "Offer_Letter" | "Contract" | "Onboarding_Letter";
type InputMethod = "form" | "upload";
type BrandingMode = "turn2law" | "letterhead" | "custom";
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type GenStatus = "idle" | "active" | "done";

interface FieldSchema { key: string; label: string; placeholder: string; type: "text" | "textarea" }
interface TemplateInfo { id: DocTypeId; name: string; description: string; icon: string; required_fields: string[]; optional_fields: string[] }
interface BrandAssets { header?: File; footer?: File; watermark?: File; logo?: File; signature?: File }

// ─── Module-level constants ────────────────────────────────────────────────

const STEPS: { n: WizardStep; label: string }[] = [
  { n: 1, label: "Document Type" }, { n: 2, label: "Input Method" },
  { n: 3, label: "Fill Details" },  { n: 4, label: "Branding" },
  { n: 5, label: "Review" },        { n: 6, label: "Generate" },
  { n: 7, label: "PDF Preview" },   { n: 8, label: "Sign" },
  { n: 9, label: "Download" },
];

const GEN_STEP_LABELS = [
  "Validating fields",
  "Building document structure",
  "Rendering PDF via XeLaTeX",
  "Finalising output",
];

const DOC_COLORS: Record<string, string> = {
  NDA: "text-amber-600", MOU: "text-emerald-600", IP_Agreement: "text-sky-600",
  Offer_Letter: "text-pink-600", Contract: "text-violet-600", Onboarding_Letter: "text-orange-600",
};
const DOC_BG: Record<string, string> = {
  NDA: "bg-amber-50 dark:bg-amber-900/20", MOU: "bg-emerald-50 dark:bg-emerald-900/20",
  IP_Agreement: "bg-sky-50 dark:bg-sky-900/20", Offer_Letter: "bg-pink-50 dark:bg-pink-900/20",
  Contract: "bg-violet-50 dark:bg-violet-900/20", Onboarding_Letter: "bg-orange-50 dark:bg-orange-900/20",
};

const TEXTAREA_KEYS = new Set([
  "Purpose", "Service_Description", "Confidential_Info_Description",
  "Confidentiality", "IP_Description", "Governing_Law",
  "Payment_Schedule", "Termination_Clause", "Benefits_Description",
]);

const STATIC_TEMPLATES: TemplateInfo[] = [
  { id: "NDA",               name: "Non-Disclosure Agreement",    description: "Protect confidential information between parties",  icon: "shield",    required_fields: ["Name","Company","Date","Term","Jurisdiction"],                                                                   optional_fields: ["Confidential_Info_Description","Governing_Law"] },
  { id: "MOU",               name: "Memorandum of Understanding", description: "Business collaboration framework",                  icon: "handshake", required_fields: ["PartyA_Name","PartyB_Name","Date","Purpose","Term","Jurisdiction"],                                             optional_fields: ["Confidentiality","Governing_Law"] },
  { id: "IP_Agreement",      name: "IP Assignment Agreement",     description: "Intellectual property transfer and assignment",     icon: "cpu",       required_fields: ["Name","Company","Date","Term","Jurisdiction"],                                                                   optional_fields: ["IP_Description","Governing_Law"] },
  { id: "Offer_Letter",      name: "Offer Letter",                description: "Formal employment offer with compensation details", icon: "briefcase", required_fields: ["Name","Company","Position","Start_Date","Salary"],                                                               optional_fields: ["Manager_Name","Response_Date","Benefits_Description"] },
  { id: "Contract",          name: "Service Contract",            description: "B2B service agreement with payment terms",         icon: "file-text", required_fields: ["Client_Name","Company","Contract_Creation_Date","Service_Description","Payment_Amount","Start_Date","End_Date"], optional_fields: ["Payment_Schedule","Termination_Clause"] },
  { id: "Onboarding_Letter", name: "Onboarding Letter",           description: "Employee welcome and joining documentation",        icon: "user-plus", required_fields: ["Employee_Name","Emp_ID","Role","Joining_Date","Document_Date"],                                                  optional_fields: [] },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DocIcon({ id, className }: { id: string; className?: string }) {
  const cls = cn("h-5 w-5", className);
  switch (id) {
    case "NDA":               return <Shield className={cls} />;
    case "MOU":               return <Handshake className={cls} />;
    case "IP_Agreement":      return <Copyright className={cls} />;
    case "Offer_Letter":      return <BadgeCheck className={cls} />;
    case "Contract":          return <ClipboardList className={cls} />;
    case "Onboarding_Letter": return <UserPlus className={cls} />;
    default:                  return <FileText className={cls} />;
  }
}

function StepHeader({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2 mb-2">
        <span className="w-5 h-px bg-primary inline-block" /> Step {n} of 9
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldSchema; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder} rows={3}
          className="rounded-xl border-border/60 text-sm resize-none focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/30" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="h-10 rounded-xl border-border/60 text-sm focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/30" />
      )}
    </div>
  );
}

function UploadZone({ label, hint, accept, file, onFile, icon: Icon = Upload }: {
  label: string; hint?: string; accept: string; file?: File | null;
  onFile: (f: File) => void; icon?: React.FC<{ className?: string }>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => ref.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200",
        drag ? "border-primary bg-primary/5" : "border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted border border-border/40">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        {file && <p className="text-xs text-primary mt-1.5 font-semibold">✓ {file.name}</p>}
      </div>
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function labelFor(key: string): string {
  return key.replace(/^CP_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toField(key: string): FieldSchema {
  return {
    key,
    label: labelFor(key),
    placeholder: `Enter ${labelFor(key).toLowerCase()}`,
    type: TEXTAREA_KEYS.has(key) ? "textarea" : "text",
  };
}

async function fetchBlob(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const blob = await r.blob();
  return URL.createObjectURL(blob);
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function DocumentWizard() {
  const [step,           setStep]           = useState<WizardStep>(1);
  const [templates,      setTemplates]      = useState<TemplateInfo[]>([]);
  const [loadingTpls,    setLoadingTpls]    = useState(true);
  const [selectedType,   setSelectedType]   = useState<DocTypeId | null>(null);
  const [inputMethod,    setInputMethod]    = useState<InputMethod>("form");
  const [requiredFields, setRequiredFields] = useState<FieldSchema[]>([]);
  const [optionalFields, setOptionalFields] = useState<FieldSchema[]>([]);
  const [fieldValues,    setFieldValues]    = useState<Record<string, string>>({});
  const [showOptional,   setShowOptional]   = useState(false);
  const [uploadFile,     setUploadFile]     = useState<File | null>(null);
  const [classifying,    setClassifying]    = useState(false);
  const [classifyMsg,    setClassifyMsg]    = useState<{ ok: boolean; text: string } | null>(null);
  const [brandingMode,   setBrandingMode]   = useState<BrandingMode>("turn2law");
  const [brandAssets,    setBrandAssets]    = useState<BrandAssets>({});
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [profileName,    setProfileName]    = useState("");
  const [generating,     setGenerating]     = useState(false);
  const [genSteps,       setGenSteps]       = useState<GenStatus[]>(Array(4).fill("idle"));
  const [docId,          setDocId]          = useState<string | null>(null);
  const [pdfUrl,         setPdfUrl]         = useState<string | null>(null);   // blob for iframe
  const [rawPdfUrl,      setRawPdfUrl]      = useState<string | null>(null);   // proxy for download
  const [genError,       setGenError]       = useState<string | null>(null);
  const [signPw,         setSignPw]         = useState("");
  const [showPw,         setShowPw]         = useState(false);
  const [signerName,     setSignerName]     = useState("");
  const [signReason,     setSignReason]     = useState("");
  const [signLocation,   setSignLocation]   = useState("");
  const [certFile,       setCertFile]       = useState<File | null>(null);
  const [signing,        setSigning]        = useState(false);
  const [signedUrl,      setSignedUrl]      = useState<string | null>(null);   // blob for signed
  const [signError,      setSignError]      = useState<string | null>(null);

  // ── deep-link: ?type= ────────────────────────────────────────────────────
  useEffect(() => {
    if (loadingTpls || templates.length === 0) return;
    const p  = new URLSearchParams(window.location.search);
    const t  = p.get("type");
    if (!t) return;
    const slugMap: Record<string, DocTypeId> = {
      nda: "NDA", mou: "MOU", "ip-assignment": "IP_Agreement",
      "offer-letter": "Offer_Letter", contract: "Contract",
      "onboarding-letter": "Onboarding_Letter", mom: "Onboarding_Letter",
    };
    const id = slugMap[t.toLowerCase()] ?? (templates.find((tp) => tp.id === t)?.id ?? null);
    if (id) { loadSchema(id).then(() => { setSelectedType(id); go(2); }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingTpls, templates]);

  // ── fetch templates ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/docengine/templates")
      .then((r) => r.json())
      .then((data: unknown) => {
        setTemplates(Array.isArray(data) ? (data as TemplateInfo[]) : STATIC_TEMPLATES);
        setLoadingTpls(false);
      })
      .catch(() => { setTemplates(STATIC_TEMPLATES); setLoadingTpls(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── fetch schema ─────────────────────────────────────────────────────────
  async function loadSchema(docType: DocTypeId) {
    const tpl = templates.find((t) => t.id === docType);
    try {
      const res  = await fetch(`/api/docengine/schema/${docType}`);
      const data = await res.json() as { required?: FieldSchema[]; optional?: FieldSchema[] };
      if (Array.isArray(data.required) && Array.isArray(data.optional)) {
        setRequiredFields(data.required);
        setOptionalFields(data.optional.filter((f) => !f.key.startsWith("CP_")));
        return;
      }
    } catch { /* fall through */ }
    setRequiredFields((tpl?.required_fields ?? []).map(toField));
    setOptionalFields((tpl?.optional_fields ?? []).filter((k) => !k.startsWith("CP_")).map(toField));
  }

  // ── navigation ───────────────────────────────────────────────────────────
  function go(n: WizardStep) {
    setStep(n);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  async function selectType(id: DocTypeId) {
    setSelectedType(id);
    setFieldValues({});
    await loadSchema(id);
  }

  // ── classify upload ───────────────────────────────────────────────────────
  async function handleClassify(file: File) {
    setUploadFile(file);
    setClassifying(true);
    setClassifyMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/docengine/classify", { method: "POST", body: fd });
      const data = await res.json() as { doc_type?: string; error?: string };
      if (data.doc_type) {
        const matched = templates.find((t) => t.id === data.doc_type);
        if (matched) {
          await selectType(matched.id);
          setClassifyMsg({ ok: true, text: `Detected: ${matched.name}` });
        } else {
          setClassifyMsg({ ok: false, text: `Unknown type: ${data.doc_type}` });
        }
      } else {
        setClassifyMsg({ ok: false, text: data.error ?? "Could not classify document" });
      }
    } catch {
      setClassifyMsg({ ok: false, text: "Classification failed — check engine connection" });
    }
    setClassifying(false);
  }

  // ── generate ─────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!selectedType) return;
    setGenerating(true);
    setGenError(null);
    setDocId(null);
    setPdfUrl(null);
    setRawPdfUrl(null);
    setGenSteps(Array(4).fill("idle"));

    const advance = (i: number) =>
      setGenSteps((prev) => prev.map((_, idx) => idx < i ? "done" : idx === i ? "active" : "idle"));

    try {
      advance(0);
      await new Promise((r) => setTimeout(r, 500));
      advance(1);

      let result: { success: boolean; doc_id?: string; pdf_url?: string; error?: string };

      if (brandingMode === "letterhead" && letterheadFile) {
        const fd = new FormData();
        fd.append("doc_type",         selectedType);
        fd.append("fields_json",      JSON.stringify(fieldValues));
        fd.append("profile_id",       `lh_${Date.now()}`);
        fd.append("profile_name",     profileName || "Custom Letterhead");
        fd.append("letterhead_image", letterheadFile);
        if (brandAssets.signature) fd.append("signature_image", brandAssets.signature);
        result = await fetch("/api/docengine/generate-with-letterhead", { method: "POST", body: fd }).then((r) => r.json());
      } else if (brandingMode === "custom" && brandAssets.header) {
        const fd = new FormData();
        fd.append("doc_type",      selectedType);
        fd.append("fields_json",   JSON.stringify(fieldValues));
        fd.append("profile_id",    `custom_${Date.now()}`);
        fd.append("profile_name",  profileName || "Custom Brand");
        fd.append("header_image",  brandAssets.header);
        if (brandAssets.footer)    fd.append("footer_image",    brandAssets.footer);
        if (brandAssets.watermark) fd.append("watermark_image", brandAssets.watermark);
        if (brandAssets.logo)      fd.append("logo_image",      brandAssets.logo);
        if (brandAssets.signature) fd.append("signature_image", brandAssets.signature);
        result = await fetch("/api/docengine/generate-with-branding", { method: "POST", body: fd }).then((r) => r.json());
      } else {
        result = await fetch("/api/docengine/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doc_type: selectedType, fields: fieldValues }),
        }).then((r) => r.json());
      }

      advance(2);
      await new Promise((r) => setTimeout(r, 400));
      advance(3);
      await new Promise((r) => setTimeout(r, 300));

      if (result.success && result.doc_id && result.pdf_url) {
        setDocId(result.doc_id);
        const proxyUrl = result.pdf_url.startsWith("http")
          ? result.pdf_url
          : `/api/docengine${result.pdf_url.startsWith("/") ? "" : "/"}${result.pdf_url}`;
        setRawPdfUrl(proxyUrl);
        // Fetch via proxy → create blob URL so iframe never hits direct localhost
        try { setPdfUrl(await fetchBlob(proxyUrl)); } catch { setPdfUrl(proxyUrl); }
        setGenSteps(Array(4).fill("done"));
        setTimeout(() => go(7), 700);
      } else {
        setGenError(result.error ?? "Generation failed — please check the engine");
        setGenerating(false);
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Network error");
      setGenerating(false);
    }
  }

  // ── sign ─────────────────────────────────────────────────────────────────
  async function handleSign() {
    if (!docId || !certFile || !signerName || !signPw) return;
    // Auth gate — only signing requires login
    try {
      const { getSession } = await import("@/lib/supabase-auth");
      const session = await getSession();
      if (!session?.user) {
        window.location.href = `/login?redirect=${encodeURIComponent("/documents")}`;
        return;
      }
    } catch { window.location.href = "/login"; return; }

    setSigning(true);
    setSignError(null);
    const fd = new FormData();
    fd.append("doc_id",        docId);
    fd.append("cert_password", signPw);
    fd.append("signer_name",   signerName);
    if (signReason)   fd.append("reason",   signReason);
    if (signLocation) fd.append("location", signLocation);
    fd.append("visible", "true");
    fd.append("cert_file", certFile);
    try {
      const data = await fetch("/api/docengine/sign", { method: "POST", body: fd }).then((r) => r.json()) as
        { success: boolean; signed_pdf_url?: string; error?: string };
      if (data.success && data.signed_pdf_url) {
        const sp = `/api/docengine${data.signed_pdf_url.startsWith("/") ? "" : "/"}${data.signed_pdf_url}`;
        try { setSignedUrl(await fetchBlob(sp)); } catch { setSignedUrl(sp); }
        go(9);
      } else {
        setSignError(data.error ?? "Signing failed");
      }
    } catch { setSignError("Signing request failed — check engine connection"); }
    setSigning(false);
  }

  // ── reset ────────────────────────────────────────────────────────────────
  function reset() {
    setStep(1); setSelectedType(null); setFieldValues({}); setShowOptional(false);
    setBrandingMode("turn2law"); setBrandAssets({}); setLetterheadFile(null); setProfileName("");
    setDocId(null); setPdfUrl(null); setRawPdfUrl(null); setGenError(null);
    setSignedUrl(null); setSignError(null); setSignPw(""); setSignerName("");
    setSignReason(""); setSignLocation(""); setCertFile(null);
    setUploadFile(null); setClassifyMsg(null); setGenerating(false);
    setGenSteps(Array(4).fill("idle"));
  }

  const canProceedStep3 = !!selectedType;
  const canProceedStep4 = requiredFields.every((f) => (fieldValues[f.key] ?? "").trim() !== "");
  const selectedTpl     = templates.find((t) => t.id === selectedType);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-6 min-h-[600px]">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-52 flex-shrink-0">
        <div className="sticky top-28 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3 px-1">Steps</p>
          <ol className="flex flex-col gap-0.5">
            {STEPS.map(({ n, label }) => {
              const done   = step > n;
              const active = step === n;
              return (
                <li key={n}>
                  <button
                    onClick={() => { if (done) go(n); }}
                    disabled={!done && !active}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                      active  && "bg-primary/10 text-foreground",
                      done    && "cursor-pointer hover:bg-muted/60 text-foreground",
                      !active && !done && "text-muted-foreground/40 cursor-default",
                    )}
                  >
                    <span className={cn(
                      "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold border-2 transition-all",
                      active && "border-primary bg-primary text-white",
                      done   && "border-primary/50 bg-primary/10 text-primary",
                      !active && !done && "border-border/30 text-muted-foreground/30",
                    )}>
                      {done ? <CheckCircle2 className="h-3 w-3" /> : n}
                    </span>
                    <span className="text-[13px] font-medium leading-none">{label}</span>
                  </button>
                  {n < 9 && (
                    <div className={cn("ml-[22px] w-px h-2", done ? "bg-primary/25" : "bg-border/25")} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      {/* ── Mobile step strip ── */}
      <div className="lg:hidden w-full mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STEPS.map(({ n, label }) => (
            <button key={n}
              onClick={() => { if (step > n) go(n); }}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all",
                step === n && "border-primary bg-primary/10 text-foreground",
                step > n   && "border-primary/30 bg-primary/5 text-primary cursor-pointer",
                step < n   && "border-border/30 text-muted-foreground/30",
              )}
            >
              <span className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                step === n && "bg-primary text-white",
                step > n   && "bg-primary/15 text-primary",
              )}>
                {step > n ? "✓" : n}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}
          >

            {/* ══ STEP 1 ═══════════════════════════════════════════════════ */}
            {step === 1 && (
              <div>
                <StepHeader n={1} title="Select Document Type"
                  desc="Choose the type of legal document you want to generate." />
                {loadingTpls ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-[140px] rounded-2xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {templates.map((tpl) => (
                      <button key={tpl.id}
                        onClick={async () => { await selectType(tpl.id); go(2); }}
                        className={cn(
                          "group text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                          selectedType === tpl.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0", DOC_BG[tpl.id] ?? "bg-muted")}>
                            <DocIcon id={tpl.id} className={DOC_COLORS[tpl.id]} />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground border border-border/40 rounded-full px-2 py-0.5 mt-0.5">
                            {tpl.id.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-foreground mb-1 leading-snug">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{tpl.description}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          Select <ArrowRight className="h-3 w-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ STEP 2 ═══════════════════════════════════════════════════ */}
            {step === 2 && (
              <div>
                <StepHeader n={2} title="Input Method" desc="How would you like to provide document details?" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-xl">
                  {([
                    { id: "form"   as InputMethod, icon: FileText, title: "Fill Form",   desc: "Enter details manually in a guided form.", rec: true  },
                    { id: "upload" as InputMethod, icon: Upload,   title: "Upload File", desc: "Upload a PDF, DOCX, or image for AI auto-detection.", rec: false },
                  ] as const).map((m) => (
                    <button key={m.id} onClick={() => setInputMethod(m.id)}
                      className={cn(
                        "relative text-left p-5 rounded-2xl border-2 transition-all duration-200",
                        inputMethod === m.id ? "border-primary bg-primary/5" : "border-border/50 bg-card hover:border-primary/40"
                      )}
                    >
                      {m.rec && (
                        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                          Recommended
                        </span>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                          <m.icon className="h-4 w-4 text-foreground" />
                        </div>
                        <p className="font-semibold text-sm">{m.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </button>
                  ))}
                </div>

                {inputMethod === "upload" && (
                  <div className="mb-6 max-w-md">
                    <UploadZone label="Drop your document here or click to browse"
                      hint="PDF, DOCX, PNG, JPG — max 20 MB"
                      accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                      file={uploadFile} onFile={handleClassify} />
                    {classifying && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Classifying…
                      </div>
                    )}
                    {classifyMsg && (
                      <div className={cn(
                        "mt-3 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border",
                        classifyMsg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-red-50 border-red-200 text-red-700"
                      )}>
                        {classifyMsg.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                        {classifyMsg.text}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => go(1)} className="rounded-xl gap-1.5 h-10">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => go(3)} disabled={!canProceedStep3} className="rounded-xl gap-1.5 h-10">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ══ STEP 3 ═══════════════════════════════════════════════════ */}
            {step === 3 && selectedType && (
              <div>
                <StepHeader n={3} title="Fill Document Details"
                  desc={`Enter the required information for your ${selectedTpl?.name ?? selectedType}.`} />

                {/* Required */}
                <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 mb-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border/40">
                    <span className="text-sm font-semibold">Required Fields</span>
                    <span className="text-[10px] font-mono text-muted-foreground border border-border/40 rounded-full px-2 py-0.5">
                      {requiredFields.length} fields
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requiredFields.map((f) => (
                      <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                        <FieldInput field={f}
                          value={fieldValues[f.key] ?? ""}
                          onChange={(v) => setFieldValues((prev) => ({ ...prev, [f.key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional */}
                {optionalFields.length > 0 && (
                  <div className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 mb-4 shadow-sm">
                    <button
                      onClick={() => setShowOptional((v) => !v)}
                      className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
                    >
                      <span>
                        Optional Fields
                        <span className="ml-1.5 text-muted-foreground font-normal text-xs">({optionalFields.length})</span>
                      </span>
                      {showOptional ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {showOptional && (
                      <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {optionalFields.map((f) => (
                          <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                            <FieldInput field={f}
                              value={fieldValues[f.key] ?? ""}
                              onChange={(v) => setFieldValues((prev) => ({ ...prev, [f.key]: v }))} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => go(2)} className="rounded-xl gap-1.5 h-10">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => go(4)} disabled={!canProceedStep4} className="rounded-xl gap-1.5 h-10">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ══ STEP 4 ═══════════════════════════════════════════════════ */}
            {step === 4 && (
              <div>
                <StepHeader n={4} title="Branding" desc="Choose how your document should be branded." />
                <div className="flex flex-col gap-3 mb-6 max-w-xl">
                  {([
                    { id: "turn2law"   as BrandingMode, Icon: Building2, title: "Turn2Law Standard",     desc: "Professional Turn2Law letterhead and gold/charcoal colour scheme.",     badge: "Default" },
                    { id: "letterhead" as BrandingMode, Icon: ImageIcon,  title: "Complete Letterhead",  desc: "Upload a single A4 PNG containing your full page design.",              badge: "Recommended" },
                    { id: "custom"     as BrandingMode, Icon: Brush,      title: "Advanced Custom",      desc: "Upload individual header, footer, watermark, and logo assets.",         badge: "" },
                  ] as const).map((b) => (
                    <div key={b.id}>
                      <button onClick={() => setBrandingMode(b.id)}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                          brandingMode === b.id ? "border-primary bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "flex h-5 w-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all items-center justify-center",
                          brandingMode === b.id ? "border-primary bg-primary" : "border-border/50"
                        )}>
                          {brandingMode === b.id && <span className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <b.Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold text-sm">{b.title}</span>
                            {b.badge && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                                {b.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{b.desc}</p>
                        </div>
                      </button>

                      {brandingMode === "letterhead" && b.id === "letterhead" && (
                        <div className="mt-3 ml-9 space-y-3">
                          <UploadZone label="Upload A4 letterhead PNG"
                            hint="PNG only, max 20 MB · 2480×3508 px recommended"
                            accept=".png" file={letterheadFile}
                            onFile={setLetterheadFile} icon={ImageIcon} />
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block">Profile Name</Label>
                            <Input value={profileName} onChange={(e) => setProfileName(e.target.value)}
                              placeholder="e.g. ACME Corp Brand"
                              className="h-10 rounded-xl border-border/60 text-sm" />
                          </div>
                        </div>
                      )}

                      {brandingMode === "custom" && b.id === "custom" && (
                        <div className="mt-3 ml-9">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            {(["header","footer","watermark","logo","signature"] as const).map((k) => (
                              <UploadZone key={k}
                                label={`${k.charAt(0).toUpperCase() + k.slice(1)} PNG${k === "header" ? " *" : ""}`}
                                accept=".png" file={brandAssets[k] ?? null}
                                onFile={(f) => setBrandAssets((p) => ({ ...p, [k]: f }))}
                                icon={ImageIcon} />
                            ))}
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block">Profile Name</Label>
                            <Input value={profileName} onChange={(e) => setProfileName(e.target.value)}
                              placeholder="e.g. My Company Brand"
                              className="h-10 rounded-xl border-border/60 text-sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => go(3)} className="rounded-xl gap-1.5 h-10">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => go(5)} className="rounded-xl gap-1.5 h-10">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ══ STEP 5 ═══════════════════════════════════════════════════ */}
            {step === 5 && selectedType && (
              <div>
                <StepHeader n={5} title="Review" desc="Confirm everything looks right before generating." />

                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-4 mb-5">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0", DOC_BG[selectedType] ?? "bg-muted")}>
                    <DocIcon id={selectedType} className={DOC_COLORS[selectedType]} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{selectedTpl?.name ?? selectedType}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {brandingMode === "turn2law" ? "Turn2Law standard branding"
                        : brandingMode === "letterhead" ? "Custom letterhead"
                        : "Advanced custom branding"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {requiredFields.map((f) => (
                    <div key={f.key} className={cn("rounded-xl border border-border/40 bg-card p-3 shadow-sm", f.type === "textarea" && "sm:col-span-2")}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">{f.label}</p>
                      <p className={cn("text-sm break-words", fieldValues[f.key] ? "text-foreground" : "italic text-muted-foreground/40")}>
                        {fieldValues[f.key] || "—"}
                      </p>
                    </div>
                  ))}
                  {optionalFields.filter((f) => fieldValues[f.key]).map((f) => (
                    <div key={f.key} className={cn("rounded-xl border border-border/40 bg-card p-3 shadow-sm", f.type === "textarea" && "sm:col-span-2")}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1">{f.label}</p>
                      <p className="text-sm text-foreground break-words">{fieldValues[f.key]}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => go(4)} className="rounded-xl gap-1.5 h-10">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => { go(6); handleGenerate(); }} className="rounded-xl gap-1.5 h-10 px-6">
                    Generate Document <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ══ STEP 6 ═══════════════════════════════════════════════════ */}
            {step === 6 && (
              <div>
                <StepHeader n={6} title="Generating Document" desc="Please wait while we create your PDF…" />
                <div className="max-w-md mx-auto">
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-8">
                    <motion.div className="h-full bg-primary rounded-full"
                      animate={{ width: `${(genSteps.filter((s) => s === "done").length / 4) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>

                  {/* Step list */}
                  <div className="flex flex-col gap-0">
                    {GEN_STEP_LABELS.map((label, i) => (
                      <div key={label} className="flex items-start gap-4 py-3.5 relative">
                        {i < 3 && (
                          <div className={cn("absolute left-3.5 top-10 w-px h-5 transition-colors", genSteps[i] === "done" ? "bg-primary/40" : "bg-border/40")} />
                        )}
                        <div className={cn(
                          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 z-10 bg-background",
                          genSteps[i] === "done"   && "border-primary bg-primary",
                          genSteps[i] === "active" && "border-primary bg-primary",
                          genSteps[i] === "idle"   && "border-border/40",
                        )}>
                          {genSteps[i] === "done"   && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          {genSteps[i] === "active" && <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />}
                          {genSteps[i] === "idle"   && <span className="text-[10px] text-muted-foreground/40 font-bold">{i + 1}</span>}
                        </div>
                        <div className="pt-0.5">
                          <p className={cn("text-sm font-medium transition-colors",
                            genSteps[i] === "done"   && "text-primary",
                            genSteps[i] === "active" && "text-foreground",
                            genSteps[i] === "idle"   && "text-muted-foreground/40",
                          )}>{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Error */}
                  {genError && !generating && (
                    <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        <p className="font-semibold text-sm text-destructive">Generation Failed</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{genError}</p>
                      <div className="flex gap-3">
                        <Button size="sm" variant="outline" onClick={() => go(5)} className="rounded-xl gap-1.5">
                          <ArrowLeft className="h-3.5 w-3.5" /> Back to Review
                        </Button>
                        <Button size="sm" onClick={() => { setGenError(null); setGenSteps(Array(4).fill("idle")); handleGenerate(); }} className="rounded-xl gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5" /> Retry
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ STEP 7 ═══════════════════════════════════════════════════ */}
            {step === 7 && (
              <div>
                <StepHeader n={7} title="PDF Preview" desc="Your document has been generated. Review it below." />

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Button size="sm" variant="outline" asChild className="rounded-xl gap-1.5 h-9">
                    <a href={rawPdfUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="rounded-xl gap-1.5 h-9">
                    <a href={pdfUrl ?? rawPdfUrl ?? "#"} download={`${selectedType ?? "document"}.pdf`}>
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </a>
                  </Button>
                  {docId && (
                    <span className="ml-auto text-xs text-muted-foreground font-mono bg-muted/50 px-2.5 py-1 rounded-full">
                      ID: {docId}
                    </span>
                  )}
                </div>

                {pdfUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-border/40 shadow-sm mb-5">
                    <iframe src={pdfUrl} title="PDF Preview"
                      className="w-full h-[65vh] border-none bg-muted/10" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/40 bg-muted/20 h-64 flex items-center justify-center mb-5">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading PDF…</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => go(5)} className="rounded-xl gap-1.5 h-10">
                    <ArrowLeft className="h-4 w-4" /> Back to Review
                  </Button>
                  <Button onClick={() => go(8)} className="rounded-xl gap-1.5 h-10">
                    Sign Document <Key className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => go(9)} className="rounded-xl h-10">
                    Skip to Download
                  </Button>
                </div>
              </div>
            )}

            {/* ══ STEP 8 ═══════════════════════════════════════════════════ */}
            {step === 8 && (
              <div>
                <StepHeader n={8} title="Digital Signature"
                  desc="Sign your PDF with a PKCS#12 certificate (.pfx / .p12). Requires login." />
                <div className="max-w-lg space-y-4">
                  <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {[
                        { label: "Signer Name *",     val: signerName,    set: setSignerName,    ph: "Full legal name" },
                        { label: "Reason",             val: signReason,    set: setSignReason,    ph: "e.g. Digitally approved" },
                        { label: "Location",           val: signLocation,  set: setSignLocation,  ph: "e.g. Chennai, India" },
                      ].map((f) => (
                        <div key={f.label} className="flex flex-col gap-1.5">
                          <Label className="text-sm font-medium">{f.label}</Label>
                          <Input value={f.val} onChange={(e) => f.set(e.target.value)}
                            placeholder={f.ph}
                            className="h-10 rounded-xl border-border/60 text-sm" />
                        </div>
                      ))}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-medium">Certificate Password *</Label>
                        <div className="relative">
                          <Input type={showPw ? "text" : "password"} value={signPw}
                            onChange={(e) => setSignPw(e.target.value)}
                            placeholder="••••••"
                            className="h-10 rounded-xl border-border/60 text-sm pr-10" />
                          <button type="button" onClick={() => setShowPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <UploadZone label="Upload PKCS#12 certificate (.pfx / .p12)"
                      hint="Class 3 DSC or self-signed test certificate"
                      accept=".pfx,.p12" file={certFile} onFile={setCertFile} icon={Key} />
                  </div>

                  {signError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" /> {signError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => go(7)} className="rounded-xl gap-1.5 h-10">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button onClick={handleSign}
                      disabled={signing || !certFile || !signerName.trim() || !signPw}
                      className="rounded-xl gap-1.5 h-10"
                    >
                      {signing
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing…</>
                        : <><Key className="h-4 w-4" /> Sign &amp; Continue</>}
                    </Button>
                    <Button variant="outline" onClick={() => go(9)} className="rounded-xl h-10">
                      Skip signing
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ══ STEP 9 ═══════════════════════════════════════════════════ */}
            {step === 9 && (
              <div>
                <StepHeader n={9} title="Download" desc="Your document is ready." />
                <div className="max-w-md space-y-5">
                  {/* Success banner */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800 p-4 flex items-center gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">Document ready!</p>
                      <p className="text-xs text-emerald-700/60 dark:text-emerald-400/50 mt-0.5">
                        {signedUrl ? "Signed and unsigned PDFs available below." : "Your PDF is available below."}
                      </p>
                    </div>
                  </div>

                  {/* Download cards */}
                  <div className="flex flex-col gap-3">
                    {(pdfUrl || rawPdfUrl) && (
                      <a href={pdfUrl ?? rawPdfUrl ?? "#"}
                        download={`${(selectedType ?? "document").replace(/_/g, "_")}.pdf`}
                        className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                            <FileText className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{selectedType?.replace(/_/g, " ")}.pdf</p>
                            <p className="text-xs text-muted-foreground">Original document</p>
                          </div>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    )}
                    {signedUrl && (
                      <a href={signedUrl}
                        download={`${(selectedType ?? "document").replace(/_/g, "_")}_signed.pdf`}
                        className="flex items-center justify-between p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 hover:border-emerald-400 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Key className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{selectedType?.replace(/_/g, " ")}_signed.pdf</p>
                            <p className="text-xs text-muted-foreground">Digitally signed · CMS/PAdES</p>
                          </div>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/40">
                    <Button onClick={reset} className="rounded-xl gap-2 h-10 w-full sm:w-auto">
                      <RotateCcw className="h-4 w-4" /> Generate Another Document
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground/50 leading-relaxed">
                      Documents are generated from structured legal templates. For complex matters,{" "}
                      <Link href="/consult" className="underline underline-offset-2 hover:text-foreground transition-colors">
                        consult a qualified lawyer
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
