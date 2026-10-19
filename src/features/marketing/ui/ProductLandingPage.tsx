'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  Play,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { MarketingNavbar } from './MarketingNavbar';
import { MegaFooter } from './MegaFooter';

export interface FloatingTab {
  id: string;
  label: string;
}

export interface ProductLandingPageProps {
  appName: string;
  badgeTitle: string;
  headline: string;
  description: string;
  appRoute: string;
  appIconSrc: string;
  themeColor: string;
  previewImage?: string;
  previewVideo?: string;
  previewGreeting: string;
  transcriptSample: {
    title: string;
    text: string;
  };
  features: string[];
  tabs: FloatingTab[];
  children?: React.ReactNode;
}

export function ProductLandingPage({
  appName,
  badgeTitle,
  headline,
  description,
  appRoute,
  appIconSrc,
  themeColor,
  previewImage,
  previewVideo,
  previewGreeting,
  transcriptSample,
  features,
  tabs,
  children,
}: ProductLandingPageProps) {
  const safeTabs = tabs || [];
  const [activeTab, setActiveTab] = useState(safeTabs[0]?.id || '');
  const loginUrl = `/login?redirect=${encodeURIComponent(appRoute)}`;

  const handleScrollTo = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      // Offset = navbar (64px) + sticky bar (~52px)
      const yOffset = -120;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] flex flex-col font-['Google_Sans',sans-serif] select-none relative">
      {/* 1. Universal Header (z-50 so it stays above the sticky bar) */}
      <MarketingNavbar onScrollTo={handleScrollTo} />

      <main className="flex-1">
        {/* 2. Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 sm:pt-14 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8EAED] shadow-xs flex items-center justify-center p-2 shrink-0">
                <Image
                  src={appIconSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[22px] font-semibold tracking-[-0.02em] text-[#1F1F1F]">
                {badgeTitle}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-semibold text-[#1F1F1F] tracking-[-0.035em] leading-[1.12]">
              {headline}
            </h1>

            <p className="text-[17px] sm:text-[18px] text-[#444746] leading-[1.55] max-w-lg font-normal">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/setup"
                className="px-7 py-3.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-[15px] transition shadow-xs"
              >
                Try {appName} for work
              </Link>

              <Link
                href={loginUrl}
                className="px-7 py-3.5 rounded-full border border-[#DADCE0] hover:border-[#BDC1C6] hover:bg-[#F8FAFD] text-[#0B57D0] font-medium text-[15px] transition"
              >
                Sign in to {appName}
              </Link>
            </div>

            <div className="pt-4 border-t border-[#F1F3F4] space-y-2 text-[13px] text-[#5F6368]">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check
                    className="w-4 h-4 text-[#137333] shrink-0"
                    strokeWidth={2.2}
                  />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 relative flex justify-center">
            <div className="absolute -inset-4 bg-linear-to-tr from-[#E8F0FE]/70 via-[#F3E8FD]/50 to-[#FFE4EC]/40 blur-3xl -z-10 rounded-3xl" />

            <div className="w-full max-w-xl space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-[14px] text-[#444746]">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    ▶
                  </div>
                  <span>
                    <strong className="text-[#1F1F1F] font-semibold">
                      {previewGreeting}
                    </strong>{' '}
                    Let&apos;s start collaborating.
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5">
                  <div className="w-9 h-7 rounded-lg bg-[#E8F0FE] border border-[#D2E3FC] flex items-center justify-center text-[#1A73E8]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-9 h-7 rounded-lg bg-[#F8FAFD] border border-[#DADCE0] overflow-hidden">
                    <Image
                      src={appIconSrc}
                      alt=""
                      width={20}
                      height={20}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                </div>
              </div>

              <div className="relative rounded-[28px] overflow-hidden border border-[#DADCE0] bg-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
                <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                  {previewVideo ? (
                    <video
                      src={previewVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : previewImage ? (
                    <>
                      <Image
                        src={previewImage}
                        alt={appName}
                        fill
                        unoptimized
                        className="object-cover object-center"
                        priority
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/95 text-[#1A73E8] shadow-lg flex items-center justify-center backdrop-blur-xs transition hover:scale-105">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                      {appName} Preview
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 sm:left-6 z-20 w-[84%] max-w-sm rounded-2xl bg-white/98 backdrop-blur-md border border-[#DADCE0] shadow-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F1F3F4] pb-2 text-[11px] text-[#5F6368]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#1A73E8]" />
                      <span className="font-semibold text-[#1F1F1F]">
                        {transcriptSample.title}
                      </span>
                    </div>
                    <span className="bg-[#E8F0FE] text-[#0B57D0] px-1.5 py-0.5 rounded-sm font-medium">
                      AI Active
                    </span>
                  </div>

                  <p className="text-[12px] text-[#444746] leading-relaxed">
                    {transcriptSample.text}
                  </p>

                  <div className="pt-1 flex items-center gap-3 text-[11px] font-medium text-[#1A73E8]">
                    <span className="cursor-pointer hover:underline flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Summarize
                    </span>
                    <span className="text-[#DADCE0]">•</span>
                    <span className="cursor-pointer hover:underline flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" /> Insert Context
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. STICKY TOP floating bar — locks under navbar on scroll */}
        {safeTabs.length > 0 && (
          <div
            className="
              sticky top-16 z-40
              flex justify-center
              px-2 py-3
              pointer-events-none
              bg-white/80 backdrop-blur-sm
              border-b border-[#E8EAED]/60
            "
          >
            <nav
              aria-label="Section navigation"
              className="
                pointer-events-auto
                bg-white/95 border border-[#DADCE0]
                rounded-full p-1.5
                shadow-[0_6px_24px_rgba(0,0,0,0.08)]
                flex items-center gap-1
                backdrop-blur-md
                max-w-[calc(100vw-32px)] overflow-x-auto
                scrollbar-none [&::-webkit-scrollbar]:hidden
              "
            >
              {safeTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleScrollTo(tab.id)}
                    className={`
                      px-4 sm:px-6 py-2 rounded-full
                      text-[13px] sm:text-[13.5px]
                      whitespace-nowrap transition-all duration-200
                      cursor-pointer shrink-0
                      ${
                        isActive
                          ? 'bg-[#E8F0FE] text-[#0B57D0] font-semibold'
                          : 'text-[#444746] hover:text-[#1F1F1F] hover:bg-[#F8FAFD]'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* 4. Scrollable sections from each product page */}
        {children}
      </main>

      {/* 5. Universal Footer */}
      <MegaFooter />
    </div>
  );
}