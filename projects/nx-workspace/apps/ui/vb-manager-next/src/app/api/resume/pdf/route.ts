import { NextRequest, NextResponse } from 'next/server';
import {
  ResumePdfOverflowError,
  generateResumePdfBuffer,
} from '@vigilant-broccoli/resume/server';
import { validateResume } from '@vigilant-broccoli/resume';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PDF_CONTENT_TYPE = 'application/pdf';
const CONTENT_DISPOSITION = 'attachment; filename="resume.pdf"';

const ERROR = {
  RESUME_REQUIRED: 'Resume data is required',
  RESUME_INVALID: 'Resume data is not a valid resume',
  GENERATE_FAILED: 'Failed to generate resume PDF',
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.resume) {
      return NextResponse.json(
        { error: ERROR.RESUME_REQUIRED },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    const validation = validateResume(body.resume);
    if (!validation.ok) {
      return NextResponse.json(
        { error: ERROR.RESUME_INVALID, details: validation.errors },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    const buffer = await generateResumePdfBuffer(validation.resume);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': PDF_CONTENT_TYPE,
        'Content-Disposition': CONTENT_DISPOSITION,
      },
    });
  } catch (error) {
    if (error instanceof ResumePdfOverflowError) {
      return NextResponse.json(
        { error: error.message, layout: error.layout },
        { status: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY },
      );
    }
    console.error(ERROR.GENERATE_FAILED, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : ERROR.GENERATE_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
