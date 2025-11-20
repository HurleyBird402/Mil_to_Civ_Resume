'use client';

import { useState, useEffect } from 'react';

interface Props {
  adminPassword: string;
  onSaved: () => void;
}

interface GlossaryItem {
  term: string;
  definition: string;
}

export default function GlossaryAdminForm({ adminPassword, onSaved }: Props) {
  // Form State
  const [military, setMilitary] = useState('');
  const [civilian, setCivilian] = useState('');
  
  // Data State
  const [entries, setEntries] = useState<GlossaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch('/api/glossary');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to load glossary", err);
    }
  }

  // 2. Handle Save (POST)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/glossary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ military, civilian })
      });

      if (!res.ok) throw new Error('Failed to save');

      setMessage(`Saved: "${military}"`);
      setMilitary('');
      setCivilian('');
      onSaved();
      
      // Refresh the list immediately
      fetchEntries();
    } catch (err: any) {
      setMessage(err.message || 'Error saving entry');
    } finally {
      setLoading(false);
    }
  }

  // 3. Handle Delete (DELETE) - The New Logic
  async function handleDelete(termToDelete: string) {
    if(!confirm(`Are you sure you want to delete "${termToDelete}"?`)) return;

    // Optimistic UI: Remove it from the screen immediately 
    setEntries(prev => prev.filter(item => item.term !== termToDelete));

    try {
      const res = await fetch('/api/glossary', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ term: termToDelete })
      });

      if (!res.ok) {
        // If it failed, fetch the list again to restore the item
        alert("Failed to delete from server.");
        fetchEntries();
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  }

  return (
    <div className="space-y-8">
      {/* --- INPUT FORM --- */}
      <form onSubmit={handleSubmit} className="p-6 bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Add New Translation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Military Term</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-omega-gold outline-none"
              placeholder="e.g. 11B"
              value={military}
              onChange={e => setMilitary(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Civilian Equivalent</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:border-omega-gold outline-none"
              placeholder="e.g. Infantryman"
              value={civilian}
              onChange={e => setCivilian(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!military.trim() || !civilian.trim() || loading}
          className="w-full py-3 bg-omega-gold text-black font-bold uppercase rounded hover:bg-[#d4af37] disabled:opacity-50 transition-all"
        >
          {loading ? 'Saving...' : 'Save to Database'}
        </button>

        {message && <p className="text-green-400 text-sm mt-3 text-center">{message}</p>}
      </form>

      {/* --- DATABASE LIST --- */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Intelligence Database</span>
          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded">{entries.length} Records</span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto bg-black/50">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-sm italic">
              No custom definitions found. System utilizing default static glossary.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-800/50">
                {entries.map((item) => (
                  <tr key={item.term} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-omega-gold font-mono font-bold w-1/3">{item.term}</td>
                    <td className="p-4 text-slate-300 text-sm">{item.definition}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(item.term)}
                        className="text-slate-600 hover:text-red-500 transition-colors p-2"
                        title="Delete Entry"
                      >
                        {/* Trash Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
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