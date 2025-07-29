import { FileSystemUtils } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filename = searchParams.get('filename') as string;

  const obj = FileSystemUtils.getObjectFromFilepath(filename);
  return NextResponse.json(obj);
}
