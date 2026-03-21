import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST() {
  const child = spawn('wrangler', ['login'], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  return NextResponse.json({ success: true });
}
