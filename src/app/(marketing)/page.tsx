'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketingNavbar } from '@/features/marketing/ui/MarketingNavbar';
import { HeroSection } from '@/features/marketing/ui/HeroSection';
import { FloatingSegmentBar } from '@/features/marketing/ui/FloatingSegmentBar';
import { AppShowcaseDock } from '@/features/marketing/ui/AppShowcaseDock';
import { InteractiveVideoShowcase } from '@/features/marketing/ui/InteractiveVideoShowcase';
import { InteractivePreview } from '@/features/marketing/ui/InteractivePreview';
import { PricingMatrix } from '@/features/marketing/ui/PricingMatrix';
import { FaqSection } from '@/features/marketing/ui/FaqSection';
import { MegaFooter } from '@/features/marketing/ui/MegaFooter';

const SECTION_IDS = ['included', 'features', 'pricing', 'faq'] as const;
const NAVBAR_OFFSET = 130;
const ACTIVATION_OFFSET = 194;
const SCROLL_FALLBACK_MS = 1500;

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<string>('included');
  const [selectedAppId, setSelectedAppId] = useState('campus');

  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearScrollLock = useCallback(() => {
    isProgrammaticScroll.current = false;
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    function updateActiveSection() {
      if (isProgrammaticScroll.current) return;

      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        let currentSection: string = SECTION_IDS[0];

        for (const id of SECTION_IDS) {
          const element = document.getElementById(id);
          if (
            element &&
            element.getBoundingClientRect().top <= ACTIVATION_OFFSET
          ) {
            currentSection = id;
          }
        }

        setActiveTab((previous) =>
          previous === currentSection ? previous : currentSection
        );
      });
    }

    function handleScrollEnd() {
      if (isProgrammaticScroll.current) {
        clearScrollLock();
        updateActiveSection();
      }
    }

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    window.addEventListener('scrollend', handleScrollEnd);

    updateActiveSection();

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      window.removeEventListener('scrollend', handleScrollEnd);

      cancelAnimationFrame(animationFrame);
      clearScrollLock();
    };
  }, [clearScrollLock]);

  const scrollToSection = useCallback(
    (id: string) => {
      if (!SECTION_IDS.includes(id as (typeof SECTION_IDS)[number])) return;

      const element = document.getElementById(id);
      if (!element) return;

      setActiveTab(id);

      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }

      isProgrammaticScroll.current = true;

      const targetY =
        element.getBoundingClientRect().top +
        window.scrollY -
        NAVBAR_OFFSET;

      const destination = Math.max(
        0,
        Math.min(
          targetY,
          document.documentElement.scrollHeight - window.innerHeight
        )
      );

      if (Math.abs(window.scrollY - destination) < 2) {
        clearScrollLock();
        return;
      }

      window.scrollTo({
        top: destination,
        behavior: 'smooth',
      });

      scrollTimeoutRef.current = setTimeout(() => {
        clearScrollLock();
      }, SCROLL_FALLBACK_MS);
    },
    [clearScrollLock]
  );

  return (
    <div className="marketing-page relative min-h-screen bg-[#f8f6ff] text-[#1F1F1F] selection:bg-[#E8F0FE] selection:text-[#0B57D0]">
      <MarketingNavbar onScrollTo={scrollToSection} />

      {/* ========================================================================= */}
      {/* GLOBAL CONTINUOUS AMBIENT LIGHT CANVAS (Exact Pastel Palette)            */}
      {/* ========================================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden -z-10"
        style={{ height: '3600px' }}
      >
        {/* 1. Hero Left Glow (Sky Blue #d8eaff) */}
        <div className="absolute top-10 left-[-12%] w-[58vw] max-w-212.5 h-162.5 rounded-full bg-[#d8eaff]/75 blur-[130px]" />

        {/* 2. Hero Right Glow (Lavender Violet #f5ddff) */}
        <div className="absolute top-20 right-[-12%] w-[54vw] max-w-200 h-175 rounded-full bg-[#f5ddff]/70 blur-[135px]" />

        {/* 3. Transition behind Floating Segment Bar (Soft Lilac #e6ddff) */}
        <div className="absolute top-175 left-[15%] w-[70vw] max-w-237.5 h-187.5 rounded-full bg-[#e6ddff]/55 blur-[140px]" />

        {/* 4. Carousel Left (Sky Blue #d8eaff) */}
        <div className="absolute top-337.5 left-[-10%] w-[50vw] max-w-187.5 h-175 rounded-full bg-[#d8eaff]/65 blur-[130px]" />

        {/* 5. Carousel Right (Rose Pink #fff0f7) */}
        <div className="absolute top-362.5 right-[-10%] w-[50vw] max-w-187.5 h-175 rounded-full bg-[#fff0f7]/75 blur-[135px]" />

        {/* 6. Smooth Glow flowing through "One Connected Workspace" */}
        <div className="absolute top-[2100px] left-[15%] w-[70vw] max-w-237.5 h-187.5 rounded-full bg-[#f0e9ff]/60 blur-[140px]" />
        <div className="absolute top-[2250px] right-[-5%] w-[45vw] max-w-175 h-162.5 rounded-full bg-[#d8eaff]/50 blur-[130px]" />

        {/* Smooth natural fade into pure white for Pricing & FAQ */}
        <div className="absolute top-[2900px] inset-x-0 h-150 bg-linear-to-b from-transparent to-[#ffffff]" />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Sticky Segmented Bar: Floats seamlessly over the ambient light */}
      <FloatingSegmentBar
        activeTab={activeTab}
        onSelect={scrollToSection}
      />

      {/* Included: App Showcase Dock */}
      <section id="included" className="scroll-mt-32.5">
        <AppShowcaseDock
          selectedAppId={selectedAppId}
          onSelectAppId={setSelectedAppId}
        />
      </section>

      {/* Premium features: Carousel & 3D Cards */}
      <section id="features" className="scroll-mt-32.5">
        <InteractiveVideoShowcase />
        <InteractivePreview />
      </section>

      {/* Pricing: Clean white background */}
      <section id="pricing" className="scroll-mt-32.5 ">
        <PricingMatrix />
      </section>

      {/* FAQ: Clean white background */}                                                                  
      <section id="faq" className="scroll-mt-32.5 ">
        <FaqSection />
      </section>

      <MegaFooter />
    </div>
  );
}