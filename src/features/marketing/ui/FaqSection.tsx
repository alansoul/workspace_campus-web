
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const FAQS = [
  {
    question: "What's included with Aura Workspace?",
    answer:
      'Aura Workspace unifies your college campus under a single institutional portal. It combines Aura Scholar (academic note repository and past-year papers), Aura Pulse (real-time chat and audio rooms), and Aura Forge (peer-to-peer freelance marketplace protected by milestone escrow).',
  },
  {
    question: 'How does university domain verification work?',
    answer:
      'When an IT admin, Dean, or Principal claims their institution, an OTP is sent to the official administrative contact. Once verified, students registering with that domain can join the verified campus portal.',
  },
  {
    question:
      'Can students without a college email still use the platform?',
    answer:
      'Yes. Students and external clients using personal accounts can access Aura Pulse public channels and participate in Aura Forge freelance gigs. University-specific academic resources and private campus channels remain restricted until linked to a verified institution.',
  },
  {
    question:
      'How does milestone escrow work in the freelance marketplace?',
    answer:
      'When a client hires a student developer or designer, payment is secured for the agreed milestone. The student submits the work for review, and funds are released according to the agreed approval and dispute-resolution terms.',
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative isolate overflow-hidden bg-[#FAFBFF] px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      {/* Soft background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 top-28 h-105 w-105 rounded-full bg-blue-200/35 blur-[100px]" />

        <div className="absolute -right-32 -top-24 h-100 w-100 rounded-full bg-purple-200/35 blur-[110px]" />

        <div className="absolute bottom-0 left-1/3 h-70 w-125 rounded-full bg-sky-100/50 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-360">
        {/* Heading */}
        <header className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#0B57D0] shadow-sm">
            <Sparkles className="h-4 w-4" />
            FAQ
          </span>

          <h2 className="text-balance text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.055em] text-[#171B2C] sm:text-5xl lg:text-[3.75rem]">
            Find the answers
            <br />
            <span className="bg-linear-to-r from-[#0B57D0] via-[#5277F4] to-[#B044E8] bg-clip-text text-transparent">
              that you need.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-[#626B80] sm:text-lg sm:leading-8">
            Everything you need to know about Aura Workspace, from getting
            started to campus verification, security, and the freelance
            marketplace.
          </p>
        </header>

        {/* FAQ and resource cards */}
        <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Accordion */}
          <div className="lg:col-span-8">
            <div className="rounded-[28px] border border-[#DFE7FF] bg-white/85 p-3 shadow-[0_18px_70px_-35px_rgba(49,91,190,0.22)] backdrop-blur-xl sm:p-5">
              <div className="divide-y divide-[#E8EDF7]">
                {FAQS.map((item, idx) => {
                  const isOpen = openIdx === idx;
                  const answerId = `faq-answer-${idx}`;

                  return (
                    <article key={item.question} className="py-2.5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        onClick={() =>
                          setOpenIdx(isOpen ? null : idx)
                        }
                        className={`group flex w-full items-center gap-3 rounded-[20px] px-3 py-4 text-left transition-colors duration-200 sm:gap-5 sm:px-5 ${
                          isOpen
                            ? 'bg-linear-to-br from-[#F3F7FF] to-[#F8FAFF]'
                            : 'bg-transparent hover:bg-[#F7F9FE]'
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold tracking-tight transition-colors ${
                            isOpen
                              ? 'bg-[#DCE8FF] text-[#0B57D0]'
                              : 'bg-[#F0F4FD] text-[#2455C7]'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        <span className="min-w-0 flex-1 text-[15px] font-semibold leading-6 tracking-tight text-[#1B2030] sm:text-lg sm:leading-7">
                          {item.question}
                        </span>

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isOpen
                              ? 'bg-[#E4EDFF] text-[#0B57D0]'
                              : 'bg-[#F2F5FC] text-[#30394B] group-hover:bg-[#E6EEFF]'
                          }`}
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          id={answerId}
                          className="pb-5 pl-18 pr-4 pt-1 sm:pl-23 sm:pr-8"
                        >
                          <p className="max-w-3xl text-sm leading-7 text-[#626B80] sm:text-base sm:leading-[1.8]">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resource cards */}
          <aside className="grid gap-5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            {/* AI resources */}
            <article className="group relative isolate overflow-hidden rounded-[28px] border border-[#DCE7FF] bg-linear-to-br from-white via-[#F0F6FF] to-[#E1ECFF] p-6 shadow-[0_16px_50px_-35px_rgba(45,93,194,0.35)] sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-blue-300/20 blur-2xl transition-transform duration-300 group-hover:scale-110"
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/80 bg-white/80 text-[#1769EA] shadow-sm">
                <BookOpen className="h-7 w-7" strokeWidth={2.2} />
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[#171B2C] sm:text-[22px]">
                Build your AI fluency
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#626B80] sm:text-[15px]">
                Discover how to transform course revision and exam preparation
                using Gemini Academic Intelligence.
              </p>

              <Link
                href="/academics"
                className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#0B57D0] transition-colors hover:text-[#0842A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
              >
                See resources
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Sparkles
                aria-hidden="true"
                className="pointer-events-none absolute bottom-7 right-7 h-10 w-10 text-[#6C8FF8]/40"
              />
            </article>

            {/* Admin help */}
            <article className="group relative isolate overflow-hidden rounded-[28px] border border-[#EDE1FF] bg-linear-to-br from-white via-[#FBF6FF] to-[#F0E5FF] p-6 shadow-[0_16px_50px_-35px_rgba(139,76,202,0.3)] sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-purple-300/20 blur-2xl transition-transform duration-300 group-hover:scale-110"
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/80 bg-white/80 text-[#8750D9] shadow-sm">
                <UsersRound className="h-7 w-7" strokeWidth={2.2} />
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[#171B2C] sm:text-[22px]">
                Get admin help
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#626B80] sm:text-[15px]">
                Sign in to find institutional answers, manage student branches,
                or claim your custom university domain.
              </p>

              <Link
                href="/setup"
                className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#0B57D0] transition-colors hover:text-[#0842A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
              >
                Get admin support
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <ShieldCheck
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 right-6 h-12 w-12 text-[#9562E6]/30"
              />
            </article>
          </aside>
        </div>

        {/* Reassurance footer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#747E92] sm:mt-12 sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-[#0B57D0]" />
            Campus-focused tools
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-[#C6CEE0] sm:block" />

          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0B57D0]" />
            Institutional access controls
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-[#C6CEE0] sm:block" />

          <Link
            href="/setup"
            className="inline-flex items-center gap-1.5 text-[#0B57D0] hover:underline"
          >
            Need more help?
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
