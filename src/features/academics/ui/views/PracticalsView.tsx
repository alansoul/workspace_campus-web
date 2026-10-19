'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAcademicsWorkspace } from '../../hooks/useAcademicsWorkspace';

export function PracticalsView() {
  const { practicals, markPracticalComplete, handleCreatePractical, isAdmin } =
    useAcademicsWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [labName, setLabName] = useState('Lab 1');
  const [faculty, setFaculty] = useState('');
  const [dueInDaysText, setDueInDaysText] = useState('Due in 3 days');
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    handleCreatePractical?.({
      title: title.trim(),
      subject: subject.trim(),
      labName,
      faculty: faculty.trim() || 'Course Instructor',
      dueInDaysText: dueInDaysText.trim() || 'Due in 3 days',
      tags: tags.length > 0 ? tags : ['Lab Manual', 'Source Code'],
    });

    setTitle('');
    setSubject('');
    setFaculty('');
    setTagInput('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Labs
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Practicals</h2>
          <p className="text-sm text-slate-500">
            Experiments, lab manuals and record submissions.
          </p>
        </div>

        {/* Admin-only Add Practical Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span> Add Practical
          </button>
        )}
      </div>

      {/* Practicals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {practicals.map((prac) => (
          <div
            key={prac.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-indigo-600">{prac.subject}</span>
                <span>{prac.dueInDaysText || prac.dueText || prac.dueDate || 'Due soon'}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">{prac.title}</h4>
              <p className="text-xs text-slate-500">
                {prac.labName || prac.lab || 'Lab 1'} {prac.faculty ? `· ${prac.faculty}` : ''}
              </p>

              {prac.tags && prac.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prac.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 hover:text-indigo-600 cursor-pointer flex items-center gap-1.5 font-medium transition-colors">
                📄 Lab manual
              </span>

              {/* Student Action: Toggle Completion Status */}
              <button
                type="button"
                onClick={() => markPracticalComplete(prac.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  prac.completed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                }`}
              >
                {prac.completed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </>
                ) : (
                  'Mark completed'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add Practical Modal */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Add Lab Practical</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experiment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4-Bit Ripple Carry Adder in Verilog HDL"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Digital Electronics - Exp 3"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lab / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 1"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty / Instructor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Manoj"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Timing</label>
                  <input
                    type="text"
                    placeholder="e.g. Due in 3 days"
                    value={dueInDaysText}
                    onChange={(e) => setDueInDaysText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deliverable Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verilog Code, Simulation Waveforms, FPGA Bitstream"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Create Practical
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}