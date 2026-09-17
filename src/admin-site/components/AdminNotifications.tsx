"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markAdminNotificationsRead } from "@/app/admin/actions/notifications";

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  tone: "info" | "warning" | "urgent";
  read: boolean;
}

function toneClass(tone: AdminNotificationItem["tone"]) {
  if (tone === "urgent") return "bg-red-500";
  if (tone === "warning") return "bg-amber-500";
  return "bg-[#2271B1]";
}

function relativeTime(value: string) {
  const then = new Date(value).getTime();
  const diff = then - Date.now();
  const absolute = Math.abs(diff);
  const minutes = Math.max(1, Math.round(absolute / 60000));

  if (diff > 0) return `in ${minutes} min`;
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function AdminNotifications({
  items,
  userId,
}: {
  items: AdminNotificationItem[];
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const unreadItems = useMemo(() => items.filter((item) => !item.read), [items]);
  const unreadCount = unreadItems.length;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase
      .channel(`sr-admin-notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_submissions" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_order_requests" },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        refresh,
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [router, userId]);

  const openNotification = (item: AdminNotificationItem) => {
    if (pending) return;

    startTransition(async () => {
      if (!item.read) {
        await markAdminNotificationsRead([item.id]);
      }
      setOpen(false);
      router.push(item.href);
      router.refresh();
    });
  };

  const markAllRead = () => {
    if (pending || unreadItems.length === 0) return;

    startTransition(async () => {
      await markAdminNotificationsRead(unreadItems.map((item) => item.id));
      router.refresh();
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative cursor-pointer rounded-lg p-2 text-[#7D8A95] transition hover:bg-[#F8FAFC] hover:text-[#0E1721]"
        aria-label={
          unreadCount > 0
            ? `Admin notifications, ${unreadCount} unread`
            : "Admin notifications"
        }
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#C2CBD2]/60 bg-white shadow-[0_18px_50px_rgba(14,23,33,0.14)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#C2CBD2]/35 px-4 py-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#31465A]">
                Notifications
              </div>
              <div className="mt-0.5 text-[10px] text-[#7D8A95]">
                {unreadCount > 0
                  ? `${unreadCount} unread • ${items.length} active`
                  : `${items.length} active • all read`}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={pending}
                className="cursor-pointer text-[9px] font-bold uppercase tracking-[0.12em] text-[#2271B1] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs leading-relaxed text-[#7D8A95]">
                No active payment, request or reservation alerts.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openNotification(item)}
                  disabled={pending}
                  className={`flex w-full cursor-pointer gap-3 border-b border-[#C2CBD2]/25 px-4 py-4 text-left transition last:border-0 hover:bg-[#F8FAFB] disabled:cursor-wait ${
                    item.read ? "bg-white opacity-70" : "bg-[#FDFEFF]"
                  }`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneClass(item.tone)} ${item.read ? "opacity-35" : ""}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block text-xs font-semibold text-[#0E1721]">
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2271B1]" aria-label="Unread" />
                      )}
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-[#5F6D79]">
                      {item.message}
                    </span>
                    <span className="mt-2 block text-[9px] uppercase tracking-[0.12em] text-[#9AA6AF]">
                      {relativeTime(item.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
