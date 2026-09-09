"use client";

import React, { useState } from 'react';
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
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { currentUser } from '@/admin-site/data/mock-data';
import { cn } from '@/admin-site/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Ticket Types', path: '/admin/ticket-types', icon: Ticket },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Scanner', path: '/admin/scanner', icon: Scan },
  { name: 'Scan History', path: '/admin/scan-history', icon: History },
  { name: 'Staff', path: '/admin/staff', icon: Users },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentPathName = navItems.find(item => pathname.startsWith(item.path))?.name || 'Dashboard';

  const NavContent = () => (
    <div className="flex h-full flex-col bg-[#F8FAFB] border-r border-[#C2CBD2]/40">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-[#2271B1] font-serif font-bold italic text-xl">S</span>
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#31465A]">Swara Ranjana</h1>
          <p className="text-[10px] text-[#7D8A95] uppercase tracking-wider font-medium">Admin Portal</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
              pathname === item.path || pathname.startsWith(`${item.path}/`)
                ? 'bg-[#2271B1]/5 text-[#2271B1] font-semibold'
                : 'text-[#7D8A95] hover:bg-gray-50'
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
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8A95]">System Status</span>
          </div>
          <p className="text-[11px] text-[#31465A] font-medium">Operational • 12 Staff Online</p>
        </div>
        <button
          onClick={() => router.push('/admin/login')}
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
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full shrink-0">
        <NavContent />
      </div>

      {/* Mobile Menu Overlay */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FEFFFF]">
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#C2CBD2]/30 flex items-center justify-between px-4 sm:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-[#7D8A95] hover:text-[#0E1721] rounded-md hover:bg-[#F8FAFC]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-xl font-serif text-[#31465A] hidden sm:block">{currentPathName}</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#7D8A95] hover:text-[#31465A] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2271B1] rounded-full ring-2 ring-white"></span>
            </button>
            <div className="hidden sm:block h-6 w-px bg-[#C2CBD2]/30"></div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#31465A]">{currentUser.name}</p>
                <p className="text-[10px] text-[#7D8A95] uppercase tracking-wider">{currentUser.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#C2CBD2]/40 border border-[#C2CBD2]/20 flex items-center justify-center font-bold text-[#31465A] text-xs">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 sm:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
