import React from 'react';
import { ResumeData } from '@/lib/types';
import ResumeDisplay from './ResumeDisplay';

interface Props {
  originalText: string;
  civilianData: ResumeData;
}

export default function ResumeComparison({ originalText, civilianData }: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      
      {/* --- LEFT COLUMN: ORIGINAL (SOURCE) --- */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-4">
          <h3 className="text-lg font-bold text-slate-500 mb-3 flex items-center gap-2">
            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded uppercase tracking-wider">
              Original
            </span>
            Raw Military Text
          </h3>
          
          <div className="bg-slate-100 rounded-lg border border-slate-200 p-4 h-[600px] overflow-y-auto shadow-inner text-sm font-mono text-slate-600 whitespace-pre-wrap">
            {originalText || "No original text detected."}
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: TRANSLATED (RESULT) --- */}
      <div className="flex-1 min-w-0">
         <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded uppercase tracking-wider">
              Translated
            </span>
            Civilian Resume Draft
         </h3>
         
         {/* We reuse your beautiful display component here */}
         <ResumeDisplay data={civilianData} />
      </div>

    </div>
  );
}