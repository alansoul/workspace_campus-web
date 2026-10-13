'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowUpDown,
  Folder,
  Grid,
  List,
  ChevronDown,
  Clock,
  Sparkles,
  MoreVertical,
} from 'lucide-react';

export function AcademicsApp() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const templates = [
    { id: 't1', title: 'Operating Systems', sub: 'Unit 3 Syllabus', color: '#1A73E8' },
    { id: 't2', title: 'Distributed Systems', sub: 'Past Year Papers', color: '#7C4DFF' },
    { id: 't3', title: 'Database Engines', sub: 'Relational Calculus', color: '#34A853' },
    { id: 't4', title: 'Algorithms Design', sub: 'Dynamic Programming', color: '#EA4335' },
    { id: 't5', title: 'Lab Record', sub: 'Compiler Engineering', color: '#FBBC04' },
  ];

  const recentDocs = [
    {
      id: 'doc-1',
      title: 'Operating Systems • Unit 03 Consensus Review',
      category: 'Computer Science',
      openedAt: '4:19 PM',
      snippet: 'Two-phase commit consensus protocol, virtual memory paging algorithms, and deadlock mitigation.',
    },
    {
      id: 'doc-2',
      title: 'CS-402 Distributed Systems • Spring 2026',
      category: 'Past Exam Papers',
      openedAt: 'Oct 11, 2026',
      snippet: 'Consensus algorithms, Paxos vs Raft leader election, and vector clock synchronizations across shards.',
    },
    {
      id: 'doc-3',
      title: 'Design & Analysis of Algorithms • Unit 4 Notes',
      category: 'Lecture Notes',
      openedAt: 'Oct 8, 2026',
      snippet: 'Bellman-Ford single-source shortest path, Floyd-Warshall all-pairs shortest path dynamic programming matrix.',
    },
    {
      id: 'doc-4',
      title: 'Compiler Construction • AST & LLVM IR',
      category: 'Lab Record',
      openedAt: 'Oct 3, 2026',
      snippet: 'Lexical analysis using Flex, context-free grammars with Bison, and register allocation graph coloring.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1F1F1F] font-['Google_Sans',sans-serif] select-none flex flex-col">
      {/* 1. Template Gallery */}
      <section className="bg-[#F8F9FA] border-b border-[#E8EAED] py-6 sm:py-8 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] sm:text-[16px] font-medium text-[#1F1F1F]">
              Start a new academic document
            </h2>
            <button className="text-[13px] font-medium text-[#444746] hover:text-[#1F1F1F] flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-[#E8EAED] transition">
              <span>Template gallery</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5F6368]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {/* Blank Doc Card */}
            <div className="flex flex-col items-start gap-2 group cursor-pointer">
              <div className="w-full aspect-13/16 rounded-xl bg-white border border-[#DADCE0] group-hover:border-[#1A73E8] shadow-xs group-hover:shadow-md transition-all flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-10 h-10 transition-transform group-hover:scale-110">
                  <path fill="#EA4335" d="M24 6v14H10v8h14v14h8V28h14v-8H32V6z" />
                  <path fill="#4285F4" d="M32 20h14v8H32z" />
                  <path fill="#FBBC05" d="M10 20h14v8H10z" />
                  <path fill="#34A853" d="M24 28v14h8V28z" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-[#1F1F1F] group-hover:text-[#1A73E8]">
                Blank document
              </span>
            </div>

            {/* Templates */}
            {templates.map((tpl) => (
              <div key={tpl.id} className="flex flex-col items-start gap-2 group cursor-pointer">
                <div className="w-full aspect-13/16 rounded-xl bg-white border border-[#DADCE0] group-hover:border-[#1A73E8] shadow-xs group-hover:shadow-md transition-all p-3 flex flex-col justify-between">
                  <div className="space-y-1.5 w-full">
                    <div className="h-2 w-3/5 rounded-full" style={{ backgroundColor: tpl.color }} />
                    <div className="h-1.5 w-full bg-[#F1F3F4] rounded-full" />
                    <div className="h-1.5 w-4/5 bg-[#F1F3F4] rounded-full" />
                  </div>
                  <div className="space-y-1 opacity-70">
                    <div className="h-1 w-full bg-[#E8EAED] rounded-full" />
                    <div className="h-1 w-5/6 bg-[#E8EAED] rounded-full" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-medium text-[#1F1F1F] group-hover:text-[#1A73E8] leading-tight">
                    {tpl.title}
                  </p>
                  <p className="text-[11px] text-[#5F6368]">{tpl.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Recent Documents */}
      <section className="flex-1 py-6 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F3F4]">
            <h3 className="text-[15px] sm:text-[16px] font-medium text-[#1F1F1F]">
              Recent documents
            </h3>
            <div className="flex items-center gap-3 sm:gap-4 text-[#5F6368] text-[13px]">
              <span className="inline-flex items-center gap-1 cursor-pointer hover:text-[#1F1F1F]">
                Owned by anyone <ChevronDown className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-1.5 rounded-full hover:bg-[#F1F3F4]"
              >
                {viewMode === 'grid' ? <List className="w-4.5 h-4.5" /> : <Grid className="w-4.5 h-4.5" />}
              </button>
              <button type="button" className="p-1.5 rounded-full hover:bg-[#F1F3F4]">
                <ArrowUpDown className="w-4.5 h-4.5" />
              </button>
              <button type="button" className="p-1.5 rounded-full hover:bg-[#F1F3F4]">
                <Folder className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-2">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="group rounded-2xl border border-[#DADCE0] hover:border-[#1A73E8] bg-white shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div className="h-44 bg-[#F8FAFD] border-b border-[#F1F3F4] p-4 flex flex-col justify-between group-hover:bg-white transition-colors">
                  <div className="space-y-1.5 text-[11px] text-[#444746] font-mono leading-relaxed line-clamp-5">
                    <p className="font-semibold text-[#1F1F1F] font-sans">{doc.title}</p>
                    <p className="opacity-75">{doc.snippet}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#5F6368]">
                    <span className="bg-white border border-[#E8EAED] px-2 py-0.5 rounded-md font-medium">
                      {doc.category}
                    </span>
                    <span className="flex items-center gap-1 text-[#1A73E8]">
                      <Sparkles className="w-3 h-3" /> Synced
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Image
                      src="/icons/northstar-campus-icon.svg"
                      alt=""
                      width={18}
                      height={18}
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-medium text-[#1F1F1F] truncate group-hover:text-[#1A73E8]">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-[#70757A] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Opened {doc.openedAt}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="p-1 rounded-full hover:bg-[#F1F3F4] text-[#5F6368]">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}