import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// ──────────────────────────────────────────────
//  OpenRouter AI — plain fetch (no extra package)
// ──────────────────────────────────────────────
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL    = 'google/gemini-2.0-flash-001';

async function callOpenRouterAI(systemPrompt: string, userPrompt: string, maxTokens = 2400): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('[Legal Navigator] OPENROUTER_API_KEY not set — skipping AI enrichment');
    return null;
  }

  try {
    const res = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://turn2law.tech',
        'X-Title': 'Turn2Law Legal Navigator',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.1,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Legal Navigator] OpenRouter error:', res.status, err);
      return null;
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error('[Legal Navigator] OpenRouter fetch error:', err);
    return null;
  }
}

// ──────────────────────────────────────────────
//  Interfaces
// ──────────────────────────────────────────────
interface LegalNavigatorRequest {
  problem_description: string;
  location: string;
}

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

interface LegalNavigatorResponse {
  problem_summary: string;
  category: string;
  subcategory: string;
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  urgency_reason: string;
  estimated_timeline: string;
  recommended_authority: RecommendedAuthority;
  alternate_authorities: AlternateAuthority[];
  action_steps: { step: string; detail: string }[];
  documents_required: string[];
  do_not_do: string[];
  rights_of_the_person: string[];
  limitation_period: string;
  cost_estimate: CostEstimate;
  helpline_numbers: { label: string; number: string }[];
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

// ──────────────────────────────────────────────
//  Master AI System Prompt — v3 (expanded schema)
// ──────────────────────────────────────────────
const MASTER_SYSTEM_PROMPT = `You are a Senior Indian Legal Advocate and forensic classifier with 25+ years of practice. You have deep expertise in IPC, BNS 2023, CrPC, BNSS 2023, CPC, Consumer Protection Act 2019, Labour Laws (ID Act, PF Act, ESIC), NDPS Act, POCSO Act 2012, IT Act 2000, Companies Act 2013, Insolvency Code, Family Law, Transfer of Property Act, and all state-specific statutes.

ABSOLUTE CLASSIFICATION MANDATE — NEVER VIOLATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIMINAL (category MUST be "Criminal") for:
• Murder / culpable homicide / manslaughter / death → IPC 302 / BNS 101 / 104 → Sessions Court
• Attempt to murder → IPC 307 / BNS 109
• Rape / sexual assault → IPC 376 / BNS 63 → Special POCSO/Sessions Court  
• POCSO — child sexual abuse → POCSO Act 2012 → Special POCSO Court
• Kidnapping / abduction → IPC 363-366 / BNS 137-140
• Dacoity → IPC 395 / BNS 310; Robbery → IPC 390 / BNS 303
• Theft → IPC 379 / BNS 303; House-breaking → IPC 454-456
• Extortion / blackmail → IPC 383 / BNS 308
• Domestic violence → DV Act 2005 + IPC 498A / BNS 84 → Magistrate / Protection Officer
• Cheating / fraud (general) → IPC 420 / BNS 318
• Cybercrime / online fraud / UPI fraud / SIM swap → IT Act + IPC 420 → Cyber Cell
• Drug possession / trafficking → NDPS Act 1985 → Sessions Court
• Wrongful confinement / arrest → IPC 340-342; Bail → CrPC 437/439
• Forgery / cheque bounce (criminal angle) → IPC 420 / NI Act 138
• Corruption / bribery → Prevention of Corruption Act → Special CBI/ACB Court
• Hit and run / culpable driving death → IPC 304A / BNS 106
• Rioting / unlawful assembly → IPC 146 / BNS 191
• Stalking / harassment → IPC 354D / BNS 78
• Sedition equivalent offences → BNS 152

LABOUR (category MUST be "Labour") for:
• Unpaid salary / wages → Payment of Wages Act / ID Act → Labour Commissioner
• Wrongful termination / retrenchment → ID Act 1947 → Labour Court
• PF / EPF non-deposit → EPF Act → EPFO Regional Office
• ESIC non-coverage → ESIC Act → ESIC Regional Office
• Gratuity denial → Payment of Gratuity Act → Labour Commissioner
• Sexual harassment at workplace (POSH) → POSH Act 2013 → ICC / Local Complaints Committee
• Overtime / leave denial → Shops & Establishments Act → Labour Inspector
• Contract labour issues → Contract Labour Act → Labour Commissioner

CONSUMER (category MUST be "Consumer") for:
• Defective product / service failure / e-commerce → Consumer Protection Act 2019 → DCDRC
• Insurance claim rejection → Insurance Ombudsman / IRDAI / DCDRC
• Banking / loan fraud / mis-selling → RBI Banking Ombudsman / DCDRC
• Real estate / builder delay → RERA Authority (state specific) — NOT consumer forum for RERA
• Medical negligence → Consumer Forum / State Medical Council → DCDRC
• Educational institution fee issue → Consumer Forum / RERA (if hostel) → DCDRC
• Telecom complaint (TRAI) → DCDRC / TRAI Grievance

CIVIL (category MUST be "Civil") for:
• Rent dispute / deposit → Rent Control Authority / Civil Court
• Eviction → Rent Control Court / Civil Court
• Property / land boundary / title → Civil Court / Revenue Court
• Divorce → Family Court (under Hindu Marriage Act / Special Marriage Act)
• Child custody → Family Court
• Maintenance / alimony → Family Court / Magistrate Court
• Inheritance / succession → Civil Court / Probate Court
• Injunction / specific performance → Civil Court
• Mortgage / loan recovery (civil) → DRT or Civil Court

PUBLIC GRIEVANCE (ONLY for civic/administrative complaints):
• Electricity bill / meter error → DISCOM Consumer Grievance Forum / Electricity Ombudsman
• Water supply / drainage → Municipal Corporation
• Road / pothole / civic → Municipal Corporation / PWD
• Ration card / PDS → District Supply Office
• Aadhaar / PAN issues → UIDAI / Income Tax
• Passport delay → Regional Passport Office / CPV portal
• Government employee grievance → CPGRAMS / DoPT

CORPORATE (ONLY for business law):
• Company incorporation / ROC → MCA Portal / RoC Office
• GST dispute → GST Appellate Authority / AAR
• Income tax → CIT(A) / ITAT
• Trademark / patent / copyright → Trade Mark Registry / Patent Office / Copyright Office
• SEBI / stock market fraud → SEBI SCORES portal
• Insolvency → NCLT / IRP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPECIFIC OFFICE RULES:
• Always use the REAL NAME of the specific local court/office for the user's city
• Police: "[Area] Police Station" — pick the likely area based on user's locality
• Sessions/Criminal: "[City] District & Sessions Court" 
• Consumer: "District Consumer Disputes Redressal Commission, [District]"
• Family: "[City] Family Court"
• Labour: "Office of the Labour Commissioner, [City]" or "EPFO Regional Office, [City]"  
• Municipal: use actual body (BMC, BBMP, NDMC, MCD, AMC, GHMC, CMC, KMC etc.)
• RERA: "[State] Real Estate Regulatory Authority"
• Do NOT use generic "Government Office" or "Local Office" — always be specific
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URGENCY LEVELS:
• "immediate" = active criminal threat, ongoing violence, ongoing kidnapping, person missing < 24h, ongoing fire/accident
• "high" = FIR should be filed within 24-48h, bail application pending, eviction notice received, court date in < 7 days
• "medium" = financial dispute, service failure, consumer complaint, civil matter without deadline
• "low" = documentation, compliance, advisory, no active threat

LIMITATION PERIODS (must be accurate):
• Criminal FIR: No limitation for serious crimes; minor offences under CrPC: 6 months
• Consumer: 2 years from cause of action (Consumer Protection Act 2019 S.69)
• Labour (ID Act reference): 3 years for wage claims
• Civil suit: 3 years general (Limitation Act 1963); property: up to 12 years
• Cheque bounce (NI Act 138): 30 days from expiry of demand notice
• RERA complaint: within project handover period
• POSH complaint: 3 months from incident

Return ONLY a valid JSON object — absolutely no markdown, no text before or after JSON:
{
  "problem_summary": "2-3 plain sentences clearly explaining the legal situation and its implications",
  "category": "Criminal|Consumer|Civil|Labour|Corporate|Public Grievance",
  "subcategory": "Precise subtype e.g. 'Homicide — IPC 302/BNS 101', 'UPI Fraud — IT Act + IPC 420', 'Rent Dispute — Transfer of Property Act'",
  "urgency": "immediate|high|medium|low",
  "urgency_reason": "One concise sentence explaining the urgency level with legal basis",
  "estimated_timeline": "Realistic range e.g. '6 months to 2 years at Sessions Court' or '90–150 days at DCDRC'",
  "recommended_authority": {
    "name": "Full specific name e.g. 'Koramangala Police Station, Bangalore' or 'District Consumer Disputes Redressal Commission, South Delhi'",
    "type": "Type of authority e.g. 'Judicial — Criminal Division' or 'Consumer Forum'",
    "description": "2-3 sentences on jurisdiction, relevance, and what this authority can specifically do for this case"
  },
  "alternate_authorities": [
    {
      "name": "Name of alternate forum/authority",
      "reason": "Why this is also relevant",
      "when_to_use": "Under what circumstances to prefer this over the primary authority"
    }
  ],
  "action_steps": [
    { "step": "Short action title", "detail": "Specific detailed instruction referencing the exact law/section/procedure. Include practical tips." }
  ],
  "documents_required": ["Document with brief note on why it's needed", ...],
  "do_not_do": [
    "Common mistake or thing to avoid — with reason why it's harmful to the case",
    ...
  ],
  "rights_of_the_person": [
    "Specific legal right the person has in this situation with legal basis",
    ...
  ],
  "limitation_period": "e.g. '2 years from date of deficiency under Consumer Protection Act 2019 — file before [estimated date if possible]' or 'No limitation for murder — FIR can be filed at any time'",
  "cost_estimate": {
    "court_fee": "e.g. '₹200 fixed court fee' or '₹100 stamp paper'",
    "lawyer_fee_range": "e.g. '₹5,000 – ₹25,000 for District Consumer Forum' or '₹15,000 – ₹1,00,000+ for Sessions Court'",
    "total_estimate": "e.g. '₹5,000 – ₹30,000 all-in' or 'Free (Legal Aid available via DLSA)'",
    "notes": "Any cost-saving tips e.g. 'DLSA provides free legal aid; file online to save court visits'"
  },
  "helpline_numbers": [
    { "label": "Police Emergency", "number": "100" },
    { "label": "Relevant helpline name", "number": "XXXX" }
  ],
  "success_rate_note": "One sentence on typical outcomes for similar cases e.g. 'Consumer forums rule in favour of complainants in ~68% of product defect cases when supported by purchase invoice and communication trail.'",
  "precedent_note": "One sentence mentioning a relevant Supreme Court or High Court precedent or landmark judgment relevant to this type of case",
  "office_details": {
    "name": "Specific office name",
    "address": "Specific address or well-known location in the city",
    "contact": "Helpline / official number and website URL",
    "working_hours": "e.g. 'Mon–Sat 10:30 AM – 4:30 PM (lunch 1–1:30 PM)'",
    "locality": "Area/locality name in the city e.g. 'City Civil Court Complex, Bangalore' or 'Tis Hazari Courts, Delhi'"
  },
  "online_portal": {
    "available": true,
    "link": "https://actual-url.gov.in",
    "label": "Short descriptive label e.g. 'File on consumerhelpline.gov.in'"
  },
  "ipc_sections": ["IPC/BNS/CrPC/BNSS section with short description e.g. 'IPC 302 — Punishment for murder'", ...],
  "key_facts": [
    "Important legal fact or procedural tip the person must know",
    ...
  ],
  "legal_note": "2-sentence disclaimer about state law variations and the need to consult a qualified lawyer",
  "turn2law_cta": "One compelling specific sentence about how Turn2Law can help with exactly this type of case"
}`;

async function getAIAnalysis(description: string, location: string): Promise<LegalNavigatorResponse | null> {
  const userPrompt = `Legal Problem: "${description}"
User Location: ${location}

CRITICAL INSTRUCTION: 
1. Read the problem carefully. Do NOT default to "Public Grievance" or "Civil" for violent crimes.
2. If there is any mention of death, killing, murder, assault, rape, kidnapping, or criminal violence — the category MUST be "Criminal".
3. Pick the SPECIFIC court/police station for the user's exact location — not a generic office.
4. Fill ALL fields including do_not_do, rights_of_the_person, alternate_authorities, cost_estimate, helpline_numbers, key_facts, precedent_note, success_rate_note, limitation_period.
5. Return ONLY valid JSON. No markdown fences, no explanation text.`;

  const raw = await callOpenRouterAI(MASTER_SYSTEM_PROMPT, userPrompt, 2800);
  if (!raw) return null;

  try {
    // Strip any markdown code fences or leading/trailing text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in response');
    const clean = jsonMatch[0];
    const parsed = JSON.parse(clean);
    return parsed as LegalNavigatorResponse;
  } catch (e) {
    console.error('[Legal Navigator] JSON parse error:', e, '\nRaw:', raw?.substring(0, 600));
    return null;
  }
}

// ──────────────────────────────────────────────
//  Fallback classification (used only when AI fails)
// ──────────────────────────────────────────────
type Category = 'Consumer' | 'Civil' | 'Labour' | 'Corporate' | 'Criminal' | 'Public Grievance';

interface ClassificationResult {
  category: Category;
  subtype: string;
}

function classifyProblem(text: string): ClassificationResult {
  const lower = text.toLowerCase();

  if (/(murder|homicide|manslaughter|kill|killed|death|shot|stabbed|assault|rape|sexual assault|pocso|kidnap|abduction|robbery|dacoity|theft|extortion|blackmail|domestic violence|harassment|abuse|fraud|cheating|cyber|hack|phishing|scam|drug|narcotic|ndps|arrest|bail|fir|police|accused|criminal|ipc|section 302|section 376|bribe|forgery|hit.?and.?run|stalking|molestation)/i.test(lower)) {
    if (/(cyber|online|internet|upi|digital|phishing|hack|scam)/i.test(lower)) return { category: 'Criminal', subtype: 'cyber' };
    if (/(drug|narcotic|ndps)/i.test(lower)) return { category: 'Criminal', subtype: 'ndps' };
    if (/(arrest|bail|fir|custody|remand)/i.test(lower)) return { category: 'Criminal', subtype: 'arrest' };
    if (/(murder|homicide|kill|killed|death|shot|stab)/i.test(lower)) return { category: 'Criminal', subtype: 'murder' };
    if (/(rape|sexual assault|pocso|molestation)/i.test(lower)) return { category: 'Criminal', subtype: 'sexual_offence' };
    return { category: 'Criminal', subtype: 'general' };
  }
  if (/(posh|sexual harassment.*work|workplace.*harassment)/i.test(lower)) return { category: 'Labour', subtype: 'posh' };
  if (/(salary|wage|unpaid|employee|employer|termination|fired|pf|esic|labour|gratuity|overtime|retrenchment)/i.test(lower)) return { category: 'Labour', subtype: 'salary' };
  if (/(company|mca|roc|gst|tax|trademark|patent|corporate|shareholder|sebi|insolvency|nclt)/i.test(lower)) return { category: 'Corporate', subtype: 'company' };
  if (/(electricity|power|light bill|meter|transformer|outage)/i.test(lower)) return { category: 'Public Grievance', subtype: 'electricity' };
  if (/(municipality|water|road|drainage|garbage|civic|ration|aadhaar|passport|pds)/i.test(lower)) return { category: 'Public Grievance', subtype: 'municipal' };
  if (/(rera|builder|flat|apartment|possession.*delay|real estate)/i.test(lower)) return { category: 'Consumer', subtype: 'rera' };
  if (/(product|defective|warranty|refund|consumer|insurance|bank|loan|credit card|medical negligence)/i.test(lower)) return { category: 'Consumer', subtype: 'general' };
  if (/(rent|deposit|landlord|tenant|eviction|divorce|custody|family|property|inheritance|maintenance|alimony)/i.test(lower)) {
    if (/(rent|deposit|landlord|tenant|eviction)/i.test(lower)) return { category: 'Civil', subtype: 'rent' };
    if (/(divorce|custody|family|maintenance|alimony)/i.test(lower)) return { category: 'Civil', subtype: 'family' };
    return { category: 'Civil', subtype: 'property' };
  }
  return { category: 'Civil', subtype: 'general' };
}

function getFallbackResponse(description: string, location: string): LegalNavigatorResponse {
  const city = location.split(/[,\/]/)[0].trim();
  const classification = classifyProblem(description);

  const commonHelplines: { label: string; number: string }[] = [
    { label: 'Police Emergency', number: '100' },
    { label: 'NALSA Legal Aid', number: '15100' },
    { label: 'Women Helpline', number: '181' },
    { label: 'Consumer Helpline', number: '1915' },
  ];

  const fallbacks: Record<string, Partial<LegalNavigatorResponse>> = {
    Criminal: {
      category: 'Criminal',
      subcategory: 'General Criminal Matter',
      urgency: 'high',
      urgency_reason: 'Criminal matters require prompt legal action to preserve evidence and protect rights.',
      estimated_timeline: '6 months to 3 years depending on offence and charge',
      recommended_authority: {
        name: `${city} District & Sessions Court`,
        type: 'Judicial Authority — Criminal Division',
        description: `Sessions Courts have jurisdiction over serious criminal offences under IPC/BNS. For FIR registration, visit the jurisdictional police station in ${city}.`,
      },
      alternate_authorities: [
        { name: `${city} Chief Judicial Magistrate Court`, reason: 'For bailable offences and bail applications', when_to_use: 'When offence is punishable with imprisonment less than 7 years' },
        { name: `${city} High Court`, reason: 'For anticipatory bail (Section 438 CrPC) or challenging FIR', when_to_use: 'When bail is denied by Sessions Court or FIR is frivolous' },
      ],
      action_steps: [
        { step: 'Lodge FIR immediately', detail: `Visit the police station having jurisdiction over the area where the crime occurred in ${city}. Demand acknowledgement receipt. This is your right under Section 154 CrPC / BNSS 173.` },
        { step: 'Engage a criminal advocate', detail: 'Do not give any statement to police without a lawyer present. A criminal advocate can protect your rights from day one.' },
        { step: 'Preserve all evidence', detail: 'Secure photographs, CCTV footage, witness names/contacts, medical reports, call records, and digital messages immediately — evidence degrades fast.' },
        { step: 'Apply for bail if arrested', detail: 'Apply for regular bail before the Magistrate under Section 437 CrPC or Sessions Court under Section 439 CrPC.' },
        { step: 'Seek free legal aid', detail: `Contact the District Legal Services Authority (DLSA), ${city} for free legal representation. Helpline: 15100.` },
      ],
      documents_required: ['Aadhaar / PAN card (ID proof)', 'FIR copy (get signed copy from police)', 'Medical / injury report (if applicable)', 'Evidence: photos, CCTV, screenshots', 'Witness contact details', 'Previous complaint records (if any)'],
      do_not_do: [
        'Do NOT give any statement to police without your lawyer — it can be used against you',
        'Do NOT tamper with or destroy evidence — this is a separate criminal offence',
        'Do NOT contact the accused or their family for settlement in serious offences',
        'Do NOT delay filing FIR — delay weakens credibility and may cause evidence loss',
        'Do NOT sign any blank paper or confession document',
      ],
      rights_of_the_person: [
        'Right to file FIR at any police station in India (Zero FIR) — Section 154 CrPC',
        'Right to free legal aid if unable to afford a lawyer — Article 22(1) Constitution + Legal Services Authorities Act 1987',
        'Right to bail for bailable offences — Section 436 CrPC (mandatory)',
        'Right to know grounds of arrest — Article 22(1) Constitution',
        'Right to medical examination within 24 hours of arrest — Section 54 CrPC',
        'Right not to be held more than 24 hours without Magistrate remand — Article 22(2)',
      ],
      limitation_period: 'No limitation period for serious crimes (murder, rape, POCSO). For minor offences punishable < 3 years: 6 months from commission.',
      cost_estimate: {
        court_fee: 'Nominal — ₹50–₹200 for filing applications',
        lawyer_fee_range: '₹15,000 – ₹1,50,000+ depending on seriousness and stage',
        total_estimate: 'Free via DLSA legal aid OR ₹15,000+ with private advocate',
        notes: 'DLSA provides completely free legal representation for eligible persons. Call 15100.',
      },
      helpline_numbers: commonHelplines,
      success_rate_note: 'Conviction rates in Sessions Courts depend heavily on evidence quality and witness cooperation; professional legal representation significantly improves outcomes.',
      precedent_note: 'The Supreme Court in Lalita Kumari v. Govt. of U.P. (2014) mandated mandatory FIR registration for cognisable offences — police cannot refuse.',
      office_details: {
        name: `${city} District & Sessions Court`,
        address: `District Courts Complex, ${city}`,
        contact: '15100 (NALSA Legal Aid) | ecourts.gov.in',
        working_hours: 'Mon–Sat: 10:30 AM – 4:30 PM (closed 2nd Sat, Sun & holidays)',
        locality: `District Courts Complex, ${city}`,
      },
      online_portal: { available: true, link: 'https://ecourts.gov.in', label: 'eCourts Case Status' },
      ipc_sections: ['Section 154 CrPC / S.173 BNSS (FIR)', 'Section 437/439 CrPC (Bail)', 'Section 482 CrPC (High Court inherent powers)'],
      key_facts: [
        'Police MUST register FIR for all cognisable offences — refusal is punishable under Section 166A IPC',
        'You can file a complaint directly to the Magistrate under Section 156(3) CrPC if police refuse to register FIR',
        'You can file a Zero FIR at any police station, irrespective of jurisdiction',
        'Anticipatory bail (Section 438 CrPC) can be applied before arrest at Sessions Court or High Court',
      ],
    },
    Consumer: {
      category: 'Consumer',
      subcategory: 'Consumer Dispute',
      urgency: 'medium',
      urgency_reason: 'Consumer complaints have a 2-year limitation period — file promptly.',
      estimated_timeline: '3–6 months at District Consumer Forum; 2–3 years if appealed',
      recommended_authority: {
        name: `District Consumer Disputes Redressal Commission (DCDRC), ${city}`,
        type: 'Consumer Forum — District Level',
        description: 'DCDRC handles consumer complaints up to ₹1 Crore under Consumer Protection Act 2019 for defective goods, deficient services, and unfair trade practices.',
      },
      alternate_authorities: [
        { name: `State Consumer Disputes Redressal Commission (SCDRC)`, reason: 'For claims ₹1 Crore – ₹10 Crore', when_to_use: 'When claim value exceeds DCDRC jurisdiction' },
        { name: 'National Consumer Disputes Redressal Commission (NCDRC), New Delhi', reason: 'For claims above ₹10 Crore', when_to_use: 'For very high-value disputes or appeal from SCDRC' },
      ],
      action_steps: [
        { step: 'Send legal notice', detail: 'Send a formal legal notice to the company/seller by registered post with acknowledgement due, giving 15–30 days to resolve.' },
        { step: 'File complaint online', detail: 'File on https://consumerhelpline.gov.in (National Consumer Helpline) or visit DCDRC office at the District Collectorate.' },
        { step: 'Attach all evidence', detail: 'Include purchase invoice, warranty card, product photos, screenshots of all communications, and the legal notice with tracking receipt.' },
        { step: 'Claim compensation', detail: 'You can claim refund + compensation for mental agony + litigation costs under Section 39 Consumer Protection Act 2019.' },
        { step: 'Attend hearings', detail: 'Consumer forums are required to dispose of complaints within 150 days (extended from 90 days by 2019 Act). Attend all scheduled dates.' },
      ],
      documents_required: ['Purchase invoice / receipt (mandatory)', 'Warranty / guarantee card', 'Screenshots of all communications', 'Bank / payment proof', 'Legal notice copy with speed post tracking', 'Product photos (if defective product)', 'Medical records (if medical negligence)'],
      do_not_do: [
        'Do NOT delay beyond 2 years from cause of action — the complaint becomes time-barred',
        'Do NOT throw away the defective product — it is primary evidence',
        'Do NOT accept a partial settlement under pressure without written confirmation',
        'Do NOT file in wrong jurisdiction — claim value determines which forum',
        'Do NOT forget to send a formal legal notice first — it strengthens your case',
      ],
      rights_of_the_person: [
        'Right to file complaint without a lawyer — you can argue your own case (Consumer Protection Act S.35)',
        'Right to compensation for mental agony and litigation costs beyond just the product value',
        'Right to replacement, refund, or repair for defective goods (S.39 Consumer Protection Act 2019)',
        'Right to appeal to SCDRC within 45 days of DCDRC order',
        'Right to interim relief / injunction during pendency of complaint',
      ],
      limitation_period: '2 years from the date of cause of action (Consumer Protection Act 2019, Section 69). After 2 years, the complaint is barred unless sufficient cause for delay is shown.',
      cost_estimate: {
        court_fee: '₹100 – ₹2,000 based on claim amount (fixed slab)',
        lawyer_fee_range: '₹3,000 – ₹20,000 (not required — you can self-represent)',
        total_estimate: '₹100 – ₹5,000 (can be much less if self-represented)',
        notes: 'Consumer forums allow self-representation. National Consumer Helpline (1915) provides free guidance.',
      },
      helpline_numbers: [
        { label: 'National Consumer Helpline', number: '1915' },
        { label: 'IRDAI Insurance Helpline', number: '155255' },
        { label: 'RBI Banking Ombudsman', number: '14448' },
        { label: 'TRAI Telecom Helpline', number: '1800-11-0420' },
      ],
      success_rate_note: 'Consumer forums rule in favour of complainants in approximately 65–70% of cases where complainants have a purchase invoice and documented communication trail.',
      precedent_note: 'The Supreme Court in Lucknow Development Authority v. M.K. Gupta (1994) held that public authorities providing services also fall under Consumer Protection, establishing broad scope.',
      office_details: {
        name: `District Consumer Disputes Redressal Commission, ${city}`,
        address: `District Collectorate Complex, ${city}`,
        contact: '1915 (National Consumer Helpline) | consumerhelpline.gov.in',
        working_hours: 'Mon–Fri: 10:00 AM – 5:00 PM (closed 2nd Sat, Sun & public holidays)',
        locality: `District Collectorate / Mini Secretariat area, ${city}`,
      },
      online_portal: { available: true, link: 'https://consumerhelpline.gov.in', label: 'File on National Consumer Helpline' },
      ipc_sections: ['Consumer Protection Act 2019, S.35 (Filing complaint)', 'S.39 (Relief)', 'S.69 (Limitation period)', 'S.72 (Penalty for non-compliance)'],
      key_facts: [
        'No advocate required — consumers can argue their own case at DCDRC',
        'File first on NCH (1915) — online mediation resolves ~40% of complaints within days',
        'If the company ignores DCDRC order, the president can issue a warrant for imprisonment under S.72',
        'E-commerce platforms are also liable as "service providers" under the 2019 Act',
      ],
    },
  };

  const base = fallbacks[classification.category] ?? fallbacks['Consumer'];
  const city2 = city;
  return {
    problem_summary: `You have described a ${classification.category} matter in ${city2}. Based on the available information, the most appropriate authority and course of action have been identified below.`,
    legal_note: 'This guidance is based on general Indian legal knowledge and is for informational purposes only. Laws vary by state and facts of individual cases may differ significantly. Please consult a qualified legal professional before taking any action.',
    turn2law_cta: `Turn2Law connects you with verified specialist advocates in ${city2} who handle ${classification.category.toLowerCase()} cases — get a free 15-minute call to understand your options.`,
    maps_embed_query: `${base.recommended_authority?.name ?? `${classification.category} court`} ${city2}`,
    map_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${base.recommended_authority?.name ?? `${classification.category} court`} ${city2}`)}`,
    alternate_authorities: [],
    do_not_do: [],
    rights_of_the_person: [],
    limitation_period: 'Varies — consult a lawyer for the specific limitation period applicable to your case.',
    cost_estimate: { court_fee: 'Varies', lawyer_fee_range: 'Varies', total_estimate: 'Varies', notes: 'Free legal aid available via DLSA (15100)' },
    helpline_numbers: commonHelplines,
    success_rate_note: 'Success depends on evidence quality and legal representation.',
    precedent_note: 'Multiple Supreme Court precedents support access to justice — consult a lawyer for case-specific precedents.',
    key_facts: [],
    ...base,
  } as LegalNavigatorResponse;
}

// ──────────────────────────────────────────────
//  Build Google Maps links
// ──────────────────────────────────────────────
function buildMapLinks(officeName: string, location: string): { map_link: string; maps_embed_query: string } {
  const query = `${officeName} ${location}`;
  return {
    map_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    maps_embed_query: query,
  };
}

// ──────────────────────────────────────────────
//  POST /api/legal-navigator
// ──────────────────────────────────────────────
router.post('/legal-navigator', async (req: Request, res: Response): Promise<any> => {
  try {
    const { problem_description, location, user_id, user_email }: LegalNavigatorRequest & { user_id?: string; user_email?: string } = req.body;

    if (!problem_description?.trim()) return res.status(400).json({ success: false, error: 'problem_description is required.' });
    if (!location?.trim())            return res.status(400).json({ success: false, error: 'location is required.' });
    if (problem_description.trim().length < 10) return res.status(400).json({ success: false, error: 'Please describe your problem in more detail.' });

    const desc = problem_description.trim();
    const loc  = location.trim();
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;

    console.log('[Legal Navigator] Processing:', { location: loc, len: desc.length });

    // ── AI Analysis (primary) ────────────────
    let response = await getAIAnalysis(desc, loc);

    // ── Fallback if AI fails ─────────────────
    if (!response) {
      console.warn('[Legal Navigator] AI failed — using enriched fallback');
      response = getFallbackResponse(desc, loc);
    }

    // ── Ensure map links are correct ─────────
    const mapLinks = buildMapLinks(
      response.office_details?.name || response.recommended_authority?.name || '',
      loc
    );
    response.map_link         = mapLinks.map_link;
    response.maps_embed_query = mapLinks.maps_embed_query;

    // ── Normalise array fields ──────────────
    if (!Array.isArray(response.ipc_sections))         response.ipc_sections = [];
    if (!Array.isArray(response.alternate_authorities)) response.alternate_authorities = [];
    if (!Array.isArray(response.do_not_do))            response.do_not_do = [];
    if (!Array.isArray(response.rights_of_the_person)) response.rights_of_the_person = [];
    if (!Array.isArray(response.helpline_numbers))     response.helpline_numbers = [];
    if (!Array.isArray(response.key_facts))            response.key_facts = [];
    if (!response.online_portal?.label)                response.online_portal = { ...response.online_portal, label: 'Official Portal' };
    if (!response.cost_estimate)                       response.cost_estimate = { court_fee: 'Varies', lawyer_fee_range: 'Varies', total_estimate: 'Varies', notes: '' };
    if (!response.limitation_period)                   response.limitation_period = 'Consult a lawyer for the applicable limitation period.';

    // ── Always include core helplines if missing ─
    const hasPolice = response.helpline_numbers.some(h => h.number === '100');
    if (!hasPolice) response.helpline_numbers.unshift({ label: 'Police Emergency', number: '100' });
    const hasNalsa = response.helpline_numbers.some(h => h.number === '15100');
    if (!hasNalsa) response.helpline_numbers.push({ label: 'NALSA Legal Aid', number: '15100' });

    console.log('[Legal Navigator] Response ready:', { category: response.category, authority: response.recommended_authority?.name });

    // ── Save to Supabase (non-blocking) ──────
    supabaseAdmin
      .from('legal_navigator_queries')
      .insert([{
        problem_description: desc,
        location: loc,
        category: response.category,
        recommended_authority: response.recommended_authority?.name,
        result: response,
        user_id:    user_id    || null,
        user_email: user_email || null,
        ip_address: clientIp,
      }])
      .then(({ error: dbErr }) => {
        if (dbErr) console.error('[Legal Navigator] Supabase save error:', dbErr.message);
      });

    return res.status(200).json({ success: true, data: response });

  } catch (error: any) {
    console.error('[Legal Navigator] Unhandled error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process your request. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
