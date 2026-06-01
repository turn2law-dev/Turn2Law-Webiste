import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DocumentType } from "@/lib/documents";

export interface DocumentState {
	selectedType: DocumentType | null;
	formData: Record<string, unknown>;
	draft: string;
	isGenerating: boolean;
	setType: (type: DocumentType | null) => void;
	updateField: (key: string, value: unknown) => void;
	resetForm: () => void;
	setDraft: (text: string) => void;
	setGenerating: (v: boolean) => void;
}

export const useDocumentsStore = create<DocumentState>()(
	persist(
		(set, get) => ({
			selectedType: null,
			formData: {},
			draft: "",
			isGenerating: false,
			setType: (type) => {
				// When switching types, reset form and draft but keep selection.
				set(() => ({
					selectedType: type,
					formData: {},
					draft: "",
				}));
			},
			updateField: (key, value) =>
				set((s) => ({
					formData: { ...s.formData, [key]: value },
				})),
			resetForm: () => set(() => ({ formData: {}, draft: "" })),
			setDraft: (text) => set(() => ({ draft: text })),
			setGenerating: (v) => set(() => ({ isGenerating: v })),
		}),
		{
			name: "documents-store",
			partialize: (state) => ({
				selectedType: state.selectedType,
				formData: state.formData,
				draft: state.draft,
			}),
			version: 1,
		},
	),
);


