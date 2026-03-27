import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('sr');

  if (!query) {
    return NextResponse.json({ error: 'Search query (sr) is required' }, { status: 400 });
  }

  if (query.length > 100) {
    return NextResponse.json({ error: 'Search query too long (max 100 chars)' }, { status: 400 });
  }

  const login = process.env.S4B_LOGIN;
  const password = process.env.S4B_PASSWORD;
  const baseUrl = process.env.S4B_API_URL || 'http://s4b.ru/s.jsp';
  const a = process.env.S4B_A || '10041';
  const at = process.env.S4B_AT || '3';

  try {
    const url = new URL(baseUrl);
    url.searchParams.append('a', a);
    url.searchParams.append('at', at);
    url.searchParams.append('usrLogin', login || '');
    url.searchParams.append('usrPassword', password || '');
    url.searchParams.append('sr', query);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('S4B Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
