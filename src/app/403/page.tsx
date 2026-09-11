import type { Metadata } from "next";
import { ErrorExperience } from "@/components/feedback/ErrorExperience";

export const metadata: Metadata = {
  title: "403 — Access Restricted",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return <ErrorExperience code="403" />;
}
