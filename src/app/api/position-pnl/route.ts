import { NextResponse } from 'next/server';

function generateToken() {
  const payload = JSON.stringify({
    passcode: 'yesPositionPnl//',
    userType: 'PositionPnl',
  });
  return Buffer.from(payload).toString('base64');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = parseInt(searchParams.get('uid') || '0');
  const pid = parseInt(searchParams.get('pid') || '0');
  const range = searchParams.get('range') || 'all';

  if (!uid || !pid) {
    return NextResponse.json({ code: 400, data: [] }, { status: 400 });
  }

  try {
    const res = await fetch('https://app.mycoindeck.com/goapi/positionpnl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // goapi's ClientGate rejects requests without this header (403).
        'X-Client-App': 'my-coinDeck-web',
        Authorization: generateToken(),
      },
      body: JSON.stringify({ uid, pid, range }),
      next: { revalidate: 120 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: [], msg: 'error' }, { status: 500 });
  }
}
