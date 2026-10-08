import { generateResumePdfBuffer } from '@vigilant-broccoli/resume/server';
import type { ResumeData } from '@vigilant-broccoli/resume';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const PDF_CONTENT_TYPE = 'application/pdf';
const CONTENT_DISPOSITION = 'attachment; filename="resume.pdf"';

const ERROR = {
  RESUME_REQUIRED: 'Resume data is required',
  GENERATE_FAILED: 'Failed to generate resume PDF',
} as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = body?.resume as ResumeData | undefined;
    if (!resume) {
      return Response.json(
        { error: ERROR.RESUME_REQUIRED },
        { status: HTTP_STATUS_CODES.BAD_REQUEST },
      );
    }

    const buffer = await generateResumePdfBuffer(resume);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': PDF_CONTENT_TYPE,
        'Content-Disposition': CONTENT_DISPOSITION,
      },
    });
  } catch (error) {
    console.error(ERROR.GENERATE_FAILED, error);
    return Response.json(
      { error: error instanceof Error ? error.message : ERROR.GENERATE_FAILED },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
