'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Clock, UploadCloud, Loader2 } from 'lucide-react';
import { useAcademicsWorkspace } from '../../hooks/useAcademicsWorkspace';

interface FacultyItem {
  id: string;
  name: string;
  department: string;
  cabin?: string | null;
  officeHours?: string | null;
  email?: string | null;
}

interface LostItem {
  id: string;
  title: string;
  location: string;
  status: string;
  reportedDate: string;
}

export function ResourcesView() {
  const { isAdmin } = useAcademicsWorkspace();

  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load university-specific resources on mount
  useEffect(() => {
    let isMounted = true;
    async function loadResources() {
      try {
        const res = await fetch('/api/university/resources');
        if (res.ok && isMounted) {
          const data = (await res.json()) as {
            faculty?: FacultyItem[];
            lostItems?: LostItem[];
          };
          setFaculty(data.faculty || []);
          setLostItems(data.lostItems || []);
        }
      } catch {
        // Fallback or offline state
      }
    }
    loadResources();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Image/PDF AI Auto-Extraction via Base64
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
          // Re-fetch updated faculty from PostgreSQL
          const fresh = await fetch('/api/university/resources');
          if (fresh.ok) {
            const data = (await fresh.json()) as { faculty?: FacultyItem[] };
            setFaculty(data.faculty || []);
          }
        } else {
          alert('Could not extract faculty details from this file.');
        }
      } catch {
        alert('An error occurred during file extraction.');
      } finally {
        setIsExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Campus
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Resources</h2>
          <p className="text-sm text-slate-500">
            Portals, people, and help — all in one place.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <button
              type="button"
              disabled={isExtracting}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin"/>
                  <span>Extracting with AI...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4"/>
                  <span>Upload Staff PDF / Image</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Faculty Directory Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Faculty directory</h3>

        {faculty.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm text-slate-600 font-medium">No faculty directory records found for this university.</p>
            <p className="text-xs text-slate-400">
              {isAdmin
                ? 'Upload a staff list PDF or roster image above to automatically extract and populate faculty cards.'
                : 'Faculty list has not been published yet by university administration.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {member.department} {member.cabin ? `· Cabin ${member.cabin}` : ''}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {member.officeHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400"/>
                      <span>{member.officeHours}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400"/>
                      <a href={`mailto:${member.email}`} className="text-indigo-600 hover:underline">
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

      {/* Lost & Found Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Lost & found</h3>
        {lostItems.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
            No active lost or found items reported.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between"
              >
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm">{item.title}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.location} · {item.reportedDate}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}