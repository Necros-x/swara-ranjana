"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  ShoppingCart,
  Users,
  Scan,
  History,
  Settings,
  Bell,
  Menu,
  LogOut,
  WalletCards,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/admin-site/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import type { StaffRole } from '@/types/database';

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
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE'] },
  { name: 'Events', path: '/admin/events', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Ticket Types', path: '/admin/ticket-types', icon: Ticket, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE'] },
  { name: 'Refunds', path: '/admin/requests', icon: RotateCcw, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Payment Counter', path: '/admin/payment-counter', icon: WalletCards, roles: ['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE'] },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket, roles: ['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE'] },
  { name: 'Customers', path: '/admin/customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE'] },
  { name: 'Scanner', path: '/admin/scanner', icon: Scan, roles: ['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE', 'SCANNER'] },
  { name: 'Scan History', path: '/admin/scan-history', icon: History, roles: ['SUPER_ADMIN', 'ADMIN', 'BOX_OFFICE', 'SCANNER'] },
  { name: 'Staff', path: '/admin/staff', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { name: 'Settings', path: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export function Layout({ children, user }: { children: React.ReactNode; user: AdminLayoutUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => item.roles.includes(user.role)),
    [user.role],
  );

  const currentPathName = visibleNavItems.find((item) => pathname.startsWith(item.path))?.name || 'Dashboard';
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  const NavContent = () => (
    <div className="flex h-full flex-col bg-[#F8FAFB] border-r border-[#C2CBD2]/40">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-[#2271B1] font-gemola text-xl">S</span>
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#31465A]">Swara Ranjana</h1>
          <p className="text-[10px] text-[#7D8A95] uppercase tracking-wider font-medium">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
              pathname === item.path || pathname.startsWith(`${item.path}/`)
                ? 'bg-[#2271B1]/5 text-[#2271B1] font-semibold'
                : 'text-[#7D8A95] hover:bg-gray-50',
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 bg-white border border-[#C2CBD2]/30 rounded-xl shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">Session</span>
          </div>
          <p className="text-[11px] text-[#31465A] font-medium">Authenticated • {user.role.replace('_', ' ')}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#7D8A95] hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="hidden md:block w-64 h-full shrink-0">
        <NavContent />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0E1721]/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FEFFFF]">
        <header className="h-20 bg-white border-b border-[#C2CBD2]/30 flex items-center justify-between px-4 sm:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-[#7D8A95] hover:text-[#0E1721] rounded-md hover:bg-[#F8FAFC]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-serif text-[#31465A] hidden sm:block">{currentPathName}</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#7D8A95] hover:text-[#31465A] transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <div className="hidden sm:block h-6 w-px bg-[#C2CBD2]/30" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#31465A]">{user.name}</p>
                <p className="text-[10px] text-[#7D8A95] uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#C2CBD2]/40 border border-[#C2CBD2]/20 flex items-center justify-center font-bold text-[#31465A] text-xs">
                {initials || 'SR'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
