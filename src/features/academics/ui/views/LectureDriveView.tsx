'use client';

import React, { useState } from 'react';
import type { DriveFile } from '../../types/academics.types';

interface LectureDriveViewProps {
  files: DriveFile[];
  onToggleStar: (fileId: string) => void;
}

export function LectureDriveView({ files, onToggleStar }: LectureDriveViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Lectures', 'Notes', 'Assignments', 'Practicals', 'Question Papers'];
  const availableSubjects = ['All', ...Array.from(new Set(files.map((f) => f.subject)))];

  const filteredFiles = files.filter((file) => {
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    const matchesSubject = selectedSubject === 'All' || file.subject === selectedSubject;
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.author.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSubject && matchesSearch;
  });

  // Client-Side Safe Downloader & Viewer
  const handleDownload = (file: DriveFile) => {
    // 1. Handle expired blob URLs from previous page reloads
    if (file.fileUrl && file.fileUrl.startsWith('blob:')) {
      alert(
        'This file link expired because it was uploaded in an earlier session. Please delete this document and re-upload it.'
      );
      return;
    }

    // 2. Direct download for persistent Base64 Data URLs
    if (file.fileUrl && file.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.download = file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 3. Real external cloud links (Google Drive, Dropbox, HTTPS)
    const isRealExternalLink =
      file.fileUrl &&
      file.fileUrl !== '#' &&
      !file.fileUrl.includes('drive.campus.edu') &&
      file.fileUrl.startsWith('http');

    if (isRealExternalLink) {
      window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2. Otherwise generate a valid PDF document on the fly so Chrome downloads a real file
    const safeTitle = file.name.replace(/[()\\]/g, '');
    const safeSubject = file.subject.replace(/[()\\]/g, '');
    const safeAuthor = file.author.replace(/[()\\]/g, '');

    const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 260 >> stream
BT
/F1 18 Tf
50 720 Td
(${safeTitle}) Tj
/F1 12 Tf
0 -30 Td
(Course: ${safeSubject} | Category: ${file.category}) Tj
0 -20 Td
(Uploaded by: ${safeAuthor} | Date: ${file.uploadDate}) Tj
0 -30 Td
(Campus Academic Workspace -- Verified Study Material) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000227 00000 n 
0000000538 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
608
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
          />

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-700 font-medium"
          >
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub === 'All' ? 'All Subjects' : sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Files */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
          <span className="text-3xl">📂</span>
          <p className="text-slate-700 font-semibold text-sm mt-2">No documents found</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Try clearing filters or click &apos;↑ Upload Material&apos; above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {file.subject}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {file.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleStar(file.id)}
                      className={`text-sm cursor-pointer transition-transform active:scale-125 ${
                        file.isStarred ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'
                      }`}
                      title="Star Document"
                    >
                      ★
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {file.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">By {file.author}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {file.size} · {file.uploadDate}
                </span>

                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <span>Download / View</span>
                  <span>↓</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}