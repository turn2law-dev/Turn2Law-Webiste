import { z } from "zod";

export enum DocumentType {
	MOM = "MOM",
	NDA = "NDA",
	MOU = "MOU",
	IP_ASSIGNMENT = "IP_ASSIGNMENT",
	OFFER_LETTER = "OFFER_LETTER",
}

// Slug helpers for routing
export function documentTypeToSlug(type: DocumentType): string {
	switch (type) {
		case DocumentType.MOM:
			return "mom";
		case DocumentType.NDA:
			return "nda";
		case DocumentType.MOU:
			return "mou";
		case DocumentType.IP_ASSIGNMENT:
			return "ip-assignment";
		case DocumentType.OFFER_LETTER:
			return "offer-letter";
		default:
			return "";
	}
}

export function slugToDocumentType(slug: string): DocumentType | null {
	const s = slug.toLowerCase();
	if (s === "mom") return DocumentType.MOM;
	if (s === "nda") return DocumentType.NDA;
	if (s === "mou") return DocumentType.MOU;
	if (s === "ip-assignment") return DocumentType.IP_ASSIGNMENT;
	if (s === "offer-letter") return DocumentType.OFFER_LETTER;
	return null;
}

export const MomSchema = z.object({
	meetingTitle: z.string().min(3),
	meetingDate: z.string().min(1),
	meetingTime: z.string().min(1),
	location: z.string().min(1),
	attendees: z.array(z.string().min(1)).min(1),
	agendaPoints: z.array(z.string().min(1)).min(1),
	actionItems: z
		.array(z.object({ task: z.string().min(1), owner: z.string().min(1), dueDate: z.string().min(1) }))
		.min(0),
	notes: z.string().optional().default(""),
	preparedBy: z.string().min(1),
});
export type MomInput = z.infer<typeof MomSchema>;

export const NdaSchema = z.object({
	disclosingParty: z.string().min(1),
	receivingParty: z.string().min(1),
	effectiveDate: z.string().min(1),
	termMonths: z.number().int().positive(),
	governingLaw: z.string().min(1),
	purpose: z.string().min(3),
});
export type NdaInput = z.infer<typeof NdaSchema>;

export const MouSchema = z.object({
	partyA: z.string().min(1),
	partyB: z.string().min(1),
	effectiveDate: z.string().min(1),
	scope: z.string().min(3),
	responsibilitiesA: z.string().min(1),
	responsibilitiesB: z.string().min(1),
	termMonths: z.number().int().positive(),
	governingLaw: z.string().min(1),
});
export type MouInput = z.infer<typeof MouSchema>;

export const IpAssignmentSchema = z.object({
	assignor: z.string().min(1),
	assignee: z.string().min(1),
	effectiveDate: z.string().min(1),
	ipDescription: z.string().min(3),
	consideration: z.string().min(1),
	governingLaw: z.string().min(1),
});
export type IpAssignmentInput = z.infer<typeof IpAssignmentSchema>;

export const OfferLetterSchema = z.object({
	candidateName: z.string().min(1),
	position: z.string().min(1),
	joiningDate: z.string().min(1),
	CTC: z.string().min(1),
	location: z.string().min(1),
	reportingManager: z.string().min(1),
	companyName: z.string().min(1),
});
export type OfferLetterInput = z.infer<typeof OfferLetterSchema>;

export type DocumentInputByType =
	| { type: DocumentType.MOM; data: MomInput }
	| { type: DocumentType.NDA; data: NdaInput }
	| { type: DocumentType.MOU; data: MouInput }
	| { type: DocumentType.IP_ASSIGNMENT; data: IpAssignmentInput }
	| { type: DocumentType.OFFER_LETTER; data: OfferLetterInput };

