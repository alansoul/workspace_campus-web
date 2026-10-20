'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Clock,
  UploadCloud,
  Loader2,
  Plus,
  Sparkles,
  Building2,
  Trash2,
  X,
} from 'lucide-react';
import { useAcademicsWorkspace } from '../../hooks/useAcademicsWorkspace';

interface FacultyMember {
  id: string;
  name: string;
  department: string;
  cabin?: string;
  officeHours?: string;
  email?: string;
}

interface LostFoundItem {
  id: string;
  title: string;
  location: string;
  status: 'Found' | 'Lost' | 'Claimed';
  reportedDate: string;
}

export function ResourcesView() {
  const { isAdmin } = useAcademicsWorkspace();

  const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campus_resources_faculty');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore parsing error
        }
      }
    }
    return [];
  });

  const [lostItems, setLostItems] = useState<LostFoundItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campus_resources_lost');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore parsing error
        }
      }
    }
    return [];
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);

  // Form states for manual Faculty creation
  const [facultyName, setFacultyName] = useState('');
  const [facultyDept, setFacultyDept] = useState('');
  const [facultyCabin, setFacultyCabin] = useState('');
  const [facultyHours, setFacultyHours] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');

  // Form states for manual Lost & Found creation
  const [itemTitle, setItemTitle] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemStatus, setItemStatus] = useState<'Found' | 'Lost'>('Found');

  // Load from backend API if available
  useEffect(() => {
    let isMounted = true;
    async function fetchServerResources() {
      try {
        const res = await fetch('/api/university/resources');
        if (res.ok && isMounted) {
          const data = (await res.json()) as {
            faculty?: FacultyMember[];
            lostItems?: LostFoundItem[];
          };
          if (Array.isArray(data.faculty) && data.faculty.length > 0) {
            setFaculty(data.faculty);
            localStorage.setItem('campus_resources_faculty', JSON.stringify(data.faculty));
          }
          if (Array.isArray(data.lostItems) && data.lostItems.length > 0) {
            setLostItems(data.lostItems);
            localStorage.setItem('campus_resources_lost', JSON.stringify(data.lostItems));
          }
        }
      } catch {
        // Fallback to local state if backend is unreachable
      }
    }
    fetchServerResources();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to localStorage
  const saveFacultyList = (updated: FacultyMember[]) => {
    setFaculty(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campus_resources_faculty', JSON.stringify(updated));
    }
  };

  const saveLostList = (updated: LostFoundItem[]) => {
    setLostItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campus_resources_lost', JSON.stringify(updated));
    }
  };

  // Upload Document (PDF/Image) and Auto-Extract with Gemini AI
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64String = reader.result as string;
        const res = await fetch('/api/university/faculty/auto-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64String,
            mimeType: file.type || 'application/pdf',
          }),
        });

        if (res.ok) {
          const freshRes = await fetch('/api/university/resources');
          if (freshRes.ok) {
            const data = (await freshRes.json()) as { faculty?: FacultyMember[] };
            if (Array.isArray(data.faculty)) {
              saveFacultyList(data.faculty);
            }
          }
        } else {
          alert('Could not auto-extract faculty. Please check your backend GEMINI_API_KEY.');
        }
      } catch {
        alert('Extraction failed due to network error.');
      } finally {
        setIsExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  // Manual Add Faculty Handler
  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyName.trim()) return;

    const newMember: FacultyMember = {
      id: `fac-${Date.now()}`,
      name: facultyName.trim(),
      department: facultyDept.trim() || 'Academics',
      cabin: facultyCabin.trim() || 'Main Block',
      officeHours: facultyHours.trim() || 'By appointment',
      email: facultyEmail.trim() || '',
    };

    saveFacultyList([newMember, ...faculty]);
    setIsFacultyModalOpen(false);

    // Reset Form
    setFacultyName('');
    setFacultyDept('');
    setFacultyCabin('');
    setFacultyHours('');
    setFacultyEmail('');
  };

  // Delete Faculty Member
  const handleDeleteFaculty = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from directory?`)) {
      saveFacultyList(faculty.filter((f) => f.id !== id));
    }
  };

  // Manual Add Lost Item Handler
  const handleAddLostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemLocation.trim()) return;

    const newItem: LostFoundItem = {
      id: `lost-${Date.now()}`,
      title: itemTitle.trim(),
      location: itemLocation.trim(),
      status: itemStatus,
      reportedDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      }),
    };

    saveLostList([newItem, ...lostItems]);
    setIsLostModalOpen(false);

    // Reset Form
    setItemTitle('');
    setItemLocation('');
    setItemStatus('Found');
  };

  // Delete Lost Item
  const handleDeleteLostItem = (id: string) => {
    saveLostList(lostItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8 select-none">
      {/* Hidden file input for auto-extraction */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Campus
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Resources</h2>
          <p className="text-sm text-slate-500">
            Portals, people and help — all in one place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {isAdmin && (
            <button
              type="button"
              disabled={isExtracting}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm rounded-xl border border-indigo-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Upload (PDF/Image)</span>
                </>
              )}
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsFacultyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLostModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Report Item</span>
          </button>
        </div>
      </div>

      {/* 1. Faculty Directory Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Faculty directory</h3>
          <span className="text-xs text-slate-400 font-medium">
            {faculty.length} {faculty.length === 1 ? 'member' : 'members'} listed
          </span>
        </div>

        {faculty.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                No faculty members listed yet
              </h4>
              <p className="text-xs text-slate-500">
                Upload a university staff list (PDF or photo), or add professors manually to populate this directory.
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Staff PDF / Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition cursor-pointer"
                >
                  + Add Manually
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-base">
                      {member.name}
                    </h4>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFaculty(member.id, member.name)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        title="Delete faculty member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {member.department} {member.cabin ? `· ${member.cabin}` : ''}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {member.officeHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.officeHours}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="text-indigo-600 hover:underline truncate"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Lost & Found Section */}
      <section className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Lost & found</h3>
          <span className="text-xs text-slate-400 font-medium">
            {lostItems.length} {lostItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {lostItems.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-xs text-slate-400">
            No active lost or found items reported. Click{' '}
            <strong
              onClick={() => setIsLostModalOpen(true)}
              className="text-indigo-600 cursor-pointer underline font-medium"
            >
              Report Item
            </strong>{' '}
            to submit a misplaced item.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-slate-300 transition group"
              >
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm">
                    {item.title}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.location} · {item.reportedDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      item.status === 'Found'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                  >
                    {item.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteLostItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manual Add Faculty Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Add Faculty Member
              </h3>
              <button
                type="button"
                onClick={() => setIsFacultyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFaculty} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. John Doe"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={facultyDept}
                    onChange={(e) => setFacultyDept(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cabin / Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cabin 204"
                    value={facultyCabin}
                    onChange={(e) => setFacultyCabin(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Office / Visiting Hours
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon & Thu, 14:00 – 16:00"
                  value={facultyHours}
                  onChange={(e) => setFacultyHours(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. faculty@university.edu.in"
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Lost Item Modal */}
      {isLostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Report Lost or Found Item
              </h3>
              <button
                type="button"
                onClick={() => setIsLostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLostItem} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casio fx-991CW Calculator or HP Mouse"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location Last Seen / Found *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 138 or Lab 2"
                  value={itemLocation}
                  onChange={(e) => setItemLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value as 'Found' | 'Lost')}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none bg-white focus:border-indigo-600"
                >
                  <option value="Found">Found (Ready for claim)</option>
                  <option value="Lost">Lost (Looking for it)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLostModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}