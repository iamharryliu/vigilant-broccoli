import { LLMService } from '@vigilant-broccoli/ai-tools';
import { LocalBucketService } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { prompt } = data;
  const base64Image = await LLMService.generateImage(prompt);
  const bucket = new LocalBucketService('public/bucket');
  const buffer = Buffer.from(base64Image, 'base64');
  await bucket.upload('image.png', buffer);
  return NextResponse.json({});
}
