'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StudentProfile } from '../../types/academics.types';

interface ProfileViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onUploadAvatar: (file: File) => void;
}

export function ProfileView({
  profile,
  onUpdateProfile,
  onUploadAvatar,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveNotice, setShowSaveNotice] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || '',
    phone: profile.phone || '',
    rollNumber: profile.rollNumber,
    branch: profile.branch,
    semester: profile.semester,
    section: profile.section,
    batch: profile.batch || '2026 – 2030',
    cgpa: profile.cgpa || '8.92',
    mentor: profile.mentor,
    githubUrl: profile.githubUrl || '',
    linkedinUrl: profile.linkedinUrl || '',
  });

  const [skills, setSkills] = useState<string[]>(
    profile.skills || ['C / C++', 'Verilog', 'TypeScript', 'Linux', 'Python']
  );
  const [newSkill, setNewSkill] = useState('');

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAvatar(file);
      setShowSaveNotice(true);
      setTimeout(() => setShowSaveNotice(false), 3000);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...formData,
      skills,
    });
    setIsEditing(false);
    setShowSaveNotice(true);
    setTimeout(() => setShowSaveNotice(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      bio: profile.bio || '',
      phone: profile.phone || '',
      rollNumber: profile.rollNumber,
      branch: profile.branch,
      semester: profile.semester,
      section: profile.section,
      batch: profile.batch || '2026 – 2030',
      cgpa: profile.cgpa || '8.92',
      mentor: profile.mentor,
      githubUrl: profile.githubUrl || '',
      linkedinUrl: profile.linkedinUrl || '',
    });
    setSkills(profile.skills || []);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {showSaveNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>✓ Profile changes and avatar updated successfully!</span>
          <button type="button" onClick={() => setShowSaveNotice(false)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">Account & Identity</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">Student Profile</h2>
          <p className="text-xs text-slate-500 mt-1">Manage institutional credentials, contact records, and public portfolio.</p>
        </div>
        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              ✎ Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                ✓ Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Identity & Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo & Core Identifiers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center text-center space-y-4">
          {/* Avatar with Camera Overlay */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg shadow-indigo-100 relative bg-linear-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-3xl">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                profile.avatarText
              )}
            </div>

            {/* Click to upload photo */}
            <label
              htmlFor="avatar-file-input"
              className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
            >
              <span>📷 Change</span>
              <span className="text-[9px] opacity-80">Photo</span>
            </label>
            <input
              type="file"
              id="avatar-file-input"
              accept="image/*"
              onChange={handleAvatarFile}
              className="hidden"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">{profile.rollNumber}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{formData.bio}</p>
          </div>

          {/* Quick Metrics */}
          <div className="w-full space-y-3 pt-4 border-t border-slate-100 text-left">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Average Attendance</span>
                <span className="font-semibold text-emerald-600">{profile.avgAttendance}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${profile.avgAttendance}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Syllabus Coverage</span>
                <span className="font-semibold text-indigo-600">{profile.syllabusCovered}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${profile.syllabusCovered}%` }} />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
            {formData.githubUrl && (
              <a
                href={formData.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition"
              >
                GitHub
              </a>
            )}
            {formData.linkedinUrl && (
              <a
                href={formData.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200 transition"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Information & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {!isEditing ? (
            /* READ-ONLY VIEW */
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Academic Credentials
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <p className="text-slate-400">Roll Number</p>
                    <p className="font-semibold text-slate-900 mt-1 text-sm">{profile.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Current CGPA</p>
                    <p className="font-bold text-indigo-600 mt-1 text-sm">{formData.cgpa} / 10.0</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Branch</p>
                    <p className="font-semibold text-slate-900 mt-1">{formData.branch}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Semester & Section</p>
                    <p className="font-semibold text-slate-900 mt-1">Semester {formData.semester} · Section {formData.section}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Batch / Academic Year</p>
                    <p className="font-semibold text-slate-900 mt-1">{formData.batch}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Faculty Mentor</p>
                    <p className="font-semibold text-slate-900 mt-1">{formData.mentor}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-slate-400">Institution</p>
                    <p className="font-semibold text-slate-900 mt-1">{profile.collegeName}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">Campus Email</p>
                    <p className="font-semibold text-indigo-600 mt-1">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Phone Number</p>
                    <p className="font-semibold text-slate-900 mt-1">{formData.phone || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Skills & Competencies */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Technical Skills & Coursework
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM VIEW */
            <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Edit Profile Credentials
              </h3>

              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Headline</label>
                    <textarea
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Credentials */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current CGPA</label>
                    <input
                      type="text"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Batch</label>
                    <input
                      type="text"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Mentor</label>
                    <input
                      type="text"
                      value={formData.mentor}
                      onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Tag Editor */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="Type skill and press Enter (e.g. Next.js, Docker)"
                    className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-indigo-700 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social URLs */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">External Profiles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
                    <input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}