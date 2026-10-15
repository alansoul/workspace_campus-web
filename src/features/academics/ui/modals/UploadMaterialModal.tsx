'use client';

import React, { useState } from 'react';

type MaterialCategory = 'Lectures' | 'Notes' | 'Assignments' | 'Practicals';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (material: {
    title: string;
    subject: string;
    category: MaterialCategory;
    size: string;
    fileUrl: string;
  }) => void;
  subjects: { code: string; name: string }[];
}

export function UploadMaterialModal({ isOpen, onClose, onUpload, subjects }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.name || 'Data Structures');
  const [category, setCategory] = useState<MaterialCategory>('Notes');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeInMb} MB`);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUpload({
      title: title.trim(),
      subject,
      category,
      size: fileSize,
      fileUrl: '#',
    });

    onClose();
    setTitle('');
    setSelectedFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Upload Lecture Material</h3>
            <p className="text-xs text-slate-500">Shared with all students enrolled in your department.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 3 Trees & Graphs Handwritten Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
              >
                {subjects.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
              >
                <option value="Notes">Notes</option>
                <option value="Lectures">Lectures Slides</option>
                <option value="Assignments">Assignment Solution</option>
                <option value="Practicals">Practical Manual</option>
              </select>
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File (PDF, PPTX, DOCX)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center cursor-pointer transition">
              <input
                type="file"
                accept=".pdf,.pptx,.ppt,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFileName ? (
                  <span className="text-xs font-medium text-indigo-600 truncate block">
                    📄 {selectedFileName} ({fileSize})
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    Click to select a file from your device (Max 50MB)
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Publish to Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}