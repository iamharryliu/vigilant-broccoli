import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createBucketService, BucketProvider } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';

const BUCKET_PATH = path.join(process.cwd(), 'storage-buckets');

const bucket = createBucketService(BucketProvider.LOCAL, { path: BUCKET_PATH });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');

  // Download specific file
  if (fileName) {
    try {
      const fileBuffer = await bucket.read(fileName);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'application/octet-stream',
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: HTTP_STATUS_CODES.NOT_FOUND }
      );
    }
  }

  // List all files
  try {
    const files = await bucket.list();
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (files.length === 0 || !files.every(f => f instanceof Blob)) {
      return NextResponse.json(
        { error: 'No valid files provided' },
        { status: HTTP_STATUS_CODES.BAD_REQUEST }
      );
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = (file as File).name;
        await bucket.upload(filename, buffer);
        return filename;
      })
    );

    return NextResponse.json({
      message: `${uploadResults.length} file(s) uploaded successfully`,
      files: uploadResults
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json(
      { error: 'fileName query parameter is required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST }
    );
  }

  try {
    await bucket.delete(fileName);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR }
    );
  }
}
