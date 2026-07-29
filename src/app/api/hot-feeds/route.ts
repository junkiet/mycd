import { NextResponse } from 'next/server';
import { normalizeAvatarUrl } from '../_utils/avatar';

const GO_API_BASE = 'https://app.mycoindeck.com/goapi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const res = await fetch(`${GO_API_BASE}/hot-feeds?limit=${limit}`, {
      // goapi's ClientGate rejects requests without this header (403).
      headers: { 'X-Client-App': 'my-coinDeck-web' },
      next: { revalidate: 60 },
    });

    const data = await res.json();
    if (Array.isArray(data?.data)) {
      for (const f of data.data) {
        if (f && typeof f === 'object') {
          f.avatar = normalizeAvatarUrl(f.avatar);
          if (f.original && typeof f.original === 'object') {
            f.original.avatar = normalizeAvatarUrl(f.original.avatar);
          }
        }
      }
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: [], msg: 'error' }, { status: 500 });
  }
}
