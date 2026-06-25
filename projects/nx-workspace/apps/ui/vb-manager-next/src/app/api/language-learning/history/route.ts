import { NextResponse } from 'next/server';
import { getAllSessions } from '../db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const sessions = getAllSessions().map(s => ({
    id: s.id,
    language: s.language,
    category: s.category,
    created_at: s.created_at,
    words: s.words,
    exampleSentence: { target: s.example_target, english: s.example_english },
  }));
  return NextResponse.json(sessions);
}
