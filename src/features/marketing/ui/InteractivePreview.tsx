'use client';


import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { SUITE_APPS } from '../data/brand.config';
import '../styles/InteractivePreview.css';


const cardThemes = [
  {
    key: 'campus',
    eyebrow: 'YOUR LEARNING SPACE',
    accent: '#2878ff',
    soft: '#eaf2ff',
    gradient: 'from-[#e5efff] via-[#f5f8ff] to-white',
    border: 'border-[#dce7ff]',
    glow: 'rgba(59,130,246,.17)',
    icon: GraduationCap,
    previewLabel: 'UNIT 03 · SYLLABUS',
    previewTitle: 'Operating Systems',
    previewSubtitle: 'Department of Computer Science',
    badge: '24 active courses',
    description:
      'Your courses, notes, past papers, and learning resources—all connected in one place.',
    action: 'Explore Campus',
    points: ['Course materials', 'Smart study notes', 'Shared resources'],
  },
  {
    key: 'circle',
    eyebrow: 'YOUR PEOPLE, YOUR IDEAS',
    accent: '#8755f7',
    soft: '#f0e9ff',
    gradient: 'from-[#f1e9ff] via-[#faf7ff] to-white',
    border: 'border-[#e8dcff]',
    glow: 'rgba(139,92,246,.18)',
    icon: Users,
    previewLabel: '# HACKATHON-SQUAD',
    previewTitle: 'Let’s build something great.',
    previewSubtitle: 'Ideas are better together.',
    badge: 'Communities that connect',
    description:
      'Bring classmates together with live conversations, collaborative spaces, and shared ideas.',
    action: 'Join Circle Rooms',
    points: ['Live chat rooms', 'Group discussions', 'Voice lounges'],
  },
  {
    key: 'workflow',
    eyebrow: 'FROM BRIEF TO DONE',
    accent: '#0a9b68',
    soft: '#e1f8ed',
    gradient: 'from-[#e5f9ed] via-[#f5fcf7] to-white',
    border: 'border-[#d4efdf]',
    glow: 'rgba(16,185,129,.16)',
    icon: Wallet,
    previewLabel: 'PROJECT MILESTONE',
    previewTitle: 'Fullstack prototype',
    previewSubtitle: 'Milestone progress',
    badge: 'Work organized',
    description:
      'Manage freelance projects, coordinate feedback, and keep deliverables and milestones on track.',
    action: 'Explore Workflow',
    points: ['Project milestones', 'Client collaboration', 'Payment tracking'],
  },
] as const;


type ThemeKey = (typeof cardThemes)[number]['key'];


