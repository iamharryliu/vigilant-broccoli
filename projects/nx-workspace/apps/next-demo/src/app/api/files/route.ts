import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { LocalBucketService } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

const BUCKET_PATH = 'public/bucket';

export async function GET() {
  const bucketService = new LocalBucketService(BUCKET_PATH);
  const response = await bucketService.getFiles();
  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const bucketService = new LocalBucketService(BUCKET_PATH);
  const formData = await req.formData();
  const files = formData.getAll('file');

  if (files.length === 0 || !files.every(f => f instanceof Blob)) {
    return NextResponse.json(
      { error: 'No valid files provided' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  for (const file of files) {
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = (file as File).name;
    await bucketService.upload(filename, buffer);
  }

  return NextResponse.json({});
}
