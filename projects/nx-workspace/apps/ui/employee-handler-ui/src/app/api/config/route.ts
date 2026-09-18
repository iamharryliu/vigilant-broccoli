import { NextResponse } from 'next/server';

export function GET(): NextResponse {
  return NextResponse.json({
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
  });
}
