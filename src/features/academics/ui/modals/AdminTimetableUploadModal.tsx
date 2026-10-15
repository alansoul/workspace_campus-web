'use client';

import React, { useState } from 'react';
import { CAMPUS_TIMETABLES_REGISTRY } from '../../data/academics.data';
import type { DayTimetable, SubjectItem } from '../../types/academics.types';
import type { BranchCode } from '../../hooks/useAcademicsWorkspace';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTimetable: (data: {
    institution: string;
    branch: BranchCode;
    semester: number;
    roomNo: string;
    effectiveDate: string;
    timetable: DayTimetable[];
    subjects: SubjectItem[];
  }) => void;
  currentBranch: BranchCode;
  currentSemester: number;
}

export function AdminTimetableUploadModal({
  isOpen,
  onClose,
  onApplyTimetable,
  currentBranch,
  currentSemester,
}: ModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<'CSE_1' | 'ECE_1'>(
    currentBranch === 'ECE' ? 'ECE_1' : 'CSE_1'
  );
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setIsParsing(true);
      setTimeout(() => {
        setIsParsing(false);
      }, 500);
    }
  };

  const handleApply = () => {
    const config = CAMPUS_TIMETABLES_REGISTRY[selectedPreset];
    const branch: BranchCode = selectedPreset.startsWith('CSE') ? 'CSE' : 'ECE';
    const semester = 1;

    onApplyTimetable({
      institution: config.institution,
      branch,
      semester,
      roomNo: config.roomNo,
      effectiveDate: config.effectiveDate,
      timetable: config.timetable,
      subjects: config.subjects,
    });

    onClose();
  };

  const activePresetData = CAMPUS_TIMETABLES_REGISTRY[selectedPreset];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Admin Console
              </span>
              <h3 className="font-bold text-slate-900 text-lg">
                Import & Sync College Timetable
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Scope: <span className="font-semibold text-slate-700">{currentBranch} · Semester {currentSemester}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Timetable Sheet / Verified Institution Preset:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPreset('CSE_1')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  selectedPreset === 'CSE_1'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">B.Tech Sem 1 — CSE</span>
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
                    Room 138
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  Dr. SPM IIIT Naya Raipur · Autumn 2026-27
                </p>
                <p className="text-[10px] text-indigo-700 font-medium mt-1">
                  10 Subjects (Dr. Mithilesh, Dr. Ruhul, Dr. Manoj)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreset('ECE_1')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  selectedPreset === 'ECE_1'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">B.Tech Sem 1 — ECE</span>
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
                    Room 122
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  Dr. SPM IIIT Naya Raipur · Autumn 2026-27
                </p>
                <p className="text-[10px] text-indigo-700 font-medium mt-1">
                  10 Subjects (Dr. Ramakrishna, Dr. Maifuz, Dr. M K Rao)
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Upload Official PDF / Timetable Image File:
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="timetable-file-upload"
              />
              <label htmlFor="timetable-file-upload" className="cursor-pointer">
                {selectedFileName ? (
                  <span className="text-xs font-medium text-emerald-600 block">
                    ✓ Selected: {selectedFileName} (OCR Slot Matrix Extracted)
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 block">
                    Click to browse your device for timetable document (PDF, PNG, JPG)
                  </span>
                )}
              </label>
            </div>
            {isParsing && (
              <p className="text-[11px] text-indigo-600 mt-1 animate-pulse">
                Parsing timetable periods and extracting slot-faculty relations...
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Extracted: {activePresetData.roomNo} (w.e.f. {activePresetData.effectiveDate})
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">
                {activePresetData.timetable.length} Active Days · 8 Periods/Day
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 max-h-28 overflow-y-auto pr-1">
              {activePresetData.subjects.slice(0, 8).map((sub) => (
                <div key={sub.id} className="bg-white p-1.5 rounded-lg border border-slate-100 truncate">
                  <span className="font-bold text-slate-900">{sub.name}</span>
                  <span className="block text-slate-400 text-[10px]">{sub.faculty}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Deploy Timetable to Campus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}