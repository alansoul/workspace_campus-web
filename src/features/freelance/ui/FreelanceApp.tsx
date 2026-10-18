'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  Folder,
} from 'lucide-react';

export type ContractStatus = 'ESCROW_LOCKED' | 'COMPLETED';

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isCompleted: boolean;
}

export interface FreelanceContract {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  description: string;
  totalAmount: number;
  status: ContractStatus;
  category: 'Fullstack' | 'UI/UX Design' | 'Smart Contract' | 'Mobile App' | 'Code Bounty' | 'Custom';
  badgeLabel: 'Escrow Vault' | 'Peer Review' | 'Deliverable';
  createdAt: string;
  milestones: Milestone[];
}

const TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank contract',
    desc: 'Custom Escrow',
    category: 'Custom' as const,
    badgeLabel: 'Escrow Vault' as const,
    barColor: 'bg-transparent',
  },
  {
    id: 'escrow',
    title: 'Milestone Escrow',
    desc: 'Smart Vault Contract',
    category: 'Fullstack' as const,
    badgeLabel: 'Escrow Vault' as const,
    barColor: 'bg-emerald-600',
  },
  {
    id: 'design',
    title: 'UI/UX Design Sprint',
    desc: 'Figma Client Milestone',
    category: 'UI/UX Design' as const,
    badgeLabel: 'Deliverable' as const,
    barColor: 'bg-emerald-500',
  },
  {
    id: 'fullstack',
    title: 'Fullstack Prototype',
    desc: 'PR Deliverable Spec',
    category: 'Fullstack' as const,
    badgeLabel: 'Deliverable' as const,
    barColor: 'bg-blue-600',
  },
  {
    id: 'bounty',
    title: 'Code Bounty',
    desc: 'Bug Fix Agreement',
    category: 'Code Bounty' as const,
    badgeLabel: 'Peer Review' as const,
    barColor: 'bg-purple-600',
  },
  {
    id: 'invoice',
    title: 'Escrow Invoice',
    desc: 'Automated Payout',
    category: 'Custom' as const,
    badgeLabel: 'Escrow Vault' as const,
    barColor: 'bg-amber-500',
  },
];

