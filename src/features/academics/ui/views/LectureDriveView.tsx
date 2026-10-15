'use client';

import React from 'react';
import { DriveFile } from '../../types/academics.types';
import { Icons } from '../AcademicsIcons';

interface DriveProps {
  files: DriveFile[];
  onToggleStar: (id: string) => void;
}

export function LectureDriveView({ files, onToggleStar }: DriveProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Semester 3 · Shared with your class
          </p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Lecture drive
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Everything subject-wise: lectures, notes, assignments, practicals, papers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50">
            + New folder
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-xs">
            ↑ Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Files Table */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {file.subject} · {file.category} · {file.size} · {file.uploadDate} · {file.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleStar(file.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg"
                  >
                    <Icons.Star
                      className={`w-4 h-4 ${file.isStarred ? 'text-amber-400 fill-amber-400' : ''}`}
                    />
                  </button>
                  <button className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drive Info Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recently opened
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="truncate hover:text-indigo-600 cursor-pointer">
                DS — Graphs & trees.pdf
              </li>
              <li className="truncate hover:text-indigo-600 cursor-pointer">
                DS — Unit 3 handwritten notes.pdf
              </li>
              <li className="truncate hover:text-indigo-600 cursor-pointer">
                DS — Midsem 2023 paper.pdf
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}