import { NextResponse } from 'next/server';
import { isDemoMode } from '../../../lib/handler-backend';

export function GET(): NextResponse {
  return NextResponse.json({
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
    demo: isDemoMode(),
  });
}
