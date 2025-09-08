import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = process.env.AUTH_PROFILE_URL || 'https://900c15e5d875.ngrok-free.app/api/users/me/';
    const token = req.cookies.get('auth')?.value;
    const authMode = req.cookies.get('auth_mode')?.value; // 'cookie' means backend session cookie used
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authMode === 'cookie'
          ? {}
          : { 'Authorization': `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${token}` }),
        // If backend requires cookie-based auth, also forward cookie header
        ...(authMode === 'cookie'
          ? { 'Cookie': `${process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'}=${token}` }
          : {}),
      },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ message: 'Profile service invalid response' }, { status: 502 });
    }

    const data = await res.json();
    
    // Filter response to only include required fields
    const filteredResponse = {
      username: data.username || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      avatar: data.image || data.avatar || null
    };
    
    return NextResponse.json(filteredResponse, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Profile proxy error' }, { status: 500 });
  }
}