export function renderDocumentDraft(input: DocumentInputByType): string {
	switch (input.type) {
		case DocumentType.MOM: {
			const d = input.data;
			const attendees = d.attendees.map((a, i) => `${i + 1}. ${a}`).join("\n");
			const agenda = d.agendaPoints.map((p, i) => `${i + 1}. ${p}`).join("\n");
			const actions =
				d.actionItems.length > 0
					? d.actionItems.map((a, i) => `${i + 1}. ${a.task} — Owner: ${a.owner}, Due: ${a.dueDate}`).join("\n")
					: "None";
			return [
				"MINUTES OF MEETING",
				`Title: ${d.meetingTitle}`,
				`Date: ${d.meetingDate}  Time: ${d.meetingTime}`,
				`Location: ${d.location}`,
				"",
				"Attendees:",
				attendees,
				"",
				"Agenda:",
				agenda,
				"",
				"Notes:",
				d.notes || "N/A",
				"",
				"Action Items:",
				actions,
				"",
				`Prepared by: ${d.preparedBy}`,
			].join("\n");
		}
		case DocumentType.NDA: {
			const d = input.data;
			return [
				"NON-DISCLOSURE AGREEMENT (NDA)",
				`This NDA is made effective as of ${d.effectiveDate} between ${d.disclosingParty} ("Disclosing Party") and ${d.receivingParty} ("Receiving Party").`,
				`Purpose: ${d.purpose}.`,
				"",
				`1. Confidential Information shall mean all non-public information disclosed by the Disclosing Party.`,
				`2. Obligations: The Receiving Party shall keep the Confidential Information strictly confidential and use it solely for the Purpose.`,
				`3. Term: This NDA shall remain in effect for ${d.termMonths} months from the Effective Date.`,
				`4. Governing Law: ${d.governingLaw}.`,
				"",
				"Agreed and accepted by the parties.",
			].join("\n");
		}
		case DocumentType.MOU: {
			const d = input.data;
			return [
				"MEMORANDUM OF UNDERSTANDING (MOU)",
				`This MOU is entered into on ${d.effectiveDate} by and between ${d.partyA} and ${d.partyB}.`,
				`Scope: ${d.scope}.`,
				`Responsibilities of ${d.partyA}: ${d.responsibilitiesA}.`,
				`Responsibilities of ${d.partyB}: ${d.responsibilitiesB}.`,
				`Term: ${d.termMonths} months.`,
				`Governing Law: ${d.governingLaw}.`,
			].join("\n");
		}
		case DocumentType.IP_ASSIGNMENT: {
			const d = input.data;
			return [
				"INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT",
				`This Agreement is made effective ${d.effectiveDate} between ${d.assignor} ("Assignor") and ${d.assignee} ("Assignee").`,
				`Assigned IP: ${d.ipDescription}.`,
				`Consideration: ${d.consideration}.`,
				`Governing Law: ${d.governingLaw}.`,
				"Assignor hereby assigns to Assignee all right, title, and interest in and to the Assigned IP.",
			].join("\n");
		}
		case DocumentType.OFFER_LETTER: {
			const d = input.data;
			return [
				"EMPLOYMENT OFFER LETTER",
				`Dear ${d.candidateName},`,
				`We are pleased to offer you the position of ${d.position} at ${d.companyName}.`,
				`Start Date: ${d.joiningDate}`,
				`Compensation (CTC): ${d.CTC}`,
				`Location: ${d.location}`,
				`Reporting Manager: ${d.reportingManager}`,
				"",
				"Please sign and return to indicate your acceptance.",
				"Sincerely,",
				d.companyName,
			].join("\n");
		}
		default:
			return "";
	}
}

export const DocumentSchemas = {
	[DocumentType.MOM]: MomSchema,
	[DocumentType.NDA]: NdaSchema,
	[DocumentType.MOU]: MouSchema,
	[DocumentType.IP_ASSIGNMENT]: IpAssignmentSchema,
	[DocumentType.OFFER_LETTER]: OfferLetterSchema,
};

export type DocumentSchemaByType<T extends DocumentType> = T extends DocumentType.MOM
	? typeof MomSchema
	: T extends DocumentType.NDA
	? typeof NdaSchema
	: T extends DocumentType.MOU
	? typeof MouSchema
	: T extends DocumentType.IP_ASSIGNMENT
	? typeof IpAssignmentSchema
	: typeof OfferLetterSchema;


