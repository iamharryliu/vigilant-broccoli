import {
  EmployeeHandlerService,
  ZIPPED_GENERATED_SIGNATURES_FILEPATH,
} from '@vigilant-broccoli/employee-handler';
import { CONFIG, EMPLOYEE_HANDLER_ACTION } from '../../../../config';
import { NextResponse } from 'next/server';
import fs from 'fs';
import { promisify } from 'util';

const access = promisify(fs.access);

export async function GET() {
  await EmployeeHandlerService.handleInput(
    CONFIG,
    EMPLOYEE_HANDLER_ACTION.GENERATE_LOCAL_SIGNATURES,
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
