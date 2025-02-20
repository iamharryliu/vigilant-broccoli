import {
  EmployeeHandlerService,
  MOCK_EMPLOYEE_HANDLER_CONFIG,
  ZIPPED_GENERATED_SIGNATURES_FILEPATH,
} from '@vigilant-broccoli/employee-handler';
import { NextResponse } from 'next/server';
import fs from 'fs';
import { promisify } from 'util';

const access = promisify(fs.access);

export async function GET() {
  await EmployeeHandlerService.generateLocalSignatures(
    MOCK_EMPLOYEE_HANDLER_CONFIG,
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
