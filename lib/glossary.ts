// lib/glossary.ts
import { db } from './firebaseAdmin';

export interface GlossaryEntry {
  military: string;
  civilian: string;
}

const COLLECTION_NAME = 'glossary';

export async function getGlossary(): Promise<GlossaryEntry[]> {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map(doc => ({
    military: doc.id,
    civilian: doc.data().civilian as string
  }));
}

export async function upsertGlossaryEntry(military: string, civilian: string): Promise<void> {
  const key = military.trim().toLowerCase();
  if (!key || !civilian.trim()) return;

  await db.collection(COLLECTION_NAME).doc(key).set({
    civilian: civilian.trim(),
    updatedAt: new Date()
  });
}

export function applyGlossaryToText(text: string, entries: GlossaryEntry[]): string {
  let result = text;
  for (const { military, civilian } of entries) {
    if (!military || !civilian) continue;
    const pattern = new RegExp(`\\b${escapeRegex(military)}\\b`, 'gi');
    result = result.replace(pattern, civilian);
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
