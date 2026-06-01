import { NextRequest } from "next/server";
import { z } from "zod";
import {
	DocumentType,
	DocumentSchemas,
	renderDocumentDraft,
	type DocumentInputByType,
} from "@/lib/documents";
import { generateDraftViaModel } from "@/lib/documentModel";

const RequestSchema = z.object({
	type: z.nativeEnum(DocumentType),
	data: z.record(z.any()),
});

export type GenerateDocumentRequest = z.infer<typeof RequestSchema>;
export type GenerateDocumentResponse =
	| { ok: true; type: DocumentType; draft: string }
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
		// Single integration point: switch between mock/template and external model.
		const result = await generateDraftViaModel({ type, data: validated.data });
		if (result.ok) {
			return Response.json({ ok: true, type, draft: result.draft } satisfies GenerateDocumentResponse, { status: 200 });
		}
		return Response.json(
			{ ok: false, error: result.error } satisfies GenerateDocumentResponse,
			{ status: 502 },
		);
	} catch (err) {
		return Response.json({ ok: false, error: "Internal server error" } satisfies GenerateDocumentResponse, {
			status: 500,
		});
	}
}


