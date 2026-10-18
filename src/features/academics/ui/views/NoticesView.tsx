// campus-web/src/features/academics/ui/views/NoticesView.tsx
'use client';

import React, { useState } from 'react';
import { useAcademicsWorkspace } from '../../hooks/useAcademicsWorkspace';
import type { CampusNotice } from '../../types/academics.types';

interface NoticesViewProps {
  notices?: CampusNotice[];
  onMarkAsRead?: (id: string) => void;
  onCreateNotice?: (notice: {
    title: string;
    category?: string;
    summary: string;
    isImportant?: boolean;
  }) => void;
  onImportFromWhatsApp?: (text: string, type: 'NOTICE') => void;
}

export function NoticesView({
  notices: propNotices,
  onMarkAsRead: propOnMarkAsRead,
  onCreateNotice: propOnCreateNotice,
  onImportFromWhatsApp: propOnImportFromWhatsApp,
}: NoticesViewProps = {}) {
  // Use workspace fallback if props are not explicitly supplied
  const workspace = useAcademicsWorkspace();

  const notices = propNotices ?? workspace.notices;
  const markNoticeAsRead = propOnMarkAsRead ?? workspace.markNoticeAsRead;
  const handleCreateNotice = propOnCreateNotice ?? workspace.handleCreateNotice;
  const importFromWhatsApp = propOnImportFromWhatsApp ?? workspace.importFromWhatsApp;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'WHATSAPP'>('WHATSAPP');

  // Manual Notice State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Circular');
  const [summary, setSummary] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  // WhatsApp Raw Text State
  const [rawText, setRawText] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    handleCreateNotice({
      title: title.trim(),
      category,
      summary: summary.trim(),
      isImportant,
    });

    setTitle('');
    setSummary('');
    setIsModalOpen(false);
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    importFromWhatsApp(rawText.trim(), 'NOTICE');
    setRawText('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Notice Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Notice Board
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Campus Notices</h2>
          <p className="text-sm text-slate-500">
            Official announcements, academic circulars, and ingested university messages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span className="text-base font-bold leading-none">+</span> Post Notice / WhatsApp
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No notices found. When new circulars arrive, they will appear here automatically.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => markNoticeAsRead(notice.id)}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer hover:border-indigo-300 ${
                notice.isUnread ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {notice.category || 'Academic'}
                  </span>
                  {notice.isImportant && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                      Important
                    </span>
                  )}
                  {notice.isUnread && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">{notice.dateStr}</span>
              </div>

              <h3 className="font-semibold text-slate-900 text-base mb-1">{notice.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{notice.summary}</p>
            </div>
          ))
        )}
      </div>

      {/* Modal with WhatsApp Ingestion & Manual Creation Tabs */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Add Campus Notice</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Ingestion Mode Toggle */}
            <div className="flex border-b border-slate-100 px-5 pt-3 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('WHATSAPP')}
                className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'WHATSAPP'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                💬 Paste WhatsApp Forward
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MANUAL')}
                className={`pb-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'MANUAL'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                ✍️ Manual Notice
              </button>
            </div>

            {activeTab === 'WHATSAPP' ? (
              <form onSubmit={handleWhatsAppSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Paste raw text from WhatsApp group forward
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Paste the announcement sent by CR, club head, or senior..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    The title, summary, and date will be parsed automatically.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Ingest Announcement
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. End-Sem Exam Hall Tickets Distributed"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Circular">Circular</option>
                    <option value="Examination">Examination</option>
                    <option value="Club">Club</option>
                    <option value="Hostel">Hostel</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Summary</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed notice description..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isImportant" className="text-xs text-slate-700 cursor-pointer">
                    Mark as Important
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Post Notice
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}