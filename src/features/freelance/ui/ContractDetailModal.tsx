'use client';

import React from 'react';
import { X, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { FreelanceContract } from '../types/freelance.types';

interface ContractDetailModalProps {
  contract: FreelanceContract | null;
  onClose: () => void;
  onReleaseMilestone: (contractId: string, milestoneId: string) => void;
}

export function ContractDetailModal({
  contract,
  onClose,
  onReleaseMilestone,
}: ContractDetailModalProps) {
  if (!contract) return null;

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
            <h3 className="text-base font-bold text-slate-900 mt-1">{contract.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">{contract.description}</p>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Client</span>
              <span className="font-semibold text-slate-800">{contract.clientName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Escrow Vault</span>
              <span className="font-bold text-emerald-700 font-mono">₹{contract.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900">Milestone Progress ({completedCount}/{contract.milestones.length})</h4>
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
                    <p className={`text-xs font-semibold ${ms.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {ms.title}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">₹{ms.amount.toLocaleString('en-IN')}</p>
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
              <span>All escrow milestones released successfully. Contract fulfilled!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}