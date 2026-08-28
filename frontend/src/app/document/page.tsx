import { redirect } from "next/navigation";

/**
 * /document (singular) → /documents (canonical route)
 */
export default function DocumentPageRedirect() {
  redirect("/documents");
}
