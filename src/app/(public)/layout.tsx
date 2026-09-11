import type { ReactNode } from "react";
import { PublicAmbienceShell } from "@/public-site/components/common/PublicAmbienceShell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicAmbienceShell>{children}</PublicAmbienceShell>;
}
