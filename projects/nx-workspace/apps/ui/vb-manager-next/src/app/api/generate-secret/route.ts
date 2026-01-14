import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const secret = randomBytes(32).toString('hex');

    return NextResponse.json({
      success: true,
      secret
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate secret'
      },
      { status: 500 }
    );
  }
}
