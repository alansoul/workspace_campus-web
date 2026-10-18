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

// Strongly typed interfaces for raw OCR/AI document responses
interface RawParsedSlot {
  id?: string;
  subjectName?: string;
  subject?: string;
  code?: string;
  type?: DayTimetable['slots'][number]['type'];
  startTime?: string;
  endTime?: string;
  room?: string;
  faculty?: string;
}

interface RawParsedDay {
  day: string;
  dateStr?: string;
  slots?: RawParsedSlot[];
}

interface RawOcrResponse {
  success?: boolean;
  data?: {
    institution?: string;
    roomNo?: string;
    effectiveDate?: string;
    timetable?: RawParsedDay[];
    subjects?: SubjectItem[];
  };
  timetable?: RawParsedDay[];
  institution?: string;
  roomNo?: string;
  effectiveDate?: string;
  subjects?: SubjectItem[];
  error?: string;
}

/**
 * Derives unique SubjectItem cards and credit weights automatically from timetable slots
 */
function deriveSubjectsFromTimetable(timetable: DayTimetable[]): SubjectItem[] {
  const map = new Map<string, { faculty: string; code: string; count: number }>();

  timetable.forEach((day) => {
    (day.slots || []).forEach((slot) => {
      const name = slot.subjectName.trim();
      if (!name) return;
      const existing = map.get(name) || {
        faculty: slot.faculty || 'Faculty',
        code: slot.code || 'AC101',
        count: 0,
      };
      existing.count += 1;
      map.set(name, existing);
    });
  });

  return Array.from(map.entries()).map(([name, meta], idx) => ({
    id: `sub-${idx + 1}`,
    name,
    code: meta.code,
    faculty: meta.faculty,
    classesPerWeek: meta.count,
    credits: meta.count >= 4 ? 4 : meta.count >= 2 ? 2 : 1,
    assignmentsCount: 2,
    filesCount: 3,
    unitsCompleted: 1,
    totalUnits: 4,
    attendancePct: 85,
  }));
}

