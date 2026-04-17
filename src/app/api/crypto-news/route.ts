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
        Authorization: generateToken(),
      },
      body: JSON.stringify({ lang, limit }),
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: [], msg: 'error' }, { status: 500 });
  }
}
