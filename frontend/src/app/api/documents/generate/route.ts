import { NextRequest } from "next/server";
import { z } from "zod";
import { DocumentSchemas, DocumentType, type DocumentInputByType } from "@/lib/documents";
import { generatePdfDocument } from "@/lib/document-generation";

const RequestSchema = z.object({
	type: z.nativeEnum(DocumentType),
	data: z.record(z.any()),
});

export type GenerateDocumentRequest = z.infer<typeof RequestSchema>;
export type GenerateDocumentResponse =
	| { ok: true; type: DocumentType; docId: string; pdfUrl: string; docType: string }
	| { ok: true; type: DocumentType.MOM; draft: string }
	| { ok: false; error: string };

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const json = await req.json();
		const parsed = RequestSchema.safeParse(json);
		if (!parsed.success) {
			return Response.json({ ok: false, error: "Invalid request body" } satisfies GenerateDocumentResponse, {
				status: 400,
			});
		}
		const { type, data } = parsed.data;
		const schema = DocumentSchemas[type as keyof typeof DocumentSchemas];
		const validated = schema.safeParse(data);
		if (!validated.success) {
			return Response.json(
				{ ok: false, error: "Validation failed for payload" } satisfies GenerateDocumentResponse,
				{ status: 422 },
			);
		}
		// The external engine does not currently ship a Minutes of Meeting template.
		// Keep the existing text generator for MOM so this existing website feature
		// continues to work while the PDF engine handles the supported legal forms.
		if (type === DocumentType.MOM) {
			const { generateDraftViaModel } = await import("@/lib/documentModel");
			const result = await generateDraftViaModel({ type, data: validated.data } as DocumentInputByType);
			if (!result.ok) {
				return Response.json({ ok: false, error: result.error } satisfies GenerateDocumentResponse, { status: 502 });
			}
			return Response.json({ ok: true, type, draft: result.draft } satisfies GenerateDocumentResponse, { status: 200 });
		}
		const result = await generatePdfDocument({ type, data: validated.data } as DocumentInputByType);
		return Response.json({
			ok: true,
			type,
			docId: result.doc_id,
			pdfUrl: result.pdf_url,
			docType: result.doc_type,
		} satisfies GenerateDocumentResponse, { status: 200 });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal server error";
		const unavailable = /fetch failed|ECONNREFUSED|document engine/i.test(message);
		return Response.json({ ok: false, error: message } satisfies GenerateDocumentResponse, { status: unavailable ? 503 : 500 });
	}
}
