'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { LinkCampusModal } from './LinkCampusModal';
import {
  Compass,
  LayoutGrid,
  Search,
  Sparkles,
  BookOpen,
  Briefcase,
  MessageSquare,
  ShieldAlert,
  Users,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuthSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'apps'>(
    'recommendations',
  );
  const [appSearch, setAppSearch] = useState('');
  const [filterPill, setFilterPill] = useState('To do');

  // Manual open from banner button (no effect needed)
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Open from URL ?modal=link-campus (derived — no setState in effect)
  const urlWantsModal = searchParams.get('modal') === 'link-campus';
  const modalOpen = urlWantsModal || manualModalOpen;

  const isIndividual =
    user?.accountType === 'INDIVIDUAL' || !user?.universityId;

  const displayName = user?.name || 'there';

  const closeModal = () => {
    setManualModalOpen(false);
    if (urlWantsModal) {
      router.replace('/dashboard');
    }
  };

  const openModal = () => {
    setManualModalOpen(true);
  };

  const apps = [
    {
      id: 'academics',
      name: 'Academics & Drive',
      category: 'Education',
      href: '/academics',
      icon: BookOpen,
      color: 'bg-blue-600 text-white',
      desc: 'Notes, PYQs, and lecture drive repository',
    },
    {
      id: 'chat',
      name: 'Campus Chat',
      category: 'Communication',
      href: '/chat',
      icon: MessageSquare,
      color: 'bg-indigo-600 text-white',
      desc: 'Real-time campus channels and doubt forums',
    },
    {
      id: 'freelance',
      name: 'Freelance Hub',
      category: 'Marketplace',
      href: '/freelance',
      icon: Briefcase,
      color: 'bg-emerald-600 text-white',
      desc: 'Peer-to-peer student gigs with milestone escrow',
    },
    {
      id: 'ai',
      name: 'Northstar Copilot',
      category: 'AI Assistant',
      href: '/chat?ai=true',
      icon: Sparkles,
      color: 'bg-linear-to-tr from-purple-600 to-indigo-600 text-white',
      desc: 'Gemini-powered campus research assistant',
    },
    {
      id: 'admin',
      name: 'Admin Console',
      category: 'Governance',
      href: '/admin',
      icon: ShieldAlert,
      color: 'bg-amber-600 text-white',
      desc: 'University member directory & domain settings',
      adminOnly: true,
    },
    {
      id: 'directory',
      name: 'Student Directory',
      category: 'People',
      href: '/admin',
      icon: Users,
      color: 'bg-cyan-600 text-white',
      desc: 'Verified institutional contacts & badges',
    },
  ];

  const filteredApps = apps.filter((app) => {
    if (
      app.adminOnly &&
      user?.role !== 'CAMPUS_ADMIN' &&
      (user?.role as string) !== 'ADMIN' &&
      user?.role !== 'SUPER_ADMIN'
    ) {
      return false;
    }
    return (
      app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.category.toLowerCase().includes(appSearch.toLowerCase())
    );
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFD] flex flex-col md:flex-row text-[#1F1F1F] font-['Google_Sans',sans-serif]">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E8EAED] p-4 flex md:flex-col gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-full text-sm font-medium transition cursor-pointer ${
            activeTab === 'recommendations'
              ? 'bg-[#C2E7FF] text-[#001D35] font-semibold'
              : 'text-[#444746] hover:bg-[#F1F3F4]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5" />
            <span>Recommendations</span>
          </div>
          <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full font-bold text-[#001D35]">
            14
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apps')}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-full text-sm font-medium transition cursor-pointer ${
            activeTab === 'apps'
              ? 'bg-[#C2E7FF] text-[#001D35] font-semibold'
              : 'text-[#444746] hover:bg-[#F1F3F4]'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Your apps</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-6">
        {/* Banner */}
        {isIndividual ? (
          <div className="bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-2xs gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 text-lg">
                🎓
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Unlock Campus Academics & Notes
                </h3>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  You signed in with Gmail. Link your official university email
                  to access syllabus notes and repositories.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="shrink-0 px-4 py-2 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Link Campus Email</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#E8EAED] rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3 text-xs md:text-sm text-[#444746]">
              <span className="text-blue-600 font-bold">📢</span>
              <span>
                Northstar Workspace is managed by{' '}
                <strong>
                  {user?.universityName || 'your university administrator'}
                </strong>
                .
              </span>
            </div>
            <Link
              href="/admin"
              className="text-xs font-semibold text-[#0B57D0] hover:underline shrink-0"
            >
              Open console →
            </Link>
          </div>
        )}

        {/* TAB 1: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-normal text-[#1F1F1F] tracking-tight">
                👋 Hi {displayName}, here are some tips for you
              </h1>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                'To do',
                'Done',
                'Things to set up',
                'Collaboration',
                'Communication',
                'Safer with Northstar',
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setFilterPill(pill)}
                  className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                    filterPill === pill
                      ? 'bg-[#C2E7FF] text-[#001D35] font-semibold'
                      : 'border border-[#747775] text-[#444746] hover:bg-white'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1F1F]">
                    Free up time with the AI-powered Copilot
                  </h3>
                  <p className="text-xs md:text-sm text-[#444746] leading-relaxed">
                    Chat with your institutional AI model to research course
                    material, summarize lecture notes, and draft project
                    proposals.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F3F4]">
                  <Link
                    href="/chat?ai=true"
                    className="text-xs font-semibold text-[#0B57D0] hover:underline"
                  >
                    Get started
                  </Link>
                  <span className="flex items-center gap-1 text-xs text-[#5F6368]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1F1F]">
                    Browse Academic Notes & PYQ Repository
                  </h3>
                  <p className="text-xs md:text-sm text-[#444746] leading-relaxed">
                    Access syllabus-verified question banks, hand-written branch
                    notes, and tutorial sheets organized by semester.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F3F4]">
                  <Link
                    href="/academics"
                    className="text-xs font-semibold text-[#0B57D0] hover:underline"
                  >
                    Show me how
                  </Link>
                  <span className="flex items-center gap-1 text-xs text-[#5F6368]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1F1F]">
                    Monetize campus skills with Escrow Gigs
                  </h3>
                  <p className="text-xs md:text-sm text-[#444746] leading-relaxed">
                    Build projects for university clubs and peers. Payments are
                    held in secure escrow until you deliver the milestones.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F3F4]">
                  <Link
                    href="/freelance"
                    className="text-xs font-semibold text-[#0B57D0] hover:underline"
                  >
                    Explore gigs
                  </Link>
                  <span className="flex items-center gap-1 text-xs text-[#5F6368]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1F1F1F]">
                    Connect on verified campus channels
                  </h3>
                  <p className="text-xs md:text-sm text-[#444746] leading-relaxed">
                    Discord-style real-time collaboration channels restricted
                    exclusively to students of your institutional domain.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#F1F3F4]">
                  <Link
                    href="/chat"
                    className="text-xs font-semibold text-[#0B57D0] hover:underline"
                  >
                    Open chat
                  </Link>
                  <span className="flex items-center gap-1 text-xs text-[#5F6368]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YOUR APPS */}
        {activeTab === 'apps' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-normal text-[#1F1F1F]">Your apps</h1>
              <p className="text-xs text-[#5F6368] mt-1">
                Apps licensed and provisioned under your university domain
              </p>
            </div>

            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-[#5F6368] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Find an app..."
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-[#E8EAED] text-sm text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredApps.map((app) => (
                <Link
                  key={app.id}
                  href={app.href}
                  className="bg-white rounded-3xl border border-[#E8EAED] p-5 flex flex-col items-center text-center hover:shadow-md hover:border-[#0B57D0] transition group cursor-pointer"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform ${app.color}`}
                  >
                    <app.icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-[#1F1F1F] group-hover:text-[#0B57D0] transition">
                    {app.name}
                  </span>
                  <span className="text-[11px] text-[#5F6368] mt-1 line-clamp-1">
                    {app.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <LinkCampusModal open={modalOpen} onClose={closeModal} />
    </div>
  );
}

/** Public export — Suspense required for useSearchParams */
export function DiscoverDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-slate-400 flex items-center justify-center min-h-[50vh]">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

export default DiscoverDashboard;