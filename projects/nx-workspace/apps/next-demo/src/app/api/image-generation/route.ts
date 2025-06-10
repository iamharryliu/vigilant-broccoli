import { LLMService } from '@vigilant-broccoli/ai-tools';
import { LocalBucketService } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { prompt, n } = data;
  const base64Images = await LLMService.generateImages(prompt, n);
  await Promise.all(
    base64Images.map(async (base64Image, i) => {
      const bucket = new LocalBucketService('public/bucket');
      const buffer = Buffer.from(base64Image as string, 'base64');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await bucket.upload(
        `${timestamp}${base64Images.length > 0 ? `(${i})` : ''}.png`,
        buffer,
      );
    }),
  );
  return NextResponse.json({});
}
