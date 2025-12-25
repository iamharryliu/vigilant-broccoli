import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createBucketService, BucketProvider, IBucketProvider } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to get bucket service based on provider type
function getBucketService(provider?: string): IBucketProvider {
  const bucketProvider = provider === BucketProvider.CLOUDFLARE_R2
    ? BucketProvider.CLOUDFLARE_R2
    : BucketProvider.LOCAL;
  return createBucketService(bucketProvider);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');
  const provider = searchParams.get('provider') || undefined;
  const bucket = getBucketService(provider);

  // Download specific file
  if (fileName) {
    try {
      const fileBuffer = await bucket.read(fileName);
      // Convert Buffer to Uint8Array for NextResponse
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'application/octet-stream',
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: HTTP_STATUS_CODES.INVALID_PATH }
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
    const provider = formData.get('provider') as string | null;
    const bucket = getBucketService(provider || undefined);

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
  const provider = searchParams.get('provider') || undefined;
  const bucket = getBucketService(provider);

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
