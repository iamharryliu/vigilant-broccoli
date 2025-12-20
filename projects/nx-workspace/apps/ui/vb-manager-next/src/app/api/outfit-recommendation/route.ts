import { NextRequest } from 'next/server';
import { VibecheckLite } from '@prettydamntired/vibecheck-lite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));

  if (!lat || !lon) {
    return new Response('Missing lat or lon parameters', { status: 400 });
  }

  try {
    const vibecheckLite = new VibecheckLite(
      process.env.OPENAI_API_KEY,
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    );

    const stream = await vibecheckLite.getOutfitRecommendationStream({
      latitude: lat,
      longitude: lon,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in outfit-recommendation API:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
