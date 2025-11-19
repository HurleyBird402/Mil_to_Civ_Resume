// lib/types.ts

export interface ExperienceItem {
  role: string;
  company: string; // Can be Unit/Branch for military
  duration: string;
  location: string;
  achievements: string[];
}

export interface ResumeData {
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    location?: string;
  };
  professionalSummary: string;
  experience: ExperienceItem[];
  skills: string[];
  education: string[];
}