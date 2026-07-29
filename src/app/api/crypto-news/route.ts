import { NextResponse } from 'next/server';

function generateToken() {
  const payload = JSON.stringify({
    passcode: 'yesNewsList//',
    userType: 'NewsList',
  });
  return Buffer.from(payload).toString('base64');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '4');
  const lang = searchParams.get('lang') || 'en';

  try {
    const res = await fetch('https://app.mycoindeck.com/goapi/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // goapi's ClientGate rejects requests without this header (403) —
        // server-side fetches have no Origin, so it's required here.
        'X-Client-App': 'my-coinDeck-web',
        Authorization: generateToken(),
      },
      // goapi orders by ingest id, not publish time — over-fetch and re-sort
      // by published_at so the landing list reads newest-first.
      body: JSON.stringify({ lang, limit: limit * 2 }),
      next: { revalidate: 300 },
    });
    const data = await res.json();
    if (Array.isArray(data?.data)) {
      data.data.sort(
        (a: { published_at?: string }, b: { published_at?: string }) =>
          new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime(),
      );
      data.data = data.data.slice(0, limit);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: [], msg: 'error' }, { status: 500 });
  }
}
