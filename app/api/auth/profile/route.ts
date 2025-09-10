import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = process.env.API_BASE_URL + '/api/users/me/';
    const token = req.cookies.get('auth')?.value;
    const authMode = req.cookies.get('auth_mode')?.value; // 'cookie' means backend session cookie used
    const backendSession = req.cookies.get('backend_session')?.value;

    if (!token && !backendSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Build headers: send both Authorization (if token exists) and backend session cookie (if exists)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${token}`;
    }
    if (authMode === 'cookie' && (backendSession || token)) {
      headers['Cookie'] = `${process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'}=${backendSession || token}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ message: 'Profile service invalid response' }, { status: 502 });
    }

    const data = await res.json();
    
    const filteredResponse = {
      username: data.username || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      avatar: data.image || data.avatar || null,
      recovery_email: data.recovery_email || data.reserve_email || null
    };
    
    return NextResponse.json(filteredResponse, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Profile proxy error' }, { status: 500 });
  }
}


