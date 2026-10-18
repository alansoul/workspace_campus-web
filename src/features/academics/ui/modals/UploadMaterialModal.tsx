'use client';

import React, { useState } from 'react';
import type { SubjectItem, DriveFile } from '../../types/academics.types';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (material: {
    title: string;
    subject: string;
    category: DriveFile['category'];
    size: string;
    fileUrl: string;
  }) => void;
  subjects?: SubjectItem[];
}

export function UploadMaterialModal({
  isOpen,
  onClose,
  onUpload,
  subjects = [],
}: UploadMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.name || 'Programming with C');
  const [category, setCategory] = useState<DriveFile['category']>('Lectures');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.1 MB');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      // Create local blob URL for immediate instant download/viewing
      const localBlob = URL.createObjectURL(file);
      setFileUrl(localBlob);
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
      fileUrl: fileUrl.trim(),
    });

    setTitle('');
    setFileName('');
    setFileUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Upload Lecture Material</h3>
            <p className="text-xs text-slate-500">
              Share lecture slides, handwritten notes, or past question papers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select File</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-1">
                <span className="text-2xl">📄</span>
                <p className="text-xs font-semibold text-slate-700">
                  {fileName ? fileName : 'Click to browse or drop file here'}
                </p>
                <p className="text-[11px] text-slate-400">PDF, PPTX, or DOC up to 50MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document / Slide Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 3 — Binary Trees and Heap Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Course / Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Programming with C">Programming with C</option>
                    <option value="Linear Algebra">Linear Algebra</option>
                    <option value="Calculus">Calculus</option>
                    <option value="Digital Electronics">Digital Electronics</option>
                    <option value="IT Workshop">IT Workshop</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DriveFile['category'])}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Lectures">Lectures</option>
                <option value="Notes">Notes</option>
                <option value="Assignments">Assignments</option>
                <option value="Practicals">Practicals</option>
                <option value="Question Papers">Question Papers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              External Document Link (Optional)
            </label>
            <input
              type="url"
              placeholder="e.g. Google Drive link or leave blank"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Upload to Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}