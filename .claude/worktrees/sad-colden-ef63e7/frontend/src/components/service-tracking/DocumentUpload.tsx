"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Send, Eye, RefreshCw } from "lucide-react";
import { getRequiredDocuments } from "@/lib/service-constants";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DocumentUploadProps {
    serviceRequestId: string;
    serviceNumber: string;
    serviceType: string;
    existingDocuments: Array<{ name: string; url: string; path?: string; uploadedAt: string }>;
    onUploadComplete: () => void;
}

// Staged file type
interface StagedFile {
    docType: string;
    file: File;
}

export function DocumentUpload({ serviceRequestId, serviceNumber, serviceType, existingDocuments = [], onUploadComplete }: DocumentUploadProps) {
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [targetDocType, setTargetDocType] = useState<string | null>(null);

    const requiredDocs = getRequiredDocuments(serviceType);

    // Check if a document is already uploaded (on server)
    const isUploaded = (docType: string) => {
        return existingDocuments.some(doc => doc.name.startsWith(docType));
    };

    const getUploadedFile = (docType: string) => {
        return existingDocuments.find(doc => doc.name.startsWith(docType));
    };

    // Check if a document is staged (selected but not submitted)
    const isStaged = (docType: string) => {
        return stagedFiles.some(sf => sf.docType === docType);
    };

    const getStagedFile = (docType: string) => {
        return stagedFiles.find(sf => sf.docType === docType);
    };

    // Handle file selection (staging)
    const handleFileSelect = (docType: string) => {
        setTargetDocType(docType);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && targetDocType) {
            const file = e.target.files[0];

            // Validate file size
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }

            setError(null);

            // Add or replace in staged files
            setStagedFiles(prev => {
                const filtered = prev.filter(sf => sf.docType !== targetDocType);
                return [...filtered, { docType: targetDocType, file }];
            });
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTargetDocType(null);
    };

    // Remove a staged file
    const removeStagedFile = (docType: string) => {
        setStagedFiles(prev => prev.filter(sf => sf.docType !== docType));
    };

    // Upload a single file to Supabase
    const uploadSingleFile = async (stagedFile: StagedFile): Promise<boolean> => {
        const { docType, file } = stagedFile;

        try {
            const fileExt = file.name.split(".").pop();
            const safeDocType = docType.replace(/[^a-zA-Z0-9]/g, '-');
            const fileName = `${serviceNumber}-${safeDocType}-${Date.now()}.${fileExt}`;
            const filePath = `${serviceRequestId}/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("documents")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL (fallback)
            const { data: { publicUrl } } = supabase.storage
                .from("documents")
                .getPublicUrl(filePath);

            // Save document reference to backend
            const displayName = `${docType} - ${file.name}`;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            const response = await fetch(`${apiUrl}/api/service-requests/${serviceRequestId}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: displayName,
                    url: publicUrl,
                    path: filePath,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save document reference");
            }

            return true;
        } catch (err: any) {
            console.error(`Upload error for ${docType}:`, err);
            return false;
        }
    };

    // Submit all staged files
    const handleSubmitAll = async () => {
        if (stagedFiles.length === 0) return;

        setUploading(true);
        setError(null);
        setUploadProgress({ current: 0, total: stagedFiles.length });

        let successCount = 0;
        for (let i = 0; i < stagedFiles.length; i++) {
            const success = await uploadSingleFile(stagedFiles[i]);
            if (success) successCount++;
            setUploadProgress({ current: i + 1, total: stagedFiles.length });
        }

        setUploading(false);
        setUploadProgress(null);

        if (successCount === stagedFiles.length) {
            setStagedFiles([]);
            onUploadComplete();
        } else {
            setError(`Some documents failed to upload. ${successCount}/${stagedFiles.length} succeeded.`);
            // Remove successfully uploaded files from staged
            const failedDocs = stagedFiles.slice(successCount);
            setStagedFiles(failedDocs);
            onUploadComplete(); // Refresh to show what did upload
        }
    };

    // View document (Signed URL)
    const handleView = async (doc: any) => {
        try {
            if (doc.path) {
                const { data, error } = await supabase.storage
                    .from("documents")
                    .createSignedUrl(doc.path, 60);

                if (error) throw error;
                window.open(data.signedUrl, '_blank');
            } else {
                window.open(doc.url, '_blank');
            }
        } catch (err) {
            console.error("Error generating signed URL:", err);
            alert("Could not open document. Please try again.");
        }
    };

    const hasStagedFiles = stagedFiles.length > 0;

    return (
        <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Required Documents Checklist
            </h4>

            <div className="grid gap-3">
                {requiredDocs.map((docType, idx) => {
                    const uploaded = isUploaded(docType);
                    const fileData = getUploadedFile(docType);
                    const staged = isStaged(docType);
                    const stagedData = getStagedFile(docType);

                    // Debug Log (Remove in prod)
                    // console.log(`[DocUpload] ${docType}: Uploaded=${uploaded}, Staged=${staged}`, { fileData, existingDocuments });

                    return (
                        <div
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${uploaded
                                ? 'bg-green-50/50 border-green-200'
                                : staged
                                    ? 'bg-blue-50/50 border-blue-200'
                                    : 'bg-card border-border hover:border-primary/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {uploaded ? (
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                ) : staged ? (
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                        <span className="text-xs font-bold">{idx + 1}</span>
                                    </div>
                                )}
                                <div>
                                    <p className={`font-medium ${uploaded
                                        ? 'text-green-900'
                                        : staged
                                            ? 'text-blue-900'
                                            : 'text-foreground'
                                        }`}>
                                        {docType}
                                    </p>
                                    {uploaded && fileData && (
                                        <p className="text-xs text-green-700/80 truncate max-w-[200px]">
                                            {fileData.name.split(' - ').pop()}
                                        </p>
                                    )}
                                    {staged && stagedData && (
                                        <p className="text-xs text-blue-700/80 truncate max-w-[200px]">
                                            📎 {stagedData.file.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {uploaded ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleView(fileData)}
                                            className="gap-2 h-8"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleFileSelect(docType)}
                                            className="gap-2 h-8"
                                            disabled={uploading}
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Update
                                        </Button>
                                    </div>
                                ) : staged ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeStagedFile(docType)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={uploading}
                                            onClick={() => handleFileSelect(docType)}
                                            className="gap-2"
                                        >
                                            Change
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={uploading}
                                        onClick={() => handleFileSelect(docType)}
                                        className="gap-2"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        Upload
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
            />

            {/* Submit All Button */}
            {hasStagedFiles && (
                <div className="pt-4 border-t border-border">
                    <Button
                        onClick={handleSubmitAll}
                        disabled={uploading}
                        className="w-full gap-2"
                        size="lg"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading {uploadProgress?.current}/{uploadProgress?.total}...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Submit All Documents ({stagedFiles.length})
                            </>
                        )}
                    </Button>
                </div>
            )}

            {error && (
                <div className="text-sm text-red-500 flex items-center gap-2 bg-red-500/10 p-3 rounded-lg animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground mt-4">
                <p className="font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Upload Instructions
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Select files for each document type</li>
                    <li>Click &quot;Submit All Documents&quot; when ready</li>
                    <li>File size limit: 5MB per document</li>
                    <li>Supported formats: PDF, JPG, PNG, DOCX</li>
                </ul>
            </div>
        </div>
    );
}
