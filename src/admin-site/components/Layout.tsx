"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  ShoppingCart,
  Users,
  Scan,
  History,
  Settings,
  Menu,
  LogOut,
  WalletCards,
  RotateCcw,
  UserCircle,
} from "lucide-react";
import { cn } from "@/admin-site/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import type { StaffRole } from "@/types/database";
import { AdminPageSkeleton } from "@/admin-site/components/AdminPageSkeleton";
import {
  AdminNotifications,
  type AdminNotificationItem,
} from "@/admin-site/components/AdminNotifications";

export interface AdminLayoutUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

const navItems: Array<{
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: StaffRole[];
}> = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE"] },
  { name: "Events", path: "/admin/events", icon: Calendar, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: "Ticket Types", path: "/admin/ticket-types", icon: Ticket, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart, roles: ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE"] },
  { name: "Refunds", path: "/admin/requests", icon: RotateCcw, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: "Payment Counter", path: "/admin/payment-counter", icon: WalletCards, roles: ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE", "SCANNER"] },
  { name: "Tickets", path: "/admin/tickets", icon: Ticket, roles: ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE"] },
  { name: "Customers", path: "/admin/customers", icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE", "SCANNER"] },
  { name: "Scanner", path: "/admin/scanner", icon: Scan, roles: ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE", "SCANNER"] },
  { name: "Scan History", path: "/admin/scan-history", icon: History, roles: ["SUPER_ADMIN", "ADMIN", "BOX_OFFICE", "SCANNER"] },
  { name: "Staff", path: "/admin/staff", icon: Users, roles: ["SUPER_ADMIN"] },
  { name: "Settings", path: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
];

function roleLabel(role: StaffRole) {
  if (role === "BOX_OFFICE") return "SWARA RANJANA STAFF";
  return role.replaceAll("_", " ");
}

export function Layout({
  children,
  user,
  notifications,
}: {
  children: React.ReactNode;
  user: AdminLayoutUser;
  notifications: AdminNotificationItem[];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [routeSwitching, setRouteSwitching] = useState(false);
  const [pendingSectionName, setPendingSectionName] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => item.roles.includes(user.role)),
    [user.role],
  );

  const resolvedPathName =
    pathname.startsWith("/admin/profile")
      ? "Profile"
      : visibleNavItems.find((item) => pathname.startsWith(item.path))?.name ||
        "Dashboard";
  const currentPathName = pendingSectionName ?? resolvedPathName;
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const displayRole = roleLabel(user.role);

  useEffect(() => {
    setRouteSwitching(false);
    setPendingSectionName(null);
  }, [pathname]);

  const handleAdminNavigation = (item: (typeof navItems)[number]) => {
    setMobileMenuOpen(false);

    if (pathname === item.path) return;

    setPendingSectionName(item.name);
    setRouteSwitching(true);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const NavContent = () => (
    <div className="flex h-full flex-col border-r border-[#C2CBD2]/40 bg-[#F8FAFB]">
      <div className="flex items-center gap-3 p-8">
        <div className="flex h-8 w-8 items-center justify-center">
          <span className="font-gemola text-xl text-[#2271B1]">S</span>
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#31465A]">Swara Ranjana</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#7D8A95]">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {visibleNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => handleAdminNavigation(item)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
              pathname === item.path || pathname.startsWith(`${item.path}/`)
                ? "bg-[#2271B1]/5 font-semibold text-[#2271B1]"
                : "text-[#7D8A95] hover:bg-gray-50",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-6">
        <div className="mb-3 rounded-xl border border-[#C2CBD2]/30 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Session</span>
          </div>
          <p className="text-[11px] font-medium text-[#31465A]">Authenticated • {displayRole}</p>
        </div>

        <Link
          href="/admin/profile"
          onClick={() => setMobileMenuOpen(false)}
          className={cn(
            "mb-1 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
            pathname.startsWith("/admin/profile")
              ? "bg-[#2271B1]/5 text-[#2271B1]"
              : "text-[#7D8A95] hover:bg-gray-50 hover:text-[#31465A]",
          )}
        >
          <UserCircle className="h-4 w-4" />
          Profile
        </Link>

        <button
          onClick={handleSignOut}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#7D8A95] transition-colors hover:bg-gray-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="hidden h-full w-64 shrink-0 md:block">
        <NavContent />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 cursor-pointer bg-[#0E1721]/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FEFFFF]">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#C2CBD2]/30 bg-white px-4 sm:px-10">
          <div className="flex items-center gap-4">
            <button
              className="-ml-2 cursor-pointer rounded-md p-2 text-[#7D8A95] hover:bg-[#F8FAFC] hover:text-[#0E1721] md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="hidden font-serif text-xl text-[#31465A] sm:block">{currentPathName}</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <AdminNotifications items={notifications} userId={user.id} />
            <div className="hidden h-6 w-px bg-[#C2CBD2]/30 sm:block" />

            <Link
              href="/admin/profile"
              className="flex cursor-pointer items-center gap-3 rounded-lg p-1 transition hover:bg-[#F8FAFC]"
              title="Open admin profile"
            >
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-[#31465A]">{user.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#7D8A95]">{displayRole}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C2CBD2]/20 bg-[#C2CBD2]/40 text-xs font-bold text-[#31465A]">
                {initials || "SR"}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 sm:p-10">
          {routeSwitching ? <AdminPageSkeleton /> : children}
        </main>
      </div>
    </div>
  );
}
