// lib/glossary.ts
import { redis, isRedisConfigured } from "./redis";

export interface GlossaryEntry {
  term: string;
  definition: string;
}

// Fallback list in case database is offline
const STATIC_GLOSSARY: GlossaryEntry[] = [
  { term: "NCO", definition: "Non-Commissioned Officer (Team Leader)" },
  { term: "OIC", definition: "Officer in Charge (Project Manager)" },
  { term: "NCOIC", definition: "Non-Commissioned Officer in Charge (Operations Supervisor)" },
  { term: "MOS", definition: "Military Occupational Specialty (Job Role)" },
  { term: "CO", definition: "Commanding Officer (Director/VP)" },
  { term: "XO", definition: "Executive Officer (Chief of Staff)" }
];

// 1. Fetch terms from Redis (or fallback to static)
export async function getGlossary(): Promise<GlossaryEntry[]> {
  try {
    if (isRedisConfigured()) {
      // Fetch all terms from the 'glossary:terms' hash
      const glossaryMap = await redis.hgetall("glossary:terms");
      
      if (glossaryMap) {
        // Convert the Redis object { "Bambi": "Rookie" } into an array
        const dbEntries = Object.entries(glossaryMap).map(([term, definition]) => ({
          term,
          definition: definition as string
        }));
        
        // Merge: DB entries first, then add static ones if they don't exist
        const combined = [...dbEntries];
        STATIC_GLOSSARY.forEach(staticItem => {
             const exists = combined.find(c => c.term.toLowerCase() === staticItem.term.toLowerCase());
             if (!exists) combined.push(staticItem);
        });
        return combined;
      }
    }
  } catch (err) {
    console.warn("⚠️ Redis Error (Falling back to static):", err);
  }
  return STATIC_GLOSSARY;
}

// 2. THE MISSING FUNCTION: formatting the text
export function applyGlossaryToText(text: string, glossary: GlossaryEntry[]): string {
  if (!text) return "";
  let processedText = text;
  
  // Sort by length so long terms (Battalion Commander) replace before short ones (Commander)
  const sortedGlossary = [...glossary].sort((a, b) => b.term.length - a.term.length);

  sortedGlossary.forEach((entry) => {
    // Only replace if we haven't already injected the definition
    if (!processedText.includes(`[${entry.definition}]`)) {
        // Regex: Match whole word only, case-insensitive
        const regex = new RegExp(`\\b${entry.term}\\b`, "gi");
        processedText = processedText.replace(regex, `$& [${entry.definition}]`);
    }
  });
  
  return processedText;
}