import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

type SecretType = 'hex' | 'base64' | 'url-safe' | 'uuid';

const GENERATORS = {
  hex: () => randomBytes(32).toString('hex'),
  base64: () => randomBytes(32).toString('base64'),
  'url-safe': () => randomBytes(32).toString('base64url'),
  uuid: () => {
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return [
      bytes.subarray(0, 4).toString('hex'),
      bytes.subarray(4, 6).toString('hex'),
      bytes.subarray(6, 8).toString('hex'),
      bytes.subarray(8, 10).toString('hex'),
      bytes.subarray(10, 16).toString('hex'),
    ].join('-');
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'hex') as SecretType;

    if (!(type in GENERATORS)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid secret type. Valid types: ${Object.keys(
            GENERATORS,
          ).join(', ')}`,
        },
        { status: 400 },
      );
    }

    const secret = GENERATORS[type]();

    return NextResponse.json({
      success: true,
      secret,
      type,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate secret',
      },
      { status: 500 },
    );
  }
}
