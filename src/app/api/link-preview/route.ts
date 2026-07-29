import { NextResponse } from 'next/server';

// Proxies the goapi OG-metadata extractor so feed cards can render link
// previews. goapi caches per-URL internally; revalidate adds an edge on top.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || '';
  if (!url) {
    return NextResponse.json({ code: 400, data: null, msg: 'url required' });
  }

  try {
    const res = await fetch('https://app.mycoindeck.com/goapi/feeds/link-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // goapi's ClientGate rejects requests without this header (403).
        'X-Client-App': 'my-coinDeck-web',
      },
      body: JSON.stringify({ url }),
      next: { revalidate: 600 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: null, msg: 'error' }, { status: 500 });
  }
}
