import { NextResponse } from 'next/server';

const GO_API_BASE = 'https://app.mycoindeck.com/goapi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const res = await fetch(`${GO_API_BASE}/hot-feeds?limit=${limit}`, {
      next: { revalidate: 60 },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: [], msg: 'error' }, { status: 500 });
  }
}
