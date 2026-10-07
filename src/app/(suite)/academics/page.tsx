'use client';

import { useEffect, useState, useMemo, useSyncExternalStore } from 'react';
import { apiFetch } from '@/lib/api';
import { User, Note, Question } from '@/types';
import {
  BookOpen,
  FileQuestion,
  Download,
  Plus,
  Search,
  X,
  Loader2,
} from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getUserSnapshot() {
  return localStorage.getItem('user');
}

function getServerSnapshot() {
  return null;
}

export default function AcademicsPage() {
  const rawUser = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);

  const user = useMemo<User | null>(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }, [rawUser]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [noteForm, setNoteForm] = useState({
    title: '',
    subject: '',
    semester: 1,
    branch: 'CSE',
    fileUrl: '',
  });

  const [questionForm, setQuestionForm] = useState({
    title: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiFetch<Question[]>('/universities/questions'),
      apiFetch<Note[]>('/universities/notes'),
    ])
      .then(([questionsData, notesData]) => {
        if (isMounted) {
          setQuestions(questionsData);
          setNotes(notesData);
        }
      })
      .catch((err) => {
        console.error('Failed to load academic records', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      const newNote = await apiFetch<Note>('/universities/notes', {
        method: 'POST',
        body: JSON.stringify({
          ...noteForm,
          semester: Number(noteForm.semester),
        }),
      });

      setNotes((prev) => [newNote, ...prev]);
      setIsNoteModalOpen(false);
      setNoteForm({ title: '', subject: '', semester: 1, branch: 'CSE', fileUrl: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      const newQuestion = await apiFetch<Question>('/universities/questions', {
        method: 'POST',
        body: JSON.stringify(questionForm),
      });

      setQuestions((prev) => [newQuestion, ...prev]);
      setIsQuestionModalOpen(false);
      setQuestionForm({ title: '', subject: '', description: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to ask question');
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BookOpen className="w-6 h-6 text-blue-400" /> Academic Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access verified lecture notes, past-year papers, and course Q&A.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes or subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Upload Note
          </button>

          <button
            onClick={() => setIsQuestionModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-700"
          >
            <Plus className="w-4 h-4" /> Ask Question
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Course Notes & PYQs
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              {filteredNotes.length} resources
            </span>
          </div>

          {filteredNotes.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-12 text-center">
              No notes uploaded yet. Be the first contributor!
            </p>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-white">{n.title}</h3>
                    <p className="text-[10px] text-slate-400">
                      {n.subject} • Semester {n.semester} ({n.branch}) • By{' '}
                      {n.author?.fullName || 'Contributor'}
                    </p>
                  </div>
                  <a
                    href={n.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold text-[10px] hover:bg-emerald-600/30 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-blue-400" /> Campus Questions
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              {questions.length} questions
            </span>
          </div>

          {questions.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-12 text-center">
              No course questions posted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-semibold text-white">{q.title}</h3>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-medium border border-blue-500/20">
                      {q.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>
                  <p className="text-[10px] text-slate-500 pt-1">
                    Asked by {q.author?.fullName || 'Student'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Upload Course Material</h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures Unit 1 Notes"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS201 - Data Structures"
                  value={noteForm.subject}
                  onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Semester</label>
                  <select
                    value={noteForm.semester}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, semester: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Branch</label>
                  <select
                    value={noteForm.branch}
                    onChange={(e) => setNoteForm({ ...noteForm, branch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="DSAI">DSAI</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">File URL (PDF / Drive)</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={noteForm.fileUrl}
                  onChange={(e) => setNoteForm({ ...noteForm, fileUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload Material'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Ask Academic Question</h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does Dijkstra's algorithm handle negative weights?"
                  value={questionForm.title}
                  onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={questionForm.subject}
                  onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the context or where you are stuck..."
                  value={questionForm.description}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Question'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}