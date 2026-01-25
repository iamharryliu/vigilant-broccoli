import { NextRequest, NextResponse } from 'next/server';
import { vbExpressFetch } from '../../../../lib/vb-express-fetch';
import { VB_EXPRESS_ENDPOINTS } from '../../../constants/api-endpoints';

export async function GET(req: NextRequest) {
  const response = await vbExpressFetch(VB_EXPRESS_ENDPOINTS.TASKS_LISTS, {
    credentials: 'include',
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
