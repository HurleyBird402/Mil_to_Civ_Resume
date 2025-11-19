import React from 'react';
import { ResumeData } from '@/lib/types';

interface Props {
  data: ResumeData;
}

export default function ResumeDisplay({ data }: Props) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 font-sans text-gray-800">
      {/* --- HEADER SECTION --- */}
      <div className="bg-slate-900 text-white p-8 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-wider mb-4">
          {data.contactInfo.name}
        </h2>
        
        {/* Clean, Pipe-Separated Contact Info */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-slate-300">
          {data.contactInfo.email && (
            <span>{data.contactInfo.email}</span>
          )}
          
          {data.contactInfo.email && data.contactInfo.phone && (
            <span className="hidden sm:inline text-slate-600">|</span>
          )}
          
          {data.contactInfo.phone && (
            <span>{data.contactInfo.phone}</span>
          )}

          {data.contactInfo.phone && data.contactInfo.location && (
            <span className="hidden sm:inline text-slate-600">|</span>
          )}

          {data.contactInfo.location && (
            <span>{data.contactInfo.location}</span>
          )}
        </div>
      </div>

      <div className="p-8 space-y-8">
        
        {/* --- SUMMARY --- */}
        {data.professionalSummary && (
          <section>
            <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">
              Professional Summary
            </h3>
            <p className="leading-relaxed text-gray-700 text-justify">
              {data.professionalSummary}
            </p>
          </section>
        )}

        {/* --- EXPERIENCE --- */}
        <section>
          <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">
            Professional Experience
          </h3>
          <div className="space-y-6">
            {data.experience.map((job, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-baseline flex-wrap mb-1">
                  <h4 className="text-lg font-bold text-slate-900">{job.role}</h4>
                  <span className="text-sm font-medium text-slate-500 whitespace-nowrap ml-4">
                    {job.duration}
                  </span>
                </div>
                
                <div className="text-slate-700 font-semibold mb-3 text-sm">
                  {job.company} 
                  <span className="mx-2 font-light text-gray-400">|</span> 
                  {job.location}
                </div>
                
                <ul className="list-disc list-outside ml-5 space-y-2 text-gray-700">
                  {job.achievements.map((bullet, bIdx) => (
                    <li key={bIdx} className="pl-1 leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* --- SKILLS --- */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">
              Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-medium border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* --- EDUCATION --- */}
        {data.education && data.education.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">
              Education
            </h3>
            <ul className="space-y-2">
              {data.education.map((edu, idx) => (
                // Removed the 🎓 emoji here as well
                <li key={idx} className="text-gray-700 font-medium">
                  {edu}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}