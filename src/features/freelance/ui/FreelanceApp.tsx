// src/features/freelance/ui/FreelanceApp.tsx
'use client';

import React, { useState } from 'react';

export function FreelanceApp() {
  const [category, setCategory] = useState('All');
  const categories = ['All', 'Coding', 'Design', 'Content', 'Tutoring'];

  const sampleGigs = [
    { id: 1, title: 'Build Full-Stack Next.js Landing Page & Auth', budget: '₹8,000', client: 'Campus Club', proposals: 4, escrow: 'Secured' },
    { id: 2, title: 'Figma UI/UX Mockup for University Hackathon Portal', budget: '₹4,500', client: 'Tech Team', proposals: 7, escrow: 'Secured' },
    { id: 3, title: 'Python Web Scraping & Data Cleaning Script', budget: '₹3,000', client: 'Lab Research', proposals: 2, escrow: 'Secured' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>💼</span> Campus Freelance Marketplace
          </h1>
          <p className="text-sm text-slate-400 mt-1">Peer-to-peer student project marketplace with escrow protection</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition shadow">
          + Post a Project
        </button>
      </div>

      {/* Pill filter */}
      <div className="flex items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
              category === c ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleGigs.map((gig) => (
          <div key={gig.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-emerald-400 text-base">{gig.budget}</span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  🛡️ {gig.escrow}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm line-clamp-2">{gig.title}</h3>
              <p className="text-xs text-slate-500 mt-2">Posted by {gig.client}</p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">{gig.proposals} proposals</span>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 transition">
                Submit Bid
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}