import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://app.mycoindeck.com/goapi/exchange-summary', {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ code: 500, data: null, msg: 'error' }, { status: 500 });
  }
}
