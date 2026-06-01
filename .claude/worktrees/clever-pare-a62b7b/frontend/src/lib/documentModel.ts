import { DocumentType, renderDocumentDraft, type DocumentInputByType } from "@/lib/documents";

export type ModelGenerateParams = {
	type: DocumentType;
	data: Record<string, unknown>;
	signal?: AbortSignal;
};

export type ModelGenerateResult = {
	ok: true;
	draft: string;
} | {
	ok: false;
	error: string;
};


export async function generateDraftViaModel(params: ModelGenerateParams): Promise<ModelGenerateResult> {
	const useMock = process.env.USE_MOCK_MODEL === "true" || !process.env.DOC_MODEL_URL;
	if (useMock) {
		try {
			const draft = renderDocumentDraft(params as DocumentInputByType);
			return { ok: true, draft };
		} catch {
			return { ok: false, error: "Failed to render draft with mock generator" };
		}
	}

	try {
		const controller = params.signal ? undefined : new AbortController();
		const signal = params.signal ?? controller?.signal;
		const resp = await fetch(String(process.env.DOC_MODEL_URL), {
			method: "POST",
			headers: { "Content-Type": "application/json", "Authorization": process.env.DOC_MODEL_AUTH ?? "" },
			body: JSON.stringify({ type: params.type, data: params.data }),
			signal,
		});
		if (!resp.ok) {
			return { ok: false, error: `Model request failed (${resp.status})` };
		}
		const json = await resp.json() as { draft?: string; error?: string };
		if (json.draft && typeof json.draft === "string") {
			return { ok: true, draft: json.draft };
		}
		return { ok: false, error: json.error ?? "Model returned no draft" };
	} catch {
		return { ok: false, error: "Model request errored" };
	}
}