export function InteractivePreview() {
  const campus = SUITE_APPS[0];
  const circle = SUITE_APPS[1];
  const workflow = SUITE_APPS[2];


  const apps = { campus, circle, workflow };


  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);


  const handlePointerMove = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }


      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();


      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;


      const rotateY = (x - 0.5) * 5;
      const rotateX = (0.5 - y) * 5;


      card.style.setProperty('--rx', `${rotateX}deg`);
      card.style.setProperty('--ry', `${rotateY}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    },
    [],
  );


  const resetPointer = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const card = event.currentTarget;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    },
    [],
  );


  return (
    <section
      id="features"
      aria-labelledby="suite-showcase-title"
      className="suite-showcase relative isolate overflow-hidden px-5 py-20 sm:px-8 lg:py-28"
    >
      {/* Decorative gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="suite-orb suite-orb-blue" />
        <div className="suite-orb suite-orb-purple" />
        <div className="suite-orb suite-orb-green" />
      </div>


      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-4 py-2 text-xs font-semibold tracking-wide text-[#5d56cb] shadow-sm backdrop-blur-xl sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            ONE CONNECTED WORKSPACE
          </span>


          <h2
            id="suite-showcase-title"
            className="text-balance text-3xl font-semibold leading-tight tracking-[-1.5px] text-[#17182b] sm:text-4xl lg:text-5xl lg:tracking-[-2px]"
          >
            One subscription.
            <br className="hidden sm:block" />{' '}
            <span className="suite-gradient-text">
              Endless ways to move forward.
            </span>
          </h2>


          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-7 text-[#69738c] sm:text-base sm:leading-8">
            Learn together, connect with your community, and turn your ideas
            into real progress—all in one workspace.
          </p>
        </div>


        {/* Product cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-7">
          {cardThemes.map((theme, index) => {
            const app = apps[theme.key as ThemeKey];
            const Icon = theme.icon;


            return (
              <Link
                key={theme.key}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                href={app.href}
                onMouseMove={handlePointerMove}
                onMouseLeave={resetPointer}
                style={
                  {
                    '--card-accent': theme.accent,
                    '--card-soft': theme.soft,
                    '--card-glow': theme.glow,
                    '--rx': '0deg',
                    '--ry': '0deg',
                    '--mx': '50%',
                    '--my': '50%',
                    animationDelay: `${index * 100}ms`,
                  } as CSSProperties
                }
                className={`suite-product-card group relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border ${theme.border} bg-linear-to-br ${theme.gradient} p-4 sm:p-5 lg:p-6`}
              >
                {/* Interactive spotlight */}
                <div
                  aria-hidden="true"
                  className="suite-card-spotlight pointer-events-none absolute inset-0"
                />


                {/* Mini product preview */}
                <div className="suite-preview-panel relative flex min-h-59.5 flex-col justify-between overflow-hidden rounded-[21px] border border-white/90 bg-white/75 p-5 shadow-[0_8px_28px_rgba(45,55,100,0.045)] backdrop-blur-xl sm:min-h-63.75 sm:p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/70 via-transparent to-white/10"
                  />


                  <div className="relative flex items-center justify-between gap-3">
                    <span
                      className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-white bg-white/90 px-3 py-2 text-[10px] font-bold tracking-wide shadow-sm sm:text-[11px]"
                      style={{ color: theme.accent }}
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      {theme.previewLabel}
                    </span>


                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/90 shadow-sm"
                      style={{ backgroundColor: theme.soft }}
                    >
                      <Image
                        src={app.iconSrc}
                        alt=""
                        width={30}
                        height={30}
                        className="h-7.5 w-7.5 object-contain"
                      />
                    </div>
                  </div>


                  {/* Decorative SVG illustration */}
                  <div
                    aria-hidden="true"
                    className="suite-preview-art pointer-events-none absolute inset-x-0 top-16 flex h-25 items-center justify-center"
                  >
                    {theme.key === 'campus' && (
                      <div className="relative flex items-center justify-center">
                        <div className="suite-art-ring h-22.5 w-22.5 rounded-full" />
                        <div
                          className="absolute flex h-16.75 w-16.75 items-center justify-center rounded-[23px] border border-white bg-white/80 shadow-[0_10px_35px_rgba(45,110,255,.14)]"
                          style={{ color: theme.accent }}
                        >
                          <BookOpen className="h-8 w-8" strokeWidth={1.6} />
                        </div>
                        <Sparkles
                          className="absolute -right-6 -top-2 h-5 w-5"
                          style={{ color: theme.accent }}
                        />
                      </div>
                    )}


                    {theme.key === 'circle' && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute h-23.5 w-23.5 rounded-full bg-purple-200/50 blur-xl" />
                        <div className="relative flex -space-x-3">
                          {[
                            'bg-[#d8ccff]',
                            'bg-[#ffd8eb]',
                            'bg-[#d6e8ff]',
                          ].map((color, i) => (
                            <div
                              key={color}
                              className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white shadow-lg ${color}`}
                              style={{
                                transform: `translateY(${i === 1 ? '-7px' : '3px'})`,
                              }}
                            >
                              <Users
                                className="h-6 w-6 text-[#7254cf]"
                                strokeWidth={1.7}
                              />
                            </div>
                          ))}
                        </div>
                        <MessageCircle
                          className="absolute -right-7 top-0 h-6 w-6 text-purple-500"
                          fill="#e9ddff"
                        />
                      </div>
                    )}


                    {theme.key === 'workflow' && (
                      <div className="relative flex items-center justify-center">
                        <div className="suite-art-ring h-22.5 w-22.5 rounded-full" />
                        <div className="absolute flex h-16.75 w-16.75 items-center justify-center rounded-[23px] border border-white bg-white/80 text-emerald-600 shadow-[0_10px_35px_rgba(16,185,129,.13)]">
                          <ShieldCheck
                            className="h-9 w-9"
                            strokeWidth={1.6}
                          />
                        </div>
                        <CheckCircle2
                          className="absolute -right-6 bottom-0 h-6 w-6 text-emerald-500"
                          fill="#dcfce7"
                        />
                      </div>
                    )}
                  </div>


                  <div className="relative mt-auto space-y-1.5">
                    <h3 className="text-[15px] font-bold tracking-[-0.35px] text-[#20243b] sm:text-base">
                      {theme.previewTitle}
                    </h3>
                    <p className="text-xs leading-5 text-[#74809b]">
                      {theme.previewSubtitle}
                    </p>
                  </div>
                </div>


                {/* Product information */}
                <div className="relative flex flex-1 flex-col px-1 pb-1 pt-6 sm:px-2 sm:pt-7">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/90 shadow-sm"
                      style={{ backgroundColor: theme.soft }}
                    >
                      <Icon
                        className="h-5.25 w-5.25"
                        style={{ color: theme.accent }}
                        strokeWidth={1.8}
                      />
                    </div>


                    <div className="min-w-0">
                      <p
                        className="mb-0.5 text-[10px] font-bold tracking-[1.2px]"
                        style={{ color: theme.accent }}
                      >
                        {theme.eyebrow}
                      </p>
                      <h3 className="text-lg font-bold tracking-[-0.6px] text-[#1d2035] sm:text-xl">
                        {app.brandTitle}
                      </h3>
                    </div>
                  </div>


                  <p className="mb-5 text-[13px] leading-[1.85] text-[#69738c] sm:text-sm">
                    {theme.description}
                  </p>


                  {/* Feature list */}
                  <ul className="mb-7 space-y-2.5">
                    {theme.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2.5 text-xs font-medium text-[#4f5a76] sm:text-[13px]"
                      >
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          style={{ color: theme.accent }}
                          strokeWidth={1.8}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>


                  {/* Footer CTA */}
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/5.5 pt-4">
                    <span
                      className="inline-flex items-center gap-2 text-[13px] font-bold"
                      style={{ color: theme.accent }}
                    >
                      {theme.action}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>


                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/75 shadow-sm transition-all duration-300 group-hover:scale-110"
                      style={{ color: theme.accent }}
                    >
                      <ArrowDownRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>


        {/* Bottom reassurance */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center text-xs font-medium text-[#7b849b] sm:mt-12 sm:gap-x-8">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            One connected workspace
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-[#c4c9d8] sm:block" />
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Built for your everyday workflow
          </span>
        </div>
      </div>
    </section>
  );
}


export default InteractivePreview;