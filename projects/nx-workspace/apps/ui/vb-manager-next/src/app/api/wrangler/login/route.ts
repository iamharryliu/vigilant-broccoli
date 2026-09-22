import { NextResponse } from 'next/server';
import { WranglerService } from '@vigilant-broccoli/devops-cli';

export async function POST() {
  WranglerService.login();
  return NextResponse.json({ success: true });
}
