"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy shim — anything that previously rendered <DocEngineStandaloneApp />
 * now redirects seamlessly to the new /documents page.
 */
export default function DocEngineStandaloneApp() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/documents");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
