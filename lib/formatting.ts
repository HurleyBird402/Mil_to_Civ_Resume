// lib/formatting.ts
export function enforceFormatting(text: string): string {
  if (!text) return "";

  let out = text;

  // Fix inline bullets ("• text • text → newline bullets")
  out = out.replace(/•\s*/g, "\n• ");

  // Ensure newlines before section headers
  out = out.replace(
    /\b(EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|LEADERSHIP|TRAINING|SUMMARY)\b/g,
    "\n\n$1"
  );

  // Squash extra spaces
  out = out.replace(/ {2,}/g, " ");

  // Normalize line endings
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
}
