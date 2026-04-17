import { NextResponse } from 'next/server';

const GO_API_BASE = 'https://app.mycoindeck.com/goapi';

function generateToken() {
  const payload = JSON.stringify({
    passcode: 'yesRankingList//',
    userType: 'RankingList',
  });
  return Buffer.from(payload).toString('base64');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'monthly';
  const option = searchParams.get('option') || 'pnl';

  try {
    const token = generateToken();
    const res = await fetch(`${GO_API_BASE}/ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        type,
        option,
        portfolioIds: [],
      }),
      next: { revalidate: 60 },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: [], msg: 'error' }, { status: 500 });
  }
}
