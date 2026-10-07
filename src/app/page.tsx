'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Building2,
  CheckCircle,
} from 'lucide-react';

const APP_SUITE = [
  {
    icon: BookOpen,
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    borderColor: 'hover:border-blue-500/40',
    name: 'Academics',
    tagline: 'Notes, PYQs, Syllabus',
    desc: 'Shared academic repository with semester-wise notes, past-year papers, and verified faculty uploads.',
    features: ['Filter by semester & branch', 'Direct PDF downloads'],
  },
  {
    icon: Briefcase,
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500/40',
    name: 'Freelance',
    tagline: 'Campus Marketplace',
    desc: 'Students post gigs, peers submit bids, escrow protects payments. Build your portfolio inside your campus.',
    features: ['Milestone-based escrow', 'Campus-verified talent only'],
  },
  {
    icon: MessageSquare,
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    borderColor: 'hover:border-purple-500/40',
    name: 'Chat',
    tagline: 'Real-time Channels',
    desc: 'Discord-style campus rooms, direct messages, project spaces. All backed by WebSockets.',
    features: ['Live WebSocket streaming', 'Branch & batch channel gates'],
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      router.push('/register');
      return;
    }
    router.push(`/register?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-linear-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">Campus Workspace</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#suite" className="hover:text-white transition">Product Suite</a>
            <a href="#enterprise" className="hover:text-white transition">For Universities</a>
            <Link href="/university/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
              Admin Console
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-medium mb-8">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>One Verified Domain · One Centralized Workspace</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          The All-in-One Workspace <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-300 to-emerald-400">
            Built for Universities
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Academic repository, peer-to-peer freelance marketplace, and real-time Discord-style chat. All authenticated through your verified institutional inbox.
        </p>

        {/* Dynamic Client Form */}
        <form onSubmit={handleStart} className="max-w-md mx-auto flex gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your college email"
            className="flex-1 bg-transparent px-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs sm:text-sm font-semibold text-white flex items-center gap-2 transition shrink-0"
          >
            Join <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-slate-500">
          Instant OTP verification · Domain-restricted access
        </p>
      </section>

      {/* App Suite Grid */}
      <section id="suite" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Campus Workspace includes</h2>
          <p className="text-sm text-slate-400">
            Unified under your university credentials with single sign-on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {APP_SUITE.map((app) => (
            <div
              key={app.name}
              className={`p-8 bg-slate-900/60 border border-slate-800 rounded-3xl ${app.borderColor} transition group`}
            >
              <div className={`w-12 h-12 rounded-2xl ${app.badgeBg} ${app.badgeText} border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <app.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">{app.name}</h3>
              <p className={`text-xs ${app.badgeText} font-semibold mb-3`}>{app.tagline}</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">{app.desc}</p>
              <ul className="space-y-2 text-xs text-slate-300">
                {app.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${app.badgeText}`} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise / Institution Banner */}
      <section id="enterprise" className="max-w-6xl mx-auto px-6 py-16 mb-16">
        <div className="relative bg-linear-to-r from-emerald-950/40 via-blue-950/30 to-slate-900 border border-emerald-500/30 rounded-3xl p-10 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4" /> For Deans, Principals & IT Admins
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Claim Your Official Campus Portal</h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Verify your official domain, set campus moderation policies, and grant student access in under 2 minutes with official email verification.
            </p>
            <Link
              href="/university/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold transition shadow-lg shadow-emerald-600/30"
            >
              <Building2 className="w-4 h-4" /> Register University → Admin Console
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Campus Workspace. Multi-tenant institutional network.</p>
          <div className="flex gap-6">
            <Link href="/university/register" className="hover:text-slate-300">Register University</Link>
            <Link href="/login" className="hover:text-slate-300">Sign In</Link>
            <Link href="/register" className="hover:text-slate-300">Student Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}