'use client';

import { useState } from 'react';
import { useAcademicsWorkspace } from '../../hooks/useAcademicsWorkspace';

export function AttendanceView() {
  const { attendance, logAttendance, addCustomAttendanceSubject } = useAcademicsWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [totalClasses, setTotalClasses] = useState('0');
  const [attendedClasses, setAttendedClasses] = useState('0');

  // Open modal for a new subject
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSubjectName('');
    setTotalClasses('0');
    setAttendedClasses('0');
    setIsModalOpen(true);
  };

  // Open modal to correct accidental clicks on an existing subject
  const handleOpenEdit = (sub: { subject: string; totalClasses: number; attended: number }) => {
    setIsEditMode(true);
    setSubjectName(sub.subject);
    setTotalClasses(sub.totalClasses.toString());
    setAttendedClasses(sub.attended.toString());
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    addCustomAttendanceSubject(
      subjectName.trim(),
      parseInt(totalClasses, 10) || 0,
      parseInt(attendedClasses, 10) || 0,
    );

    setSubjectName('');
    setTotalClasses('0');
    setAttendedClasses('0');
    setIsModalOpen(false);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Subject Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Attendance Tracker
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Overview</h2>
          <p className="text-sm text-slate-500">
            Track course attendance in real time. Maintain 75% or higher to remain eligible for examinations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span className="text-base font-bold leading-none">+</span> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attendance.map((sub) => {
          const isWarning = sub.attendancePct < 75;

          return (
            <div
              key={sub.subject}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                isWarning ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-base">{sub.subject}</h3>
                    {/* ✏️ Direct Edit / Undo Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sub)}
                      className="text-xs px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
                      title="Correct Attendance Count"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sub.attended} attended / {sub.totalClasses} total classes
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-2xl font-black ${
                      isWarning ? 'text-amber-600' : 'text-indigo-600'
                    }`}
                  >
                    {sub.attendancePct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isWarning ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(sub.attendancePct, 100)}%` }}
                />
              </div>

              <p
                className={`text-xs font-medium mb-4 ${
                  isWarning ? 'text-amber-700' : 'text-slate-600'
                }`}
              >
                {sub.statusText}
              </p>

              {/* Counter Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => logAttendance(sub.subject, true)}
                  className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  + Attended
                </button>
                <button
                  type="button"
                  onClick={() => logAttendance(sub.subject, false)}
                  className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  + Missed
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                {isEditMode ? `Correct Count: ${subjectName}` : 'Add Course to Tracker'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject / Course Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT Workshop Lab or Machine Learning"
                  value={subjectName}
                  disabled={isEditMode}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                    isEditMode ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
                  }`}
                />
                {isEditMode && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Subject name is locked while correcting counts.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Classes Held
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Classes Attended
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={attendedClasses}
                    onChange={(e) => setAttendedClasses(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isEditMode ? 'Save Count' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}