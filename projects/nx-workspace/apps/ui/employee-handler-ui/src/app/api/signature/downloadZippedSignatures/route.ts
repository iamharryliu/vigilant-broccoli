import fs from 'fs';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import {
  EmployeeHandlerService,
  EMPLOYEE_HANDLER_CONFIG_MOCK,
  ZIPPED_GENERATED_SIGNATURES_FILEPATH,
} from '@vigilant-broccoli/employee-handler';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

const access = promisify(fs.access);

export async function GET(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);

  await EmployeeHandlerService.generateLocalSignatures(
    EMPLOYEE_HANDLER_CONFIG_MOCK,
  );
  await access(ZIPPED_GENERATED_SIGNATURES_FILEPATH, fs.constants.F_OK);

  const fileStream = fs.createReadStream(ZIPPED_GENERATED_SIGNATURES_FILEPATH);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextResponse(fileStream as any, {
    headers: {
      'Content-Disposition': `attachment; filename="signatures.zip"`,
      'Content-Type': 'application/zip',
    },
  });
}
