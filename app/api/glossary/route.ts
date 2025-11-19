// app/api/glossary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGlossary, upsertGlossaryEntry } from '@/lib/glossary';

function checkAdminPassword(req: NextRequest): boolean {
  const header = req.headers.get('x-admin-password');
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && header === expected;
}

export async function GET(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entries = await getGlossary();
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  if (!checkAdminPassword(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { military, civilian } = await req.json();

  if (!military || !civilian) {
    return NextResponse.json(
      { error: 'Both "military" and "civilian" are required' },
      { status: 400 }
    );
  }

  await upsertGlossaryEntry(military, civilian);
  return NextResponse.json({ success: true });
}
