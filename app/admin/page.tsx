'use client';

import { useState } from 'react';
import GlossaryAdminForm from '@/components/GlossaryAdminForm';

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ⚠️ SECURITY NOTE:
  // In a real production app, this check should happen on the SERVER (Middleware), 
  // not here in the client JS where a hacker could inspect it.
  // But for this tutorial/MVP, this is sufficient to stop casual users.
  const ADMIN_SECRET = "objective-omega-secret"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_SECRET) {
      setIsAuthenticated(true);
    } else {
      alert("ACCESS DENIED");
      setPasswordInput("");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-4">
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-widest">
          Command <span className="text-omega-gold">Center</span>
        </h1>
        <p className="text-slate-500 text-sm mt-2">Restricted Access // Authorized Personnel Only</p>
      </div>

      {/* CONDITIONAL RENDERING: Show Login OR Show Form */}
      {!isAuthenticated ? (
        // --- LOGIN STATE ---
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <input
            type="password"
            placeholder="Enter Access Code..."
            className="w-full bg-black/50 border border-slate-700 rounded-lg p-4 text-center text-white tracking-widest focus:border-omega-gold outline-none transition-colors"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button 
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-lg border border-slate-700 transition-all"
          >
            UNLOCK TERMINAL
          </button>
        </form>
      ) : (
        // --- AUTHENTICATED STATE ---
        <div className="animate-in fade-in zoom-in duration-500">
          <GlossaryAdminForm adminPassword={ADMIN_SECRET} />
          
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="mt-8 text-slate-500 hover:text-slate-300 text-sm underline w-full text-center"
          >
            Log Out
          </button>
        </div>
      )}

    </main>
  );
}