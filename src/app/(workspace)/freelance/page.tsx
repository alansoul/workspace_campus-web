'use client';

import React from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { FreelanceApp } from '@/features/freelance/ui/FreelanceApp';
import { ProductLandingPage } from '@/features/marketing/ui/ProductLandingPage';

export default function FreelancePage() {
  const { isAuthenticated, isLoading } = useAuthSession();

  if (isLoading) return null;
  if (isAuthenticated) return <FreelanceApp />;

  return (
    <ProductLandingPage
      appName="Workflow"
      badgeTitle="Northstar Workflow"
      headline="Student freelance marketplace & milestone escrow"
      description="Monetize university engineering and design talent. Deliver production code, review milestones, and receive guaranteed escrow payouts without disputes."
      appRoute="/freelance"
      appIconSrc="/icons/northstar-workflow-icon.svg"
      themeColor="#137333"
      previewVideo="/videos/workflow.mp4"
      previewGreeting="Hello, Creator."
      features={[
        'Automated milestone escrow transaction locking and dispute arbitration',
        'Direct project bids for verified student developers and designers',
        'Transparent campus ledger guarantees with 0% hidden platform take rates',
      ]}
      tabs={[
        { id: 'escrow', label: 'Escrow Security' },
        { id: 'bidding', label: 'Bidding System' },
        { id: 'payouts', label: 'Payouts' },
      ]}
    >
      <section id="escrow" className="min-h-[50vh] flex items-center justify-center bg-[#F8F9FA] border-t border-[#E8EAED]">
        <div className="text-center">
          <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">How Escrow Works</h2>
          <p className="text-[#5F6368]">Visual diagram of money locked in vault.</p>
        </div>
      </section>

      <section id="bidding" className="min-h-[50vh] flex items-center justify-center bg-white border-t border-[#E8EAED]">
        <div className="text-center">
          <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">Bidding & Proposals</h2>
          <p className="text-[#5F6368]">Showcase the UI for submitting a gig proposal.</p>
        </div>
      </section>

      <section id="payouts" className="min-h-[50vh] flex items-center justify-center bg-[#F8F9FA] border-t border-[#E8EAED]">
        <div className="text-center">
          <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">Secure Payouts</h2>
          <p className="text-[#5F6368]">Explain how students withdraw to their bank accounts.</p>
        </div>
      </section>
    </ProductLandingPage>
  );
}