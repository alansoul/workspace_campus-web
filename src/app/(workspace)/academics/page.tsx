'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { AcademicsApp } from '@/features/academics/ui/AcademicsApp';
import { ProductLandingPage } from '@/features/marketing/ui/ProductLandingPage';

export default function AcademicsPage() {
  const { user, isAuthenticated, isLoading } = useAuthSession();
  const router = useRouter();

  // 🎓 User is INSTITUTIONAL if they signed in with a campus domain OR linked their campus email
  const isInstitutional = Boolean(
    user?.universityId || user?.accountType === 'INSTITUTIONAL',
  );

  useEffect(() => {
    // If logged in as Personal Gmail without campus link, send to dashboard to link campus
    if (!isLoading && isAuthenticated && !isInstitutional) {
      router.replace('/dashboard?modal=link-campus&from=academics');
    }
  }, [isLoading, isAuthenticated, isInstitutional, router]);

  if (isLoading) return null;

  // 1. Logged out -> Show marketing landing page
  if (!isAuthenticated) {
    return (
      <ProductLandingPage
        appName="Campus"
        badgeTitle="Northstar Campus"
        headline="Academic intelligence for university study"
        description="Access shared department repositories, past-year exam questions, and lecture syllabus materials with real-time Gemini AI copilot synthesis."
        appRoute="/academics"
        appIconSrc="/icons/northstar-campus-icon.svg"
        themeColor="#1A73E8"
        previewImage="/illustrations/hero-preview-dark.webp"
        previewGreeting="Hello, Scholar."
        transcriptSample={{
          title: 'Operating Systems • Unit 03',
          text: 'Two-phase commit ensures consensus across isolated node ledgers. Gemini generated 12 exam review questions from this syllabus.',
        }}
        features={[
          'Institutional syllabus synchronization across engineering branches',
          'Gemini-powered lecture note summarization and flashcards',
          'Free individual access for verified university student domains',
        ]}
        tabs={[
          { id: 'use-cases', label: 'Use cases' },
          { id: 'features', label: 'Features' },
          { id: 'faq', label: 'FAQ' },
        ]}
      >
        <section
          id="use-cases"
          className="min-h-[50vh] flex items-center justify-center bg-[#F8F9FA] border-t border-[#E8EAED]"
        >
          <div className="text-center">
            <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">
              Academics Use Cases
            </h2>
            <p className="text-[#5F6368]">
              Content specifically designed for students and professors.
            </p>
          </div>
        </section>

        <section
          id="features"
          className="min-h-[50vh] flex items-center justify-center bg-white border-t border-[#E8EAED]"
        >
          <div className="text-center">
            <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">
              Drive & Notes Features
            </h2>
            <p className="text-[#5F6368]">
              Details about PDF uploads and Gemini AI integration.
            </p>
          </div>
        </section>

        <section
          id="faq"
          className="min-h-[50vh] flex items-center justify-center bg-[#F8F9FA] border-t border-[#E8EAED]"
        >
          <div className="text-center">
            <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">
              Academics FAQ
            </h2>
            <p className="text-[#5F6368]">
              Common questions about university domain limits.
            </p>
          </div>
        </section>
      </ProductLandingPage>
    );
  }

  // 2. Logged in as Personal Account (INDIVIDUAL / Unlinked Gmail) -> Lock access
  if (!isInstitutional) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white font-['Google_Sans',sans-serif]">
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
            🎓
          </div>
          <h1 className="text-2xl font-bold">Academics is Campus-Only</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            You are signed in with a personal account. To access shared campus notes and course repositories, please link your official university email address.
          </p>
          <button
            type="button"
            onClick={() =>
              router.push('/dashboard?modal=link-campus&from=academics')
            }
            className="px-6 py-3 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs cursor-pointer"
          >
            Link Campus Email on Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 3. Logged in with Verified Institutional Email / Linked Campus -> Render App
  return <AcademicsApp />;
}