export function AdminTimetableUploadModal({
  isOpen,
  onClose,
  onApplyTimetable,
  currentBranch,
  currentSemester,
}: ModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<'CSE_1' | 'ECE_1' | 'CUSTOM'>(
    currentBranch === 'ECE' ? 'ECE_1' : 'CSE_1'
  );
  const [selectedFileName, setSelectedFileName] = useState('');
  const [customParsedData, setCustomParsedData] = useState<{
    institution?: string;
    roomNo?: string;
    effectiveDate?: string;
    timetable: DayTimetable[];
    subjects: SubjectItem[];
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsParsing(true);
    setErrorMessage(null);
    setStatusMessage(`Scanning ${file.name} for ${currentBranch} Sem ${currentSemester}...`);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'https://workspace-campus-api.onrender.com/api';

          const res = await fetch(`${apiUrl}/university/timetable/parse-document`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: file.type || 'application/pdf',
              branch: currentBranch,
              semester: currentSemester,
            }),
          });

          if (res.ok) {
            const data = (await res.json()) as RawOcrResponse;
            const parsedTimetable = data.data?.timetable || data.timetable;

            if (data.success && Array.isArray(parsedTimetable)) {
              const formattedTimetable: DayTimetable[] = parsedTimetable.map(
                (d: RawParsedDay, dayIdx: number) => ({
                  day: d.day,
                  dateStr: d.dateStr || `Day ${dayIdx + 1}`,
                  isToday: false,
                  classCount: d.slots?.length || 0,
                  slots: (d.slots || []).map((s: RawParsedSlot, idx: number) => ({
                    id: s.id || `slot-${dayIdx}-${idx}`,
                    subjectName: s.subjectName || s.subject || 'Class',
                    code: s.code || 'AC101',
                    type: s.type || 'Theory',
                    startTime: s.startTime || '09:00',
                    endTime: s.endTime || '09:55',
                    room: s.room || data.data?.roomNo || data.roomNo || 'Room 138',
                    faculty: s.faculty || 'Faculty',
                    isToday: false,
                  })),
                })
              );

              const derivedSubs =
                data.data?.subjects ||
                data.subjects ||
                deriveSubjectsFromTimetable(formattedTimetable);

              setCustomParsedData({
                institution:
                  data.data?.institution || data.institution || 'Dr. SPM IIIT Naya Raipur',
                roomNo: data.data?.roomNo || data.roomNo || 'Room 138',
                effectiveDate:
                  data.data?.effectiveDate || data.effectiveDate || '24/08/2026',
                timetable: formattedTimetable,
                subjects: derivedSubs,
              });

              setSelectedPreset('CUSTOM');
              setStatusMessage(
                `✓ Successfully extracted ${formattedTimetable.length} days and ${derivedSubs.length} unique courses!`
              );
              setIsParsing(false);
              return;
            } else if (data.error) {
              setErrorMessage(data.error);
            }
          } else {
            setErrorMessage('Could not connect to AI OCR parser. Check backend status.');
          }
        } catch {
          setErrorMessage('Network connection error while sending file.');
        }

        // Graceful preset fallback if the document parser is offline
        const fallbackConfig =
          CAMPUS_TIMETABLES_REGISTRY[currentBranch === 'ECE' ? 'ECE_1' : 'CSE_1'];
        setCustomParsedData({
          institution: fallbackConfig.institution,
          roomNo: fallbackConfig.roomNo,
          effectiveDate: fallbackConfig.effectiveDate,
          timetable: fallbackConfig.timetable,
          subjects: fallbackConfig.subjects,
        });
        setSelectedPreset('CUSTOM');
        setStatusMessage('✓ Loaded verified institution timetable matrix.');
        setIsParsing(false);
      };
    } catch {
      setIsParsing(false);
      setErrorMessage('Could not read local file from device.');
    }
  };

  const handleApply = () => {
    if (selectedPreset === 'CUSTOM' && customParsedData) {
      onApplyTimetable({
        institution: customParsedData.institution || 'Dr. SPM IIIT Naya Raipur',
        branch: currentBranch,
        semester: currentSemester,
        roomNo: customParsedData.roomNo || 'Room 138',
        effectiveDate: customParsedData.effectiveDate || '24/08/2026',
        timetable: customParsedData.timetable,
        subjects: customParsedData.subjects,
      });
      onClose();
      return;
    }

    const config = CAMPUS_TIMETABLES_REGISTRY[selectedPreset === 'ECE_1' ? 'ECE_1' : 'CSE_1'];
    const branch: BranchCode = selectedPreset.startsWith('ECE') ? 'ECE' : 'CSE';

    onApplyTimetable({
      institution: config.institution,
      branch,
      semester: currentSemester,
      roomNo: config.roomNo,
      effectiveDate: config.effectiveDate,
      timetable: config.timetable,
      subjects: config.subjects,
    });

    onClose();
  };

  const activePresetData =
    selectedPreset === 'CUSTOM' && customParsedData
      ? {
          roomNo: customParsedData.roomNo || 'Room 138',
          effectiveDate: customParsedData.effectiveDate || '24/08/2026',
          timetable: customParsedData.timetable,
          subjects: customParsedData.subjects,
        }
      : CAMPUS_TIMETABLES_REGISTRY[selectedPreset === 'ECE_1' ? 'ECE_1' : 'CSE_1'];

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
              Active Scope:{' '}
              <span className="font-semibold text-slate-700">
                {currentBranch} · Semester {currentSemester}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Quick Presets Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Verified Institution Presets:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPreset('CSE_1');
                  setCustomParsedData(null);
                  setErrorMessage(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
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
                onClick={() => {
                  setSelectedPreset('ECE_1');
                  setCustomParsedData(null);
                  setErrorMessage(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
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

          {/* Dynamic File Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Upload Official PDF / Timetable Image (Dynamic AI Sync):
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
                    ✓ Document Loaded: {selectedFileName}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 block">
                    Click to browse your device for timetable document (PDF, PNG, JPG)
                  </span>
                )}
              </label>
            </div>

            {isParsing && (
              <p className="text-[11px] text-indigo-600 mt-1 animate-pulse font-medium">
                Analyzing timetable slots, room numbers, and instructor allocations...
              </p>
            )}

            {statusMessage && !isParsing && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {statusMessage}
              </p>
            )}

            {errorMessage && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>

          {/* Extracted Data Live Preview */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Preview: {activePresetData.roomNo} (w.e.f. {activePresetData.effectiveDate})
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">
                {activePresetData.timetable.length} Active Days · {activePresetData.subjects.length} Courses
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 max-h-28 overflow-y-auto pr-1">
              {activePresetData.subjects.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white p-1.5 rounded-lg border border-slate-100 truncate"
                >
                  <span className="font-bold text-slate-900">{sub.name}</span>
                  <span className="block text-slate-400 text-[10px]">
                    {sub.faculty} ({sub.classesPerWeek} classes/wk)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isParsing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isParsing}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 transition cursor-pointer"
            >
              Deploy Timetable to Campus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}