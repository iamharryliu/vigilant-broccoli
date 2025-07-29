import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { NextResponse } from 'next/server';

export async function GET() {
  const files = FileSystemUtils.getFilenamesFromDir('./github-configurations');
  return NextResponse.json(files);
}
