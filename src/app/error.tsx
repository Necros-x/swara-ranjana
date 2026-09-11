"use client";

import { useEffect } from "react";
import { ErrorExperience } from "@/components/feedback/ErrorExperience";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Swara Ranjana route error:", error);
  }, [error]);

  return <ErrorExperience code="500" onRetry={reset} />;
}
