// src/features/academics/ui/AcademicsApp.tsx
'use client';

import React, { useState } from 'react';

export function AcademicsApp() {
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const branches = ['CSE', 'DSAI', 'ECE', 'MECH'];

  const sampleNotes = [
    { id: 1, title: 'Data Structures & Algorithms Comprehensive Notes', code: 'CS201', sem: 'Sem 3', author: 'Prof. Sharma', downloads: 342 },
    { id: 2, title: 'Operating Systems Previous Year Questions (2020-2024)', code: 'CS204', sem: 'Sem 4', author: 'Alan S.', downloads: 580 },
    { id: 3, title: 'Discrete Mathematics Hand-written Tutorial Sheets', code: 'MA201', sem: 'Sem 3', author: 'Neha G.', downloads: 194 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📚</span> Academic Repository & Drive
          </h1>
          <p className="text-sm text-slate-400 mt-1">Institutional syllabus notes, lecture slides, and question papers</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition shadow">
          + Upload Study Material
        </button>
      </div>

      {/* Branch selector */}
      <div className="flex items-center gap-2">
        {branches.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBranch(b)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedBranch === b ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleNotes.map((note) => (
          <div key={note.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] text-blue-400 font-mono mb-2">
                <span>{note.code}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{note.sem}</span>
              </div>
              <h3 className="font-semibold text-white text-sm line-clamp-2">{note.title}</h3>
              <p className="text-xs text-slate-500 mt-2">By {note.author}</p>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">📥 {note.downloads} downloads</span>
              <button className="text-xs font-medium text-blue-400 hover:text-blue-300">Download PDF →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}