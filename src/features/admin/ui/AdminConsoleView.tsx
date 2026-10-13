// src/features/admin/ui/AdminConsoleView.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import {
  Users,
  CreditCard,
  Globe,
  Bell,
  Sparkles,
  Search,
  LayoutDashboard,
  Shield,
  Layers,
  FileText,
  ExternalLink,
} from 'lucide-react';

export function AdminConsoleView() {
  const { user } = useAuthSession();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFD] flex text-[#1F1F1F]">
      <aside className="w-64 bg-white border-r border-[#E8EAED] p-4 hidden lg:flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="px-3">
            <span className="text-xs uppercase font-bold tracking-wider text-[#5F6368]">
              Governance Console
            </span>
          </div>

          <nav className="space-y-1 text-sm font-medium text-[#444746]">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#E8F0FE] text-[#0B57D0] font-semibold"
            >
              <LayoutDashboard className="w-4 h-4" /> Home Dashboard
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F1F3F4] transition"
            >
              <Users className="w-4 h-4" /> Directory & Users
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F1F3F4] transition"
            >
              <CreditCard className="w-4 h-4" /> Billing & Subscriptions
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F1F3F4] transition"
            >
              <Globe className="w-4 h-4" /> Domain Management
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F1F3F4] transition"
            >
              <Shield className="w-4 h-4" /> Security & Identity
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F1F3F4] transition"
            >
              <Layers className="w-4 h-4" /> App Configurations
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F1F3F4] transition"
            >
              <FileText className="w-4 h-4" /> Audit & Reporting
            </Link>
          </nav>
        </div>

        <div className="border-t border-[#E8EAED] pt-4 px-3 space-y-2">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[#0B57D0] flex items-center justify-between hover:underline"
          >
            <span>Exit to User Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[10px] text-[#5F6368]">Multi-Tenant v2.4 (Neon PostgreSQL)</p>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8EAED] pb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-normal text-[#1F1F1F]">
              {user?.universityName || 'Campus Workspace'}
            </h1>
            <p className="text-xs text-[#5F6368] mt-1">
              Welcome to the Northstar Workspace Administrator Console
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#5F6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users, groups or settings..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#E8EAED] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-[#DADCE0] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-[#1F1F1F]">Users</h3>
              <span className="text-xs font-semibold text-[#0B57D0]">Active Directory</span>
            </div>
            <p className="text-xs text-[#5F6368]">Add or manage students and faculty accounts</p>

            <div className="flex items-center gap-6 py-2 border-y border-[#F1F3F4]">
              <div>
                <p className="text-xs text-[#5F6368]">Active</p>
                <p className="text-2xl font-bold text-[#1F1F1F]">3</p>
              </div>
              <div>
                <p className="text-xs text-[#5F6368]">Invited</p>
                <p className="text-2xl font-bold text-slate-400">0</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium text-[#0B57D0]">
              <button className="block hover:underline text-left cursor-pointer">+ Add a new user</button>
              <button className="block hover:underline text-left cursor-pointer">Invite batch by CSV</button>
              <button className="block hover:underline text-left cursor-pointer">Assign department roles</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DADCE0] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-[#1F1F1F]">Billing</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active Tier
              </span>
            </div>
            <p className="text-xs text-[#5F6368]">Manage subscriptions and payment accounts</p>

            <div className="py-2 border-y border-[#F1F3F4]">
              <p className="text-xs text-[#5F6368]">Current Subscription</p>
              <p className="text-sm font-bold text-[#1F1F1F] mt-0.5">Enterprise Campus License</p>
            </div>

            <div className="space-y-2 text-xs font-medium text-[#0B57D0]">
              <button className="block hover:underline text-left cursor-pointer">Manage subscriptions</button>
              <button className="block hover:underline text-left cursor-pointer">View invoices</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DADCE0] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-[#1F1F1F]">Domains</h3>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
            <p className="text-xs text-[#5F6368]">Manage registered university apex domains</p>

            <div className="py-2 border-y border-[#F1F3F4]">
              <p className="text-xs text-[#5F6368]">Primary Apex Domain</p>
              <p className="text-sm font-mono font-semibold text-[#1F1F1F] mt-0.5">
                {user?.universityDomain || 'alantech.com'}
              </p>
            </div>

            <div className="space-y-2 text-xs font-medium text-[#0B57D0]">
              <button className="block hover:underline text-left cursor-pointer">Manage domains</button>
              <button className="block hover:underline text-left cursor-pointer">+ Add secondary domain</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DADCE0] p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-base text-[#1F1F1F]">AI Capabilities</h3>
            </div>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Boost institutional productivity with Gemini-powered summarization and embeddings.
            </p>
            <div className="pt-4 border-t border-[#F1F3F4]">
              <button className="text-xs font-semibold text-[#0B57D0] hover:underline">
                Configure AI policy →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DADCE0] p-6 shadow-2xs space-y-3">
            <h3 className="font-semibold text-base text-[#1F1F1F]">Product updates</h3>
            <div className="space-y-2.5 text-xs text-[#444746]">
              <div className="border-b border-[#F1F3F4] pb-2">
                <p className="font-medium text-[#1F1F1F]">Real-time milestone escrow releases</p>
                <p className="text-[11px] text-[#5F6368]">Active in Freelance Hub</p>
              </div>
              <div>
                <p className="font-medium text-[#1F1F1F]">WebSocket doubts gateway</p>
                <p className="text-[11px] text-[#5F6368]">Live in Campus Chat</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DADCE0] p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-base text-[#1F1F1F]">System Alerts</h3>
            </div>
            <p className="text-xs text-[#5F6368]">0 critical security warnings</p>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
              ✅ All institutional domain endpoints operational on Render & Neon PostgreSQL.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminConsoleView;