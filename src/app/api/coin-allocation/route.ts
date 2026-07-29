import { NextResponse } from 'next/server';

function generateToken() {
  return Buffer.from(JSON.stringify({
    passcode: 'yesCoinAllocation//',
    userType: 'CoinAllocation',
  })).toString('base64');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = parseInt(searchParams.get('uid') || '0');
  const pid = parseInt(searchParams.get('pid') || '0');

  if (!uid || !pid) {
    return NextResponse.json({ code: 400, data: [] }, { status: 400 });
  }

  try {
    const res = await fetch('https://app.mycoindeck.com/goapi/asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // goapi's ClientGate rejects requests without this header (403).
        'X-Client-App': 'my-coinDeck-web',
        Authorization: generateToken(),
      },
      body: JSON.stringify({ uid, pid }),
      next: { revalidate: 120 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: [], msg: 'error' }, { status: 500 });
  }
}
