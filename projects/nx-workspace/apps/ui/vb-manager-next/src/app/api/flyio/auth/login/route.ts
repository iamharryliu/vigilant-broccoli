import { NextResponse } from 'next/server';
import { FlyioService } from '@vigilant-broccoli/devops-cli';

export async function POST() {
  await FlyioService.login();
  return NextResponse.json({ success: true });
}
