'use client';

import React, { useState } from 'react';
import { X, Shield, Plus, Trash2 } from 'lucide-react';
import { FreelanceContract, Milestone } from '../types/freelance.types';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newContract: FreelanceContract) => void;
  defaultTemplate?: string;
}

export function CreateContractModal({
  isOpen,
  onClose,
  onCreated,
  defaultTemplate,
}: CreateContractModalProps) {
  const [title, setTitle] = useState(defaultTemplate || '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [category, setCategory] = useState<FreelanceContract['category']>('Fullstack');
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<Omit<Milestone, 'id' | 'isCompleted'>[]>([
    { title: 'Milestone 1: Prototype & PR Approval', amount: 5000, dueDate: '2026-11-05' },
  ]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: `Milestone ${milestones.length + 1}`, amount: 3000, dueDate: '2026-11-15' },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    const totalAmount = milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const newContract: FreelanceContract = {
      id: `cnt-${Date.now()}`,
      title: title.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || 'client@campus.local',
      freelancerName: 'Current User',
      description: description.trim() || 'Standard campus milestone agreement.',
      totalAmount,
      status: 'ESCROW_LOCKED',
      category,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      milestones: milestones.map((m, idx) => ({
        id: `ms-${idx + 1}-${Date.now()}`,
        ...m,
        isCompleted: false,
      })),
    };

    onCreated(newContract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Initiate Escrow Agreement</h3>
              <p className="text-xs text-slate-500">Funds are locked in vault until deliverables are verified</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agreement / Deliverable Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js Mobile-Responsive Dashboard"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client / Peer Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Manish Sharma"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Email (Optional)</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. client@iiitnr.edu.in"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FreelanceContract['category'])}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="Fullstack">Fullstack Development</option>
              <option value="Design">UI/UX Design Sprint</option>
              <option value="Smart Contract">Smart Contract Audit</option>
              <option value="Mobile App">Mobile Prototype</option>
              <option value="Bounty">Code Bug Bounty</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope of Work</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain deliverables, PR requirements, test coverage..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Escrow Milestones</label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>

            {milestones.map((ms, index) => (
              <div key={index} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-200">
                <input
                  type="text"
                  required
                  value={ms.title}
                  onChange={(e) => {
                    const copy = [...milestones];
                    copy[index].title = e.target.value;
                    setMilestones(copy);
                  }}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <div className="flex items-center gap-1 w-28 bg-white border border-slate-200 px-2 py-1.5 rounded-lg">
                  <span className="text-[11px] text-slate-500">₹</span>
                  <input
                    type="number"
                    required
                    value={ms.amount}
                    onChange={(e) => {
                      const copy = [...milestones];
                      copy[index].amount = Number(e.target.value);
                      setMilestones(copy);
                    }}
                    className="w-full text-xs outline-none"
                  />
                </div>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Lock in Escrow Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}