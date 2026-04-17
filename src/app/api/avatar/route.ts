import { NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['media.cointech2u.com'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'missing url' }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'host not allowed' }, { status: 403 });
    }

    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'upstream error' }, { status: res.status });
    }

    const body = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }
}
