'use client';

import React from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { ChatApp } from '@/features/chat/ui/ChatApp';
import { ProductLandingPage } from '@/features/marketing/ui/ProductLandingPage';

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuthSession();

  if (isLoading) return null;
  if (isAuthenticated) return <ChatApp />;

  return (
    <ProductLandingPage
      appName="Circle"
      badgeTitle="Northstar Circle"
      headline="Real-time communication for campus teams"
      description="Connect students, study groups, and hackathon squads with fast WebSocket text channels, audio huddles, and doubt-clearing rooms."
      appRoute="/chat"
      appIconSrc="/icons/northstar-circle-icon.svg"
      themeColor="#7C4DFF"
      previewImage="/illustrations/chat-preview.webp"
      previewGreeting="Hello, Team."
      transcriptSample={{
        title: '#hackathon-squad • Live Audio Huddle',
        text: 'Alistair: Next.js edge runtime deployed. Smart India Hackathon frontend prototype is now synced with web sockets.',
      }}
      features={[
        'Domain-restricted campus community channels and branch discussions',
        'Low-latency voice rooms with screen-sharing and noise cancellation',
        'End-to-end institutional moderation and facultative logs',
      ]}
      tabs={[
        { id: 'channels', label: 'Channels & Rooms' },
        { id: 'moderation', label: 'Admin Moderation' },
      ]}
    >
      <section id="channels" className="min-h-[50vh] flex items-center justify-center bg-[#F8F9FA] border-t border-[#E8EAED]">
        <div className="text-center">
          <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">WebSocket Channels</h2>
          <p className="text-[#5F6368]">Showcase Discord-style UI here.</p>
        </div>
      </section>
      
      <section id="moderation" className="min-h-[50vh] flex items-center justify-center bg-white border-t border-[#E8EAED]">
        <div className="text-center">
          <h2 className="text-3xl text-[#1F1F1F] font-semibold mb-2">Automated Moderation</h2>
          <p className="text-[#5F6368]">Explain how toxic messages are blocked.</p>
        </div>
      </section>
    </ProductLandingPage>
  );
}