import { NextRequest, NextResponse } from 'next/server';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { CAREER_FILE_KIND } from '../../../constants/career';
import { validateCareerFile } from '../../../utils/career-file.utils';
import { renderResumePreview } from '../../../../lib/resume-preview.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PDF_CONTENT_TYPE = 'application/pdf';

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (typeof content !== 'string') {
    return NextResponse.json(
      { error: 'Content must be text' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const errors = validateCareerFile(CAREER_FILE_KIND.RESUME, content);
  if (errors.length) {
    return NextResponse.json(
      { error: errors[0], errors },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  try {
    return new NextResponse(await renderResumePreview(content), {
      headers: { [CONTENT_TYPE_HEADER]: PDF_CONTENT_TYPE },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to render the PDF',
      },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
