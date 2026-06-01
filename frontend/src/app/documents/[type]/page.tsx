"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SpotlightCard from "@/components/ui/SpotlightCard";

import { FileText, ClipboardCopy, Download, ArrowLeft, Check } from "lucide-react";
import { DocumentType } from "@/lib/documents";

export default function DocumentCreatePage() {
  const params = useParams<{ type?: string }>();

  // detect doc from route
  const docRoute = (params?.type || "nda").toLowerCase();

  // Map route to DocumentType enum
  let docType: DocumentType = DocumentType.NDA;
  let displayName = "NDA";

  if (docRoute === "mou") {
    docType = DocumentType.MOU;
    displayName = "MOU";
  } else if (docRoute === "ip-assignment") {
    docType = DocumentType.IP_ASSIGNMENT;
    displayName = "IP Assignment";
  } else if (docRoute === "offer-letter") {
    docType = DocumentType.OFFER_LETTER;
    displayName = "Offer Letter";
  } else if (docRoute === "mom") {
    docType = DocumentType.MOM;
    displayName = "Minutes of Meeting";
  }

  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  // NDA form state
  const [ndaForm, setNdaForm] = useState({
    disclosingParty: "",
    receivingParty: "",
    effectiveDate: "",
    termMonths: 12,
    governingLaw: "",
    purpose: "",
  });

  // MOU form state
  const [mouForm, setMouForm] = useState({
    partyA: "",
    partyB: "",
    effectiveDate: "",
    scope: "",
    responsibilitiesA: "",
    responsibilitiesB: "",
    termMonths: 12,
    governingLaw: "",
  });

  // IP Assignment form state
  const [ipForm, setIpForm] = useState({
    assignor: "",
    assignee: "",
    effectiveDate: "",
    ipDescription: "",
    consideration: "",
    governingLaw: "",
  });

  // Offer Letter form state
  const [offerForm, setOfferForm] = useState({
    candidateName: "",
    position: "",
    joiningDate: "",
    CTC: "",
    location: "",
    reportingManager: "",
    companyName: "",
  });

  // MOM form state
  const [momForm, setMomForm] = useState({
    meetingTitle: "",
    meetingDate: "",
    meetingTime: "",
    location: "",
    attendees: [""],
    agendaPoints: [""],
    actionItems: [{ task: "", owner: "", dueDate: "" }],
    notes: "",
    preparedBy: "",
  });

  /* ------------------ GENERATE DOCUMENT ------------------ */
  async function handleGenerate() {
    setGenerating(true);
    setDraft("Please wait… generating document");

    try {
      let requestData: any = {};

      if (docType === DocumentType.NDA) {
        requestData = {
          type: DocumentType.NDA,
          data: ndaForm,
        };
      } else if (docType === DocumentType.MOU) {
        requestData = {
          type: DocumentType.MOU,
          data: mouForm,
        };
      } else if (docType === DocumentType.IP_ASSIGNMENT) {
        requestData = {
          type: DocumentType.IP_ASSIGNMENT,
          data: ipForm,
        };
      } else if (docType === DocumentType.OFFER_LETTER) {
        requestData = {
          type: DocumentType.OFFER_LETTER,
          data: offerForm,
        };
      } else if (docType === DocumentType.MOM) {
        requestData = {
          type: DocumentType.MOM,
          data: {
            ...momForm,
            attendees: momForm.attendees.filter(a => a.trim() !== ""),
            agendaPoints: momForm.agendaPoints.filter(a => a.trim() !== ""),
            actionItems: momForm.actionItems.filter(a => a.task.trim() !== ""),
          },
        };
      }

      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const json = await res.json();

      if (json.ok && json.draft) {
        setDraft(json.draft);
      } else {
        setDraft(`❌ Error: ${json.error || "Failed to generate document"}`);
      }
    } catch (err) {
      console.error(err);
      setDraft("❌ Error generating document");
    }

    setGenerating(false);
  }

  /* ------------------ COPY TO CLIPBOARD ------------------ */
  async function handleCopy() {
    if (!draft || draft.startsWith("❌") || draft.startsWith("Please wait")) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  /* ------------------ DOWNLOAD AS TXT ------------------ */
  function handleDownload() {
    if (!draft || draft.startsWith("❌") || draft.startsWith("Please wait")) return;
    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayName.replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ------------------ RENDER FORMS ------------------ */
  function renderNDAForm() {
    return (
      <div className="space-y-3 sm:space-y-4">
        <FormField label="Disclosing Party" value={ndaForm.disclosingParty} onChange={(v) => setNdaForm({ ...ndaForm, disclosingParty: v })} />
        <FormField label="Receiving Party" value={ndaForm.receivingParty} onChange={(v) => setNdaForm({ ...ndaForm, receivingParty: v })} />
        <FormField label="Effective Date" value={ndaForm.effectiveDate} onChange={(v) => setNdaForm({ ...ndaForm, effectiveDate: v })} type="date" />
        <FormField label="Term (Months)" value={ndaForm.termMonths.toString()} onChange={(v) => setNdaForm({ ...ndaForm, termMonths: parseInt(v) || 12 })} type="number" />
        <FormField label="Governing Law (Jurisdiction)" value={ndaForm.governingLaw} onChange={(v) => setNdaForm({ ...ndaForm, governingLaw: v })} />
        <FormFieldTextarea label="Purpose" value={ndaForm.purpose} onChange={(v) => setNdaForm({ ...ndaForm, purpose: v })} />
      </div>
    );
  }

  function renderMOUForm() {
    return (
      <div className="space-y-3 sm:space-y-4">
        <FormField label="Party A" value={mouForm.partyA} onChange={(v) => setMouForm({ ...mouForm, partyA: v })} />
        <FormField label="Party B" value={mouForm.partyB} onChange={(v) => setMouForm({ ...mouForm, partyB: v })} />
        <FormField label="Effective Date" value={mouForm.effectiveDate} onChange={(v) => setMouForm({ ...mouForm, effectiveDate: v })} type="date" />
        <FormFieldTextarea label="Scope" value={mouForm.scope} onChange={(v) => setMouForm({ ...mouForm, scope: v })} />
        <FormFieldTextarea label="Responsibilities of Party A" value={mouForm.responsibilitiesA} onChange={(v) => setMouForm({ ...mouForm, responsibilitiesA: v })} />
        <FormFieldTextarea label="Responsibilities of Party B" value={mouForm.responsibilitiesB} onChange={(v) => setMouForm({ ...mouForm, responsibilitiesB: v })} />
        <FormField label="Term (Months)" value={mouForm.termMonths.toString()} onChange={(v) => setMouForm({ ...mouForm, termMonths: parseInt(v) || 12 })} type="number" />
        <FormField label="Governing Law" value={mouForm.governingLaw} onChange={(v) => setMouForm({ ...mouForm, governingLaw: v })} />
      </div>
    );
  }

  function renderIPForm() {
    return (
      <div className="space-y-3 sm:space-y-4">
        <FormField label="Assignor" value={ipForm.assignor} onChange={(v) => setIpForm({ ...ipForm, assignor: v })} />
        <FormField label="Assignee" value={ipForm.assignee} onChange={(v) => setIpForm({ ...ipForm, assignee: v })} />
        <FormField label="Effective Date" value={ipForm.effectiveDate} onChange={(v) => setIpForm({ ...ipForm, effectiveDate: v })} type="date" />
        <FormFieldTextarea label="IP Description" value={ipForm.ipDescription} onChange={(v) => setIpForm({ ...ipForm, ipDescription: v })} />
        <FormField label="Consideration" value={ipForm.consideration} onChange={(v) => setIpForm({ ...ipForm, consideration: v })} />
        <FormField label="Governing Law" value={ipForm.governingLaw} onChange={(v) => setIpForm({ ...ipForm, governingLaw: v })} />
      </div>
    );
  }

  function renderOfferForm() {
    return (
      <div className="space-y-3 sm:space-y-4">
        <FormField label="Candidate Name" value={offerForm.candidateName} onChange={(v) => setOfferForm({ ...offerForm, candidateName: v })} />
        <FormField label="Position" value={offerForm.position} onChange={(v) => setOfferForm({ ...offerForm, position: v })} />
        <FormField label="Company Name" value={offerForm.companyName} onChange={(v) => setOfferForm({ ...offerForm, companyName: v })} />
        <FormField label="Joining Date" value={offerForm.joiningDate} onChange={(v) => setOfferForm({ ...offerForm, joiningDate: v })} type="date" />
        <FormField label="CTC / Salary" value={offerForm.CTC} onChange={(v) => setOfferForm({ ...offerForm, CTC: v })} />
        <FormField label="Location" value={offerForm.location} onChange={(v) => setOfferForm({ ...offerForm, location: v })} />
        <FormField label="Reporting Manager" value={offerForm.reportingManager} onChange={(v) => setOfferForm({ ...offerForm, reportingManager: v })} />
      </div>
    );
  }

  function renderMOMForm() {
    return (
      <div className="space-y-3 sm:space-y-4">
        <FormField label="Meeting Title" value={momForm.meetingTitle} onChange={(v) => setMomForm({ ...momForm, meetingTitle: v })} />
        <FormField label="Meeting Date" value={momForm.meetingDate} onChange={(v) => setMomForm({ ...momForm, meetingDate: v })} type="date" />
        <FormField label="Meeting Time" value={momForm.meetingTime} onChange={(v) => setMomForm({ ...momForm, meetingTime: v })} type="time" />
        <FormField label="Location" value={momForm.location} onChange={(v) => setMomForm({ ...momForm, location: v })} />
        <FormField label="Prepared By" value={momForm.preparedBy} onChange={(v) => setMomForm({ ...momForm, preparedBy: v })} />

        <div className="grid gap-1.5 sm:gap-2">
          <Label className="text-sm sm:text-base">Attendees</Label>
          {momForm.attendees.map((attendee, idx) => (
            <Input
              key={idx}
              value={attendee}
              onChange={(e) => {
                const newAttendees = [...momForm.attendees];
                newAttendees[idx] = e.target.value;
                setMomForm({ ...momForm, attendees: newAttendees });
              }}
              placeholder={`Attendee ${idx + 1}`}
              className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
            />
          ))}
          <Button variant="outline" size="sm" onClick={() => setMomForm({ ...momForm, attendees: [...momForm.attendees, ""] })}>
            + Add Attendee
          </Button>
        </div>

        <div className="grid gap-1.5 sm:gap-2">
          <Label className="text-sm sm:text-base">Agenda Points</Label>
          {momForm.agendaPoints.map((point, idx) => (
            <Input
              key={idx}
              value={point}
              onChange={(e) => {
                const newPoints = [...momForm.agendaPoints];
                newPoints[idx] = e.target.value;
                setMomForm({ ...momForm, agendaPoints: newPoints });
              }}
              placeholder={`Agenda ${idx + 1}`}
              className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
            />
          ))}
          <Button variant="outline" size="sm" onClick={() => setMomForm({ ...momForm, agendaPoints: [...momForm.agendaPoints, ""] })}>
            + Add Agenda Point
          </Button>
        </div>

        <FormFieldTextarea label="Notes" value={momForm.notes} onChange={(v) => setMomForm({ ...momForm, notes: v })} />
      </div>
    );
  }

  function renderForm() {
    switch (docType) {
      case DocumentType.NDA:
        return renderNDAForm();
      case DocumentType.MOU:
        return renderMOUForm();
      case DocumentType.IP_ASSIGNMENT:
        return renderIPForm();
      case DocumentType.OFFER_LETTER:
        return renderOfferForm();
      case DocumentType.MOM:
        return renderMOMForm();
      default:
        return renderNDAForm();
    }
  }

  /* ------------------ RENDER UI ------------------ */
  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" asChild className="active:scale-95 transition-transform">
            <a href="/documents" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Document Types</span>
              <span className="sm:hidden">Back</span>
            </a>
          </Button>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
          {displayName} Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* LEFT FORM */}
          <SpotlightCard className="p-4 sm:p-5 rounded-xl sm:rounded-2xl">
            {renderForm()}

            <Button
              className="w-full h-11 sm:h-12 mt-4 sm:mt-6 rounded-xl active:scale-95 transition-transform text-sm sm:text-base"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating..." : `Generate ${displayName}`}
            </Button>
          </SpotlightCard>

          {/* RIGHT PREVIEW */}
          <SpotlightCard className="p-4 sm:p-5 rounded-xl sm:rounded-2xl col-span-1 lg:col-span-2">
            {draft && !draft.startsWith("❌") && !draft.startsWith("Please wait") && (
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download TXT
                </Button>
              </div>
            )}

            {draft ? (
              <pre className="min-h-[240px] sm:min-h-[320px] whitespace-pre-wrap text-xs sm:text-sm bg-muted/30 p-3 sm:p-5 rounded-md leading-relaxed overflow-x-auto">
                {draft}
              </pre>
            ) : (
              <div className="min-h-[240px] sm:min-h-[320px] grid place-items-center text-muted-foreground border border-dashed rounded-md">
                <div className="text-center px-4">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                  <p className="text-sm sm:text-base">Your generated document will appear here.</p>
                </div>
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

/* ------------------ FORM FIELD COMPONENTS ------------------ */
function FormField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-1.5 sm:gap-2"
    >
      <Label className="text-sm sm:text-base">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 sm:h-11 rounded-xl text-sm sm:text-base"
      />
    </motion.div>
  );
}

function FormFieldTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-1.5 sm:gap-2"
    >
      <Label className="text-sm sm:text-base">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
      />
    </motion.div>
  );
}
