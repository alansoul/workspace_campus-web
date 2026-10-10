'use client';

import { useState, useRef, Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

export interface AppShowcaseDockProps {
  selectedAppId?: string;
  onSelectAppId?: Dispatch<SetStateAction<string>> | ((id: string) => void);
}

export function AppShowcaseDock({
  selectedAppId,
  onSelectAppId,
}: AppShowcaseDockProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMousePos({ x, y });
  }

  const apps = [
    {
      id: 'campus',
      name: 'Campus',
      desc: 'Academic intelligence & course repository',
      href: '/academics',
      iconSrc: '/icons/northstar-campus-icon.svg',
      glow: 'rgba(26, 115, 232, 0.22)',
    },
    {
      id: 'circle',
      name: 'Circle',
      desc: 'Real-time WebSocket channels & huddles',
      href: '/chat',
      iconSrc: '/icons/northstar-circle-icon.svg',
      glow: 'rgba(124, 77, 255, 0.22)',
    },
    {
      id: 'workflow',
      name: 'Workflow',
      desc: 'Milestone escrow & peer bounties',
      href: '/freelance',
      iconSrc: '/icons/northstar-workflow-icon.svg',
      glow: 'rgba(0, 200, 83, 0.22)',
    },
  ];

  return (
    <section
  ref={containerRef}
  onMouseMove={handleMouseMove}
  className="relative isolate overflow-hidden bg-transparent pt-28 pb-24 sm:pt-36 sm:pb-32 lg:pt-40 select-none font-['Google_Sans',sans-serif]"
>
      {/* Seamless Decorative Ambient Glows (Smoothly blended, no sharp divider lines) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Left decorative sphere - positioned within bounds so blur is never clipped */}
        <div
          className="absolute top-12 -left-36 h-120 w-120 rounded-full transition-transform duration-500 ease-out will-change-transform sm:h-155 sm:w-155 lg:h-185 lg:w-185"
          style={{
            transform: `translate3d(${mousePos.x * 35}px, ${mousePos.y * 35}px, 0)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(circle at 65% 35%, rgba(255,195,222,0.5) 0%, rgba(222,195,255,0.4) 40%, rgba(162,198,255,0.45) 75%, transparent 100%)',
            }}
          />
        </div>

        {/* Right decorative sphere */}
        <div
          className="absolute top-16 -right-36 h-120 w-120 rounded-full transition-transform duration-500 ease-out will-change-transform sm:h-155 sm:w-155 lg:h-185 lg:w-185"
          style={{
            transform: `translate3d(${mousePos.x * -35}px, ${mousePos.y * -35}px, 0)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, rgba(255,185,215,0.45) 0%, rgba(220,195,255,0.4) 40%, rgba(160,215,255,0.5) 75%, transparent 100%)',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Headline and search */}
        <div className="mx-auto max-w-5xl space-y-7 text-center">
          <h2 className="text-[36px] font-semibold leading-[1.12] tracking-[-0.035em] text-[#1F1F1F] sm:text-[56px] lg:text-[64px]">
            All the tools that you need and a{' '}
            <br className="hidden sm:inline" />
            few more that we think{' '}
            <span className="bg-linear-to-r from-[#1A73E8] via-[#7C4DFF] to-[#E52592] bg-clip-text text-transparent">
              you&apos;ll love.
            </span>
          </h2>

          <div className="flex justify-center px-1 pb-6 pt-3">
            <div className="relative w-full max-w-2xl">
              <div className="flex items-center gap-3.5 rounded-full border border-white/80 bg-white/75 px-6 py-4 shadow-[0_2px_16px_rgba(75,85,140,0.07)] backdrop-blur-xl transition-all duration-200 hover:border-[#1A73E8]/50 hover:shadow-[0_6px_26px_rgba(26,115,232,0.12)]">
                <Search className="h-5 w-5 shrink-0 text-[#747775]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anything in Northstar Workspace..."
                  aria-label="Search Northstar Workspace"
                  className="w-full bg-transparent text-[15.5px] text-[#1F1F1F] placeholder-[#747775] focus:outline-none sm:text-[16px]"
                />
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
                  <path
                    d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C22 7.52 16.48 2 12 2Z"
                    fill="url(#gemini_sparkle_grad)"
                  />
                  <defs>
                    <linearGradient
                      id="gemini_sparkle_grad"
                      x1="2"
                      y1="2"
                      x2="22"
                      y2="22"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#1A73E8" />
                      <stop offset="0.33" stopColor="#EA4335" />
                      <stop offset="0.66" stopColor="#FBBC04" />
                      <stop offset="1" stopColor="#34A853" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 pb-16 pt-4 md:grid-cols-3 lg:gap-8">
          {/* Personalised AI */}
          <div className="group relative flex min-h-72.5 flex-col justify-between overflow-hidden rounded-4xl border border-white/80 bg-white/65 p-8 shadow-[0_4px_24px_rgba(65,75,130,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)] sm:p-9">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#FEEFC3] bg-[#FFF6EE]/90 p-3 shadow-xs">
                  <Image
                    src="/icons/northstar-premium-search.svg"
                    alt="AI Built In"
                    width={34}
                    height={34}
                    className="h-8.5 w-8.5 object-contain"
                  />
                </div>
                <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-[#1F1F1F] sm:text-[23px]">
                  Personalised AI built in
                </h3>
              </div>
              <p className="text-[15px] leading-[1.65] text-[#444746] sm:text-[16px]">
                Do your best work faster with intelligent tools that bring the{' '}
                <Link
                  href="/academics"
                  className="font-medium text-[#0B57D0] underline underline-offset-4 hover:text-[#0842A0]"
                >
                  context of your work
                </Link>{' '}
                to you.
              </p>
            </div>

            <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-32 overflow-hidden rounded-b-4xl">
              <svg
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
                className="h-full w-full object-cover opacity-70"
              >
                <defs>
                  <linearGradient id="roseWave" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#FFD8E6" stopOpacity="0.85" />
                    <stop offset="55%" stopColor="#FFE4D0" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFF0CE" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,75 C90,110 160,45 250,70 C320,90 365,55 400,60 L400,120 L0,120 Z"
                  fill="url(#roseWave)"
                />
              </svg>
              <div className="absolute inset-0 bg-linear-to-t from-[#FFEAE0]/35 to-transparent blur-md" />
            </div>
          </div>

          {/* Cloud collaboration */}
          <div className="group relative flex min-h-72.5 flex-col justify-between overflow-hidden rounded-4xl border border-white/80 bg-white/65 p-8 shadow-[0_4px_24px_rgba(65,75,130,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)] sm:p-9">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#E8EAED] bg-[#F6F4FE]/90 p-3 shadow-xs">
                  <svg viewBox="0 0 40 40" className="h-9 w-9">
                    <defs>
                      <linearGradient
                        id="cloudGrad"
                        x1="6"
                        y1="8"
                        x2="34"
                        y2="34"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#7C4DFF" />
                        <stop offset="1" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M30 16a8 8 0 0 0-15-2.5A6.5 6.5 0 0 0 8 20a6.5 6.5 0 0 0 6.5 6.5h15a5.5 5.5 0 0 0 .5-10.5z"
                      fill="url(#cloudGrad)"
                    />
                  </svg>
                </div>
                <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-[#1F1F1F] sm:text-[23px]">
                  Tools born in the cloud
                </h3>
              </div>
              <p className="text-[15px] leading-[1.65] text-[#444746] sm:text-[16px]">
                Collaborate in real time, from any device, across tools that are always up to date.
              </p>
            </div>

            <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-32 overflow-hidden rounded-b-4xl">
              <svg
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
                className="h-full w-full object-cover opacity-70"
              >
                <defs>
                  <linearGradient id="lilacWave" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#E6D3FF" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#D9E6FE" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#C6E2FF" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 C95,45 160,110 250,75 C315,50 360,85 400,65 L400,120 L0,120 Z"
                  fill="url(#lilacWave)"
                />
              </svg>
              <div className="absolute inset-0 bg-linear-to-t from-[#E0EAFF]/35 to-transparent blur-md" />
            </div>
          </div>

          {/* Enterprise security */}
          <div className="group relative flex min-h-72.5 flex-col justify-between overflow-hidden rounded-4xl border border-white/80 bg-white/65 p-8 shadow-[0_4px_24px_rgba(65,75,130,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)] sm:p-9">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#D2E3FC] bg-[#EEF5FE]/90 p-3 shadow-xs">
                  <svg viewBox="0 0 40 40" className="h-9 w-9">
                    <defs>
                      <linearGradient
                        id="shieldGrad"
                        x1="8"
                        y1="6"
                        x2="32"
                        y2="34"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#0B57D0" />
                        <stop offset="1" stopColor="#00A3FF" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 6l11 4.5v8.5c0 6.5-4.8 12.5-11 14-6.2-1.5-11-7.5-11-14v-8.5L20 6z"
                      fill="url(#shieldGrad)"
                    />
                    <path
                      d="M16 19l3 3 6-6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-[#1F1F1F] sm:text-[23px]">
                  Enterprise-grade security
                </h3>
              </div>
              <p className="text-[15px] leading-[1.65] text-[#444746] sm:text-[16px]">
                Protect your repositories, files, and milestone contracts with AI-powered security and compliance controls.
              </p>
            </div>

            <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-32 overflow-hidden rounded-b-4xl">
              <svg
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
                className="h-full w-full object-cover opacity-70"
              >
                <defs>
                  <linearGradient id="aquaWave" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#C4F5E8" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#CEECFF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#DDE8FF" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,65 C85,95 155,45 240,80 C310,110 360,60 400,70 L400,120 L0,120 Z"
                  fill="url(#aquaWave)"
                />
              </svg>
              <div className="absolute inset-0 bg-linear-to-t from-[#D6F2F5]/35 to-transparent blur-md" />
            </div>
          </div>
        </div>

        {/* Northstar Workspace app dock */}
        <div className="space-y-6 pt-2 text-center">
          <p className="text-[17px] font-medium text-[#1F1F1F] sm:text-[18px]">
            Northstar Workspace includes:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-2 sm:gap-14 lg:gap-16">
            {apps.map((app) => {
              const isHovered = hoveredApp === app.id;
              const isSelected = selectedAppId === app.id;

              return (
                <div
                  key={app.id}
                  onMouseEnter={() => setHoveredApp(app.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                  onClick={() => onSelectAppId?.(app.id)}
                  className="relative flex flex-col items-center"
                >
                  <Link
                    href={app.href}
                    className="group flex cursor-pointer flex-col items-center gap-3 transition-all duration-200"
                  >
                    <div
                      className={`flex h-22 w-22 items-center justify-center rounded-[28px] border border-white/80 bg-linear-to-b from-white/90 to-[#F8FAFD]/75 p-4 shadow-[0_4px_18px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:scale-105 sm:h-26 sm:w-26 ${
                        isHovered || isSelected
                          ? '-translate-y-1.5 border-[#1A73E8]/40 shadow-xl'
                          : ''
                      }`}
                      style={{
                        boxShadow:
                          isHovered || isSelected
                            ? `0 14px 32px ${app.glow}`
                            : undefined,
                      }}
                    >
                      <Image
                        src={app.iconSrc}
                        alt={app.name}
                        width={52}
                        height={52}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <span className="text-[15px] font-medium text-[#3C4043] transition-colors group-hover:text-[#0B57D0] sm:text-[16px]">
                      {app.name}
                    </span>
                  </Link>

                  {/* App hover card */}
                  <div
                    className={`pointer-events-none absolute bottom-full z-30 mb-3 w-56 rounded-2xl border border-white/80 bg-white/90 p-4 text-center shadow-[0_12px_36px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-200 ${
                      isHovered
                        ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                        : 'translate-y-2 scale-95 opacity-0'
                    }`}
                  >
                    <div className="mx-auto mb-2 h-12 w-12">
                      <Image
                        src={app.iconSrc}
                        alt={app.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <h4 className="text-[16px] font-semibold text-[#1F1F1F]">
                      {app.name}
                    </h4>

                    <p className="mt-1 text-[12.5px] leading-snug text-[#5F6368]">
                      {app.desc}
                    </p>

                    <div className="mt-3 border-t border-[#F1F3F4] pt-3">
                      <Link
                        href={app.href}
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-[#0B57D0] hover:underline"
                      >
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppShowcaseDock;