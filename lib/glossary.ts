// lib/glossary.ts

// --- OFFLINE MODE ---
// We are using a static list to bypass the need for a Firebase Database connection.
// This ensures the app deploys successfully without complex environment variables.

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export async function getGlossary(): Promise<GlossaryEntry[]> {
  console.log("⚠️ Glossary running in offline mode (No Database Connection)");
  
  // A small starter list of common terms. 
  // In the future, you can connect this to a real database if needed.
  return [
    { term: "NCO", definition: "Non-Commissioned Officer (Team Leader)" },
    { term: "OIC", definition: "Officer in Charge (Project Manager)" },
    { term: "NCOIC", definition: "Non-Commissioned Officer in Charge (Operations Supervisor)" },
    { term: "MOS", definition: "Military Occupational Specialty (Job Role)" },
    { term: "CO", definition: "Commanding Officer (Director/VP)" },
    { term: "XO", definition: "Executive Officer (Chief of Staff)" }
  ];
}

export function applyGlossaryToText(text: string, glossary: GlossaryEntry[]): string {
  if (!text) return "";
  
  let processedText = text;
  
  // Simple replacement logic to help the AI understand context
  glossary.forEach((entry) => {
    // Matches whole word only, case-insensitive
    const regex = new RegExp(`\\b${entry.term}\\b`, "gi");
    processedText = processedText.replace(regex, `${entry.term} [${entry.definition}]`);
  });
  
  return processedText;
}