const INITIAL_CONTRACTS: FreelanceContract[] = [
  {
    id: 'cnt-1',
    title: 'Fullstack Next.js Prototype Escrow Agreement',
    clientName: 'Bhaumik Singh',
    clientEmail: 'bhaumik@iiitnr.edu.in',
    freelancerName: 'Rohan Singh Bhandari',
    description:
      'Milestone 2 approved. Escrow vault holds ₹12,000 locked until PR approval criteria is satisfied.',
    totalAmount: 12000,
    status: 'ESCROW_LOCKED',
    category: 'Fullstack',
    badgeLabel: 'Escrow Vault',
    createdAt: 'Oct 15, 2026',
    milestones: [
      {
        id: 'm1',
        title: 'Database schema & Auth API setup',
        amount: 5000,
        dueDate: '2026-10-20',
        isCompleted: true,
      },
      {
        id: 'm2',
        title: 'UI Dashboard & WebRTC signaling integration',
        amount: 7000,
        dueDate: '2026-10-28',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'cnt-2',
    title: 'Solana Smart Contract Security Review',
    clientName: 'Dr. Mukherji Workspace',
    clientEmail: 'admin@iiitnr.edu.in',
    freelancerName: 'Rohan Singh Bhandari',
    description:
      'Auditing reentrancy attack vectors in minting contract. Test suite coverage verified at 99.4%.',
    totalAmount: 18500,
    status: 'ESCROW_LOCKED',
    category: 'Smart Contract',
    badgeLabel: 'Peer Review',
    createdAt: 'Oct 12, 2026',
    milestones: [
      {
        id: 'm3',
        title: 'Vulnerability threat vector report',
        amount: 8500,
        dueDate: '2026-10-18',
        isCompleted: true,
      },
      {
        id: 'm4',
        title: 'Automated fuzzing suite deliverable',
        amount: 10000,
        dueDate: '2026-10-25',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'cnt-3',
    title: 'Campus Food Delivery App Prototype',
    clientName: 'Prateek Sharma',
    clientEmail: 'prateek@iiitnr.edu.in',
    freelancerName: 'Rohan Singh Bhandari',
    description:
      'React Native navigation and push notification tokens integrated for mess delivery orders.',
    totalAmount: 8500,
    status: 'ESCROW_LOCKED',
    category: 'Mobile App',
    badgeLabel: 'Deliverable',
    createdAt: 'Oct 10, 2026',
    milestones: [
      {
        id: 'm5',
        title: 'UI mockup & Cart state',
        amount: 4000,
        dueDate: '2026-10-15',
        isCompleted: true,
      },
      {
        id: 'm6',
        title: 'Order dispatch webhook',
        amount: 4500,
        dueDate: '2026-10-24',
        isCompleted: false,
      },
    ],
  },
];

export function FreelanceApp() {
  const [contracts, setContracts] = useState<FreelanceContract[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('northstar_contracts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_CONTRACTS;
  });

  const [selectedContract, setSelectedContract] = useState<FreelanceContract | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [templateDefaults, setTemplateDefaults] = useState<{
    title: string;
    category: FreelanceContract['category'];
    badgeLabel: FreelanceContract['badgeLabel'];
  }>({
    title: '',
    category: 'Fullstack',
    badgeLabel: 'Escrow Vault',
  });

  const [filter, setFilter] = useState<'ALL' | 'ESCROW_LOCKED' | 'COMPLETED'>('ALL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('northstar_contracts', JSON.stringify(contracts));
    }
  }, [contracts]);

  const handleOpenTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setTemplateDefaults({
      title: tmpl.id === 'blank' ? '' : tmpl.title,
      category: tmpl.category,
      badgeLabel: tmpl.badgeLabel,
    });
    setIsCreateOpen(true);
  };

  const handleReleaseMilestone = (contractId: string, milestoneId: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedMilestones = c.milestones.map((m) =>
          m.id === milestoneId ? { ...m, isCompleted: true } : m,
        );
        const isAllComplete = updatedMilestones.every((m) => m.isCompleted);
        const updatedContract = {
          ...c,
          milestones: updatedMilestones,
          status: isAllComplete ? ('COMPLETED' as const) : c.status,
        };
        if (selectedContract?.id === contractId) {
          setSelectedContract(updatedContract);
        }
        return updatedContract;
      }),
    );
  };

  const filteredContracts = contracts.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. Template Gallery */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-12 py-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Start a new freelance contract or milestone
            </h2>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <span>Contract templates</span>
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleOpenTemplate(tmpl)}
                className="flex flex-col gap-2 group cursor-pointer"
              >
                <div className="h-36 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all flex flex-col overflow-hidden relative">
                  <div className={`h-1.5 w-full ${tmpl.barColor}`} />
                  <div className="flex-1 flex items-center justify-center p-3">
                    {tmpl.id === 'blank' ? (
                      <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition">
                        <Plus className="h-6 w-6 text-indigo-600" />
                      </div>
                    ) : (
                      <div className="w-full space-y-2 opacity-30 group-hover:opacity-70 transition">
                        <div className="h-2 w-3/4 bg-slate-400 rounded-sm" />
                        <div className="h-2 w-full bg-slate-300 rounded-sm" />
                        <div className="h-2 w-2/3 bg-slate-300 rounded-sm" />
                        <div className="h-2 w-1/2 bg-slate-300 rounded-sm" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 truncate">{tmpl.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{tmpl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Recent Contracts Section */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 pt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">Recent contracts & escrow vaults</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Owned by anyone</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({contracts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('ESCROW_LOCKED')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === 'ESCROW_LOCKED'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Locked
              </button>
              <button
                type="button"
                onClick={() => setFilter('COMPLETED')}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Settled
              </button>
            </div>
            <button
              type="button"
              title="Drive Folder Sync"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <Folder className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contract Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredContracts.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContract(c)}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-indigo-400 transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                    {c.category}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-700">
                    ₹{c.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                  {c.badgeLabel}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                  {c.status === 'COMPLETED' ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Settled
                    </>
                  ) : (
                    <>
                      <Shield className="h-3.5 w-3.5 text-emerald-600" /> Escrow Locked
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Create Contract Modal */}
      {isCreateOpen && (
        <CreateContractModal
          defaultTitle={templateDefaults.title}
          defaultCategory={templateDefaults.category}
          defaultBadgeLabel={templateDefaults.badgeLabel}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(newContract) => {
            setContracts([newContract, ...contracts]);
            setIsCreateOpen(false);
          }}
        />
      )}

      {/* 4. Contract Detail & Escrow Release Drawer */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onReleaseMilestone={handleReleaseMilestone}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: Create Contract Modal
// ----------------------------------------------------------------------
interface CreateContractModalProps {
  defaultTitle: string;
  defaultCategory: FreelanceContract['category'];
  defaultBadgeLabel: FreelanceContract['badgeLabel'];
  onClose: () => void;
  onCreated: (contract: FreelanceContract) => void;
}

function CreateContractModal({
  defaultTitle,
  defaultCategory,
  defaultBadgeLabel,
  onClose,
  onCreated,
}: CreateContractModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [category, setCategory] = useState<FreelanceContract['category']>(defaultCategory);
  const [badgeLabel, setBadgeLabel] =
    useState<FreelanceContract['badgeLabel']>(defaultBadgeLabel);
  const [description, setDescription] = useState('');
  const [milestones, setMilestones] = useState<Array<{ title: string; amount: number }>>([
    { title: 'Milestone 1: Prototype Deliverable', amount: 6000 },
  ]);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: `Milestone ${milestones.length + 1}: Final Review`, amount: 4000 },
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
      clientEmail: clientEmail.trim() || `${clientName.toLowerCase().replace(/\s+/g, '')}@iiitnr.edu.in`,
      freelancerName: 'Current User',
      description:
        description.trim() ||
        'Deliverables governed by automated smart milestone release criteria.',
      totalAmount,
      status: 'ESCROW_LOCKED',
      category,
      badgeLabel,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      milestones: milestones.map((m, idx) => ({
        id: `ms-${idx + 1}-${Date.now()}`,
        title: m.title,
        amount: Number(m.amount),
        dueDate: '2026-11-15',
        isCompleted: false,
      })),
    };

    onCreated(newContract);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Initiate Escrow Agreement</h3>
              <p className="text-[11px] text-slate-500">Funds remain locked until deliverables are verified</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agreement / Deliverable Title
            </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client / Peer Name
              </label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Email (Optional)
              </label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value as FreelanceContract['category'];
                setCategory(cat);
                setBadgeLabel(
                  cat === 'Smart Contract'
                    ? 'Peer Review'
                    : cat === 'UI/UX Design'
                      ? 'Deliverable'
                      : 'Escrow Vault',
                );
              }}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="Fullstack">Fullstack Development</option>
              <option value="UI/UX Design">UI/UX Design Sprint</option>
              <option value="Smart Contract">Smart Contract Audit</option>
              <option value="Mobile App">Mobile Prototype</option>
              <option value="Code Bounty">Code Bug Bounty</option>
              <option value="Custom">Custom Agreement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scope of Work
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain PR requirements, deliverables, and test criteria..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Escrow Milestones</label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>

            {milestones.map((ms, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-200"
              >
                <input
                  type="text"
                  required
                  value={ms.title}
                  onChange={(e) => {
                    const copy = [...milestones];
                    copy[index].title = e.target.value;
                    setMilestones(copy);
                  }}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white outline-none"
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
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              Lock in Escrow Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: Contract Detail & Escrow Release Drawer
// ----------------------------------------------------------------------
interface ContractDetailModalProps {
  contract: FreelanceContract;
  onClose: () => void;
  onReleaseMilestone: (contractId: string, milestoneId: string) => void;
}

function ContractDetailModal({
  contract,
  onClose,
  onReleaseMilestone,
}: ContractDetailModalProps) {
  const completedCount = contract.milestones.filter((m) => m.isCompleted).length;
  const isAllComplete = completedCount === contract.milestones.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {contract.category}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">{contract.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-3.5">
          <p className="text-xs text-slate-600 leading-relaxed">{contract.description}</p>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                Client
              </span>
              <span className="font-semibold text-slate-800">{contract.clientName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                Total Escrow Vault
              </span>
              <span className="font-bold text-emerald-700 font-mono">
                ₹{contract.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              Milestone Progress ({completedCount}/{contract.milestones.length})
            </h4>
            {contract.milestones.map((ms) => (
              <div
                key={ms.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
              >
                <div className="flex items-start gap-2.5">
                  {ms.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        ms.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {ms.title}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      ₹{ms.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {!ms.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onReleaseMilestone(contract.id, ms.id)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Release Escrow
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Paid Out
                  </span>
                )}
              </div>
            ))}
          </div>

          {isAllComplete && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>All escrow milestones released. Contract fulfilled!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}