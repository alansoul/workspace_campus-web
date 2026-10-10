// src/features/admin/ui/AdminConsoleView.tsx
'use client';

import React from 'react';

export function AdminConsoleView() {
  const members = [
    { name: 'Alan Soul', email: 'admin@campus.edu', role: 'CAMPUS_ADMIN', status: 'Active' },
    { name: 'Priya Sharma', email: 'priya@campus.edu', role: 'FACULTY', status: 'Active' },
    { name: 'Kunal Patel', email: 'kunal@campus.edu', role: 'STUDENT', status: 'Active' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🛡️</span> Institutional Governance Console
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage institutional domain verification, student directories, and permissions</p>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white">University Member Directory</h2>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition">
            + Invite Member
          </button>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Institutional Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {members.map((m) => (
              <tr key={m.email} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-medium text-white">{m.name}</td>
                <td className="py-3 px-4 font-mono text-slate-400">{m.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
                    {m.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-emerald-400">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}