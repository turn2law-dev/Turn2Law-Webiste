"use client";

/**
 * /documents/[type] — redirects to /documents with the type pre-selected.
 * The wizard lives on /documents; deep links still work via the ?type= query.
 */

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DocumentTypePage() {
  const params = useParams<{ type?: string }>();
  const router = useRouter();

  useEffect(() => {
    const slug = params?.type ?? "";
    router.replace(`/documents?type=${encodeURIComponent(slug)}`);
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
