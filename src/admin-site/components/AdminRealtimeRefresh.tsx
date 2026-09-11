"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminRealtimeRefreshProps {
  tables: string[];
  children: ReactNode;
}

export function AdminRealtimeRefresh({
  tables,
  children,
}: AdminRealtimeRefreshProps) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableKey = [...tables].sort().join(",");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(
      `admin-live:${pathname}:${tableKey}:${crypto.randomUUID()}`,
    );

    const scheduleRefresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.refresh();
      }, 180);
    };

    for (const table of tableKey.split(",").filter(Boolean)) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        scheduleRefresh,
      );
    }

    channel.subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      void supabase.removeChannel(channel);
    };
  }, [pathname, router, tableKey]);

  return children;
}
