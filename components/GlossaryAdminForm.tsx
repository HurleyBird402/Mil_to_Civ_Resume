// components/GlossaryAdminForm.tsx
'use client';

import { useState } from 'react';

interface Props {
  adminPassword: string;
  onSaved: () => void;
}

export default function GlossaryAdminForm({ adminPassword, onSaved }: Props) {
  const [military, setMilitary] = useState('');
  const [civilian, setCivilian] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
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

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to save entry');
      }

      setMessage(`Saved: "${military}" → "${civilian}"`);
      setMilitary('');
      setCivilian('');
      onSaved();
    } catch (err: any) {
      setMessage(err?.message || 'Error saving entry');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-md p-3 bg-white">
      <h3 className="text-md font-semibold">Add / Update Glossary Entry</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Military term</label>
        <input
          type="text"
          className="border rounded-md p-2 text-sm w-full"
          placeholder='e.g. "company commander"'
          value={military}
          onChange={e => setMilitary(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Civilian equivalent</label>
        <input
          type="text"
          className="border rounded-md p-2 text-sm w-full"
          placeholder='e.g. "director"'
          value={civilian}
          onChange={e => setCivilian(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={!military.trim() || !civilian.trim() || saving}
        className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Entry'}
      </button>

      {message && (
        <p className="text-xs mt-2">{message}</p>
      )}
    </form>
  );
}
