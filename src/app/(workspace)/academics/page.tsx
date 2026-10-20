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

  // 1. Logged out -> Show marketing showcase landing page
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
        previewVideo="/videos/campus.mp4"
        previewGreeting="Hello, Scholar."
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
      />
    );
  }

  // 2. Logged in as Personal Account (INDIVIDUAL / Unlinked Gmail) -> Access Lock Screen
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

  // 3. Logged in with Verified Institutional Email / Linked Campus -> Render Full Student Portal
  return <AcademicsApp />;
}