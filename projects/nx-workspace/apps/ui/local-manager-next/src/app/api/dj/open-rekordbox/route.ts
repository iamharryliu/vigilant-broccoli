import { NextResponse } from 'next/server';
import { open } from '@vigilant-broccoli/common-node';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';

export async function POST() {
  await open(OPEN_TYPE.MAC_APPLICATION, 'rekordbox');
  return NextResponse.json({
    message: 'RekordBox opened successfully',
    status: 'success',
  });
}
