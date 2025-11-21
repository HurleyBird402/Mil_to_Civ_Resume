"use client";

import { useState } from "react";
import { ResumeData } from "@/lib/types";
import ResumeComparison from "./ResumeComparison";
import { generateAndDownloadDocx } from "@/lib/docx-generator";

export default function ResumeConverterForm() {
  // --- CONTACT STATE ---
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // --- MISSION STATE ---
  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // --- OUTPUT STATE ---
  const [structuredOutput, setStructuredOutput] = useState<ResumeData | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [rawOutput, setRawOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    if (file) setText("");
  };

  const handleSubmit = async () => {
    setError("");
    setRawOutput("");
    setStructuredOutput(null);
    setOriginalText(""); 
    setLoading(true);

    try {
      let res;
      
      // 1. Prepare the Contact Overrides
      const contactOverrides = {
        name: contactName,
        phone: contactPhone,
        email: contactEmail
      };

      // 2. Send Request
      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        // Append contact info to FormData
        formData.append("contactOverrides", JSON.stringify(contactOverrides));
        
        res = await fetch("/api/convert-pdf", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text,
            // Send contact info in JSON body
            contactOverrides 
          }),
        });
      }

      // 3. Error Handling
      if (!res.ok) {
        if (res.status === 413) throw new Error("File is too large. Please upload a PDF smaller than 4MB.");
        if (res.status === 504) throw new Error("The AI took too long. Please try again.");

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errJson = await res.json();
            throw new Error(errJson.error || "Unknown server error");
        } else {
            const errText = await res.text();
            throw new Error(errText || `Server Error (${res.status})`);
        }
      }

      const data = await res.json();
      const sourceText = data.originalText || text;
      setOriginalText(sourceText);

      if (typeof data.output === 'object') {
        setStructuredOutput(data.output);
      } else {
        setRawOutput(data.output || "No output received.");
      }

    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocx = () => {
    if (structuredOutput) {
      generateAndDownloadDocx(structuredOutput);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* === INPUT CARD === */}
      <div className={`bg-omega-800 rounded-xl shadow-2xl border border-gray-800 overflow-hidden transition-all duration-500 ${structuredOutput ? 'opacity-60 hover:opacity-100' : ''}`}>
        
        {/* --- STEP 1: CONTACT INTEL --- */}
        <div className="bg-black/40 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-200 flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-omega-gold text-black text-xs font-bold">1</span>
            CONTACT INTEL
          </h2>
          <span className="text-xs text-gray-500 uppercase font-semibold">Optional</span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-800/50">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 focus:border-omega-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
            <input 
              type="text" 
              placeholder="e.g. (555) 123-4567"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 focus:border-omega-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input 
              type="text" 
              placeholder="e.g. john@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 focus:border-omega-gold outline-none"
            />
          </div>
        </div>

        {/* --- STEP 2: MISSION DATA --- */}
        <div className="bg-black/40 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-200 flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-omega-gold text-black text-xs font-bold">2</span>
            MISSION DATA
          </h2>
          <span className="text-xs text-omega-gold tracking-widest uppercase font-semibold">Secure Terminal</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              PASTE RESUME OR OER/NCOER BULLETS HERE
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!!pdfFile}
              placeholder=">> PASTE BULLETS OR RESUME TEXT HERE..."
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-lg p-4 min-h-[150px] focus:ring-1 focus:ring-omega-gold focus:border-omega-gold outline-none transition-all disabled:opacity-50 placeholder:text-gray-600 font-mono text-sm"
            />
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-[10px] font-bold uppercase tracking-wide text-center max-w-[200px] sm:max-w-none">
               OR UPLOAD A PDF RESUME / PDF WITH PASTED OER BULLETS
            </span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className={`relative border border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${pdfFile ? 'border-omega-gold bg-omega-gold/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800'}`}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="space-y-3 relative z-0">
              {pdfFile ? (
                <div className="flex items-center justify-center gap-2 text-omega-gold font-mono">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="font-bold">{pdfFile.name}</span>
                </div>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">Drop PDF Resume or Bullet List Here</p>
                  <p className="text-xs text-red-400/80 max-w-md mx-auto mt-2 border border-red-900/30 bg-red-900/10 p-2 rounded">
                    <span className="font-bold">⚠️ PRIVACY NOTICE:</span> We do not accept raw OER/NCOER forms. Please ensure all uploaded PDFs are sanitized of PII.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || (!text && !pdfFile)}
              className={`
                flex items-center gap-3 px-8 py-4 rounded font-bold uppercase tracking-wide shadow-lg transition-all transform hover:-translate-y-1
                ${loading || (!text && !pdfFile) 
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed shadow-none" 
                  : "bg-omega-gold text-black hover:bg-[#d4af37] hover:shadow-[0_0_20px_rgba(197,160,89,0.4)]"
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  PROCESSING INTEL...
                </>
              ) : (
                <>
                  EXECUTE TRANSLATION
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-900/20 border-l-2 border-red-600 text-red-400 text-sm font-mono animate-in fade-in slide-in-from-top-2">
              <span className="font-bold">ERROR:</span> {error}
            </div>
          )}
        </div>
      </div>

      {/* === RESULTS === */}
      {structuredOutput && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 gap-4 border-b border-gray-800 pb-4">
             <div>
               <h2 className="text-2xl font-bold text-white">MISSION COMPLETE</h2>
               <p className="text-gray-400 text-sm">Review draft below. Export for distribution.</p>
             </div>
             <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 text-sm font-semibold text-gray-300 bg-transparent border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                >
                  PRINT PDF
                </button>
                <button 
                  onClick={handleDownloadDocx}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-black bg-white rounded hover:bg-gray-200 shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.25 21.75H5.625c-1.035 0-1.875-.84-1.875-1.875V4.125c0-1.035.84-1.875 1.875-1.875H13.5l6.375 6.375v11.25c0 1.035-.84 1.875-1.875 1.875h-3.75zM14.25 9V3.75L18.375 9h-4.125z"/></svg>
                  DOWNLOAD .DOCX
                </button>
             </div>
          </div>
          <ResumeComparison 
            originalText={originalText} 
            civilianData={structuredOutput} 
          />
        </div>
      )}

      {/* Fallback */}
      {rawOutput && (
        <div className="mt-8 bg-omega-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Raw Intel Output</h2>
          <div className="whitespace-pre-wrap p-4 bg-black rounded-lg text-gray-300 border border-gray-700 font-mono text-sm">
            {rawOutput}
          </div>
        </div>
      )}
    </div>
  );
}