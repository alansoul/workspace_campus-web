'use client';

import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { ExamItem } from '../../types/academics.types';
import { useAcademicsWorkspace } from '../../hooks/useAcademicsWorkspace';

export function ExamsView() {
  const { exams, handleCreateExam, handleUpdateExam, handleDeleteExam, isAdmin } =
    useAcademicsWorkspace();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('Quiz');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [room, setRoom] = useState('');
  const [syllabus, setSyllabus] = useState('');

  const featuredExam = exams[0];
  const regularExams = exams.slice(1);

  const handleOpenAdd = () => {
    setEditingExamId(null);
    setTitle('');
    setSubject('');
    setExamType('Quiz');
    setDateStr('');
    setTimeStr('');
    setRoom('');
    setSyllabus('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: ExamItem) => {
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setSubject(exam.subject);
    setExamType(exam.type || 'Quiz');
    setDateStr(exam.dateStr);
    setTimeStr(exam.timeStr);
    setRoom(exam.room);
    setSyllabus(exam.syllabus);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, examTitle: string) => {
    if (window.confirm(`Are you sure you want to remove the exam "${examTitle}"?`)) {
      handleDeleteExam?.(id);
      if (isModalOpen && editingExamId === id) {
        setIsModalOpen(false);
        setEditingExamId(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    const payload = {
      title: title.trim(),
      subject: subject.trim(),
      type: examType as ExamItem['type'],
      dateStr: dateStr.trim() || 'Upcoming',
      timeStr: timeStr.trim() || 'TBA',
      room: room.trim() || 'TBA',
      syllabus: syllabus.trim() || 'Full syllabus',
    };

    if (editingExamId) {
      handleUpdateExam?.(editingExamId, payload);
    } else {
      handleCreateExam(payload);
    }

    setIsModalOpen(false);
    setEditingExamId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Assessments
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Exams</h2>
          <p className="text-sm text-slate-500">
            Your examination schedule and syllabus for each paper.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span> Add Exam
          </button>
        )}
      </div>

      {/* Hero Banner for Next Upcoming Exam */}
      {featuredExam && (
        <div className="relative bg-linear-to-r from-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
          {isAdmin && (
            <div className="absolute top-5 right-5">
              <button
                type="button"
                onClick={() =>
                  setActiveMenuId(activeMenuId === featuredExam.id ? null : featuredExam.id)
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {activeMenuId === featuredExam.id && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                  <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200/90 shadow-xl z-30 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuId(null);
                        handleOpenEdit(featuredExam);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      <span>Update Schedule</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuId(null);
                        handleDelete(featuredExam.id, featuredExam.title);
                      }}
                      className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete Exam</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <span className="inline-block bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            NEXT UP · {featuredExam.dateStr || 'UPCOMING'}
          </span>
          <h3 className="text-2xl font-bold mb-1">{featuredExam.title}</h3>
          <p className="text-indigo-100 text-sm mb-4">
            {featuredExam.dateStr} · {featuredExam.timeStr} · {featuredExam.room}
          </p>
          <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs">
            <span className="font-semibold text-indigo-200">Syllabus: </span>
            <span>{featuredExam.syllabus}</span>
          </div>
        </div>
      )}

      {/* Grid of Other Scheduled Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regularExams.map((ex) => (
          <div
            key={ex.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 relative"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {ex.type || 'Quiz'}
                </span>

                <div className="flex items-center gap-2">
                  <span>{ex.dateStr}</span>
                  {isAdmin && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(activeMenuId === ex.id ? null : ex.id)
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeMenuId === ex.id && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200/90 shadow-xl z-30 py-1 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleOpenEdit(ex);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-500" />
                              <span>Update Schedule</span>
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDelete(ex.id, ex.title);
                              }}
                              className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete Exam</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-base">{ex.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{ex.subject}</p>
              <p className="text-xs text-slate-400 mt-1">
                {ex.timeStr} · {ex.room}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Syllabus: </span>
              {ex.syllabus}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add/Edit Modal */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingExamId ? 'Update Exam Schedule' : 'Schedule New Examination'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingExamId(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Quiz 2 or End-Sem Theory"
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
                    placeholder="e.g. Calculus"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Evaluation Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none bg-white focus:border-indigo-600"
                  >
                    <option value="Quiz">Quiz</option>
                    <option value="Mid-semester">Mid-semester</option>
                    <option value="End-semester">End-semester</option>
                    <option value="Viva / Practical">Viva / Practical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 Oct"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 – 11:00"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hall / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 204"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Syllabus Topics</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Unit 2 & 3: Trees, heaps, and graph traversals"
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                {editingExamId ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingExamId, title)}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Delete Exam
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingExamId(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                  >
                    {editingExamId ? 'Save Changes' : 'Publish Schedule'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}