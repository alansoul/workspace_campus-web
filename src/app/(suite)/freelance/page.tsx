'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { apiFetch } from '@/lib/api';
import { Gig } from '@/types';
import { Briefcase, IndianRupee, Plus, ShieldCheck, X, Loader2 } from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}
function getUserSnapshot() { return localStorage.getItem('user'); }
function getServerSnapshot() { return null; }

export default function FreelancePage() {
  const rawUser = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: 500,
    category: 'Coding',
  });

  useEffect(() => {
    if (!rawUser) return;
    apiFetch<Gig[]>('/freelance/gigs')
      .then(setGigs)
      .catch((e) => console.error(e));
  }, [rawUser]);

  async function handleCreateGig(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newGig = await apiFetch<Gig>('/freelance/gigs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
        }),
      });

      setGigs((prev) => [newGig, ...prev]);
      setIsModalOpen(false);
      setForm({ title: '', description: '', budget: 500, category: 'Coding' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post gig');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
            <Briefcase className="w-6 h-6" /> Campus Freelance Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hire peer developers & designers. All milestones secured with Escrow.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Post a Gig
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl col-span-full text-center text-xs text-slate-500 italic space-y-2">
            <Briefcase className="w-8 h-8 text-slate-700 mx-auto" />
            <p>No active gigs posted yet. Create the first listing!</p>
          </div>
        ) : (
          gigs.map((g) => (
            <div key={g.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[10px] font-semibold">
                    {g.category}
                  </span>
                  <span className="flex items-center text-emerald-400 font-bold text-sm">
                    <IndianRupee className="w-3.5 h-3.5" />{g.budget}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-white leading-snug">{g.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{g.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Escrow Protected
                </span>
                <span className="text-slate-400">
                  By {g.client?.fullName || 'Client'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Gig Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create Freelance Opportunity</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateGig} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1">Gig Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Next.js Landing Page"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Design">Design</option>
                    <option value="Video">Video</option>
                    <option value="Writing">Writing</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Budget (INR)</label>
                  <input
                    type="number"
                    min={50}
                    required
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe project deliverables and expected deadline..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Gig'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}