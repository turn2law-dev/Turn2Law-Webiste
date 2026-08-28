/**
 * document-generation.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin client that calls the Turn2Law document engine (FastAPI on :8000).
 *
 * Engine API contract (POST /api/generate):
 *   Request:  { doc_type: string, fields: Record<string, string> }
 *   Response: { success: true,  doc_id: string, pdf_url: string, doc_type: string }
 *           | { success: false, error: string }
 *
 * Field name reference (from schema.py):
 *   NDA          → Name, Company, Date, Term, Jurisdiction, [Confidential_Info_Description, Governing_Law]
 *   MOU          → PartyA_Name, PartyB_Name, Date, Purpose, Term, Jurisdiction, [Confidentiality, Governing_Law]
 *   IP_Agreement → Name, Company, Date, Term, Jurisdiction, [IP_Description, Governing_Law]
 *   Offer_Letter → Name, Company, Position, Start_Date, Salary, [Manager_Name]
 *   Contract     → Client_Name, Company, Contract_Creation_Date, Service_Description, Payment_Amount, Start_Date, End_Date
 */

import { DocumentType, type DocumentInputByType } from "@/lib/documents";

export const DOCUMENT_ENGINE_URL = (
  process.env.DOCUMENT_GENERATION_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

// ─── Types ───────────────────────────────────────────────────────────────────

type EngineResult = {
  success: boolean;
  doc_id?: string;
  pdf_url?: string;
  doc_type?: string;
  error?: string;
};

export type PdfResult = {
  success: true;
  doc_id: string;
  pdf_url: string;
  doc_type: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format a YYYY-MM-DD date string to a human-readable form the engine accepts */
function formatDate(value: string): string {
  if (!value) return value;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Field mapping: our DocumentType → engine doc_type + fields ──────────────

function toEngineRequest(input: DocumentInputByType): {
  doc_type: string;
  fields: Record<string, string>;
} {
  switch (input.type) {
    // ── NDA ──────────────────────────────────────────────────────────────────
    case DocumentType.NDA:
      return {
        doc_type: "NDA",
        fields: {
          Name:                        input.data.receivingParty,
          Company:                     input.data.disclosingParty,
          Date:                        formatDate(input.data.effectiveDate),
          Term:                        `${input.data.termMonths} months`,
          Jurisdiction:                input.data.governingLaw,
          Confidential_Info_Description: input.data.purpose,
          Governing_Law:               input.data.governingLaw,
        },
      };

    // ── MOU ──────────────────────────────────────────────────────────────────
    case DocumentType.MOU:
      return {
        doc_type: "MOU",
        fields: {
          PartyA_Name:   input.data.partyA,
          PartyB_Name:   input.data.partyB,
          Date:          formatDate(input.data.effectiveDate),
          Purpose:       input.data.scope,
          Term:          `${input.data.termMonths} months`,
          Jurisdiction:  input.data.governingLaw,
          Confidentiality: `Party A: ${input.data.responsibilitiesA}. Party B: ${input.data.responsibilitiesB}.`,
          Governing_Law: input.data.governingLaw,
        },
      };

    // ── IP Assignment → engine calls it IP_Agreement ──────────────────────
    case DocumentType.IP_ASSIGNMENT:
      return {
        doc_type: "IP_Agreement",
        fields: {
          Name:           input.data.assignor,
          Company:        input.data.assignee,
          Date:           formatDate(input.data.effectiveDate),
          Term:           "Perpetual",
          Jurisdiction:   input.data.governingLaw,
          IP_Description: input.data.ipDescription,
          Governing_Law:  input.data.governingLaw,
        },
      };

    // ── Offer Letter ─────────────────────────────────────────────────────────
    case DocumentType.OFFER_LETTER:
      return {
        doc_type: "Offer_Letter",
        fields: {
          Name:         input.data.candidateName,
          Company:      input.data.companyName,
          Position:     input.data.position,
          Start_Date:   formatDate(input.data.joiningDate),
          Salary:       input.data.CTC,
          Manager_Name: input.data.reportingManager,
        },
      };

    // ── MOM — engine has no MOM template; caller must handle separately ──────
    case DocumentType.MOM:
      throw new Error(
        "Minutes of Meeting PDF generation is not available in the document engine. " +
        "Use the text fallback path instead."
      );
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generatePdfDocument(
  input: DocumentInputByType
): Promise<PdfResult> {
  const request = toEngineRequest(input);

  let response: Response;
  try {
    response = await fetch(`${DOCUMENT_ENGINE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      cache: "no-store",
    });
  } catch (err) {
    throw new Error(
      `Document engine is unreachable at ${DOCUMENT_ENGINE_URL}. ` +
        "Make sure the Python server is running on port 8000."
    );
  }

  let result: EngineResult;
  try {
    result = (await response.json()) as EngineResult;
  } catch {
    throw new Error(
      `Document engine returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || !result.success || !result.pdf_url || !result.doc_id) {
    throw new Error(
      result.error ?? `Document generation failed (HTTP ${response.status}).`
    );
  }

  // Resolve the PDF URL — engine returns a relative path like /files/abc123.pdf
  const pdfUrl = result.pdf_url.startsWith("http")
    ? result.pdf_url
    : `${DOCUMENT_ENGINE_URL}${result.pdf_url.startsWith("/") ? "" : "/"}${result.pdf_url}`;

  return {
    success: true,
    doc_id:   result.doc_id,
    doc_type: result.doc_type ?? request.doc_type,
    pdf_url:  pdfUrl,
  };
}
