'use client';

import { useState, useEffect } from 'react';

interface Props {
  adminPassword: string;
}

interface GlossaryItem {
  term: string;
  definition: string;
}

export default function GlossaryAdminForm({ adminPassword }: Props) {
  // Form State
  const [military, setMilitary] = useState('');
  const [civilian, setCivilian] = useState('');
  
  // Data State (The List)
  const [entries, setEntries] = useState<GlossaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'idle', msg: string}>({ type: 'idle', msg: '' });

  // 1. FETCH ON LOAD: When this component mounts, get the data
  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      // We use the GET route we created in route.ts
      const res = await fetch('/api/glossary');
      if (!res.ok) throw new Error("Failed to fetch intel");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error("Failed to load glossary", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', msg: '' });

    try {
      const res = await fetch('/api/glossary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword 
        },
        body: JSON.stringify({ military, civilian })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save entry');

      setStatus({ type: 'success', msg: `✅ Indexed: "${military}"` });
      setMilitary('');
      setCivilian('');
      
      // 2. REFRESH: Reload the list immediately after saving
      await fetchEntries();
      
    } catch (err: any) {
      setStatus({ type: 'error', msg: `❌ Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      
      {/* --- SECTION 1: INPUT FORM --- */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Add New Translation
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Military Term</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-omega-gold focus:ring-1 outline-none"
                placeholder="e.g. 11B"
                value={military}
                onChange={e => setMilitary(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Civilian Equivalent</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-omega-gold focus:ring-1 outline-none"
                placeholder="e.g. Infantryman"
                value={civilian}
                onChange={e => setCivilian(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-omega-gold hover:bg-yellow-600 text-black font-bold py-3 rounded transition-all disabled:opacity-50"
          >
            {loading ? 'UPLOADING INTEL...' : 'SAVE TO DATABASE'}
          </button>

          {status.msg && (
            <div className={`p-3 rounded text-sm font-medium text-center ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {status.msg}
            </div>
          )}
        </form>
      </div>

      {/* --- SECTION 2: LIVE DATABASE VIEW --- */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <div className="bg-black/40 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Intelligence Database</h3>
           <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{entries.length} Records</span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm italic">
              No custom definitions found. System utilizing default static glossary.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Military Term</th>
                  <th className="px-6 py-3 font-medium">Translation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {entries.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3 font-bold text-omega-gold font-mono">{item.term}</td>
                    <td className="px-6 py-3">{item.definition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}