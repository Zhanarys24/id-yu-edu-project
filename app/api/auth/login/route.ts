import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = process.env.AUTH_LOGIN_URL || 'https://900c15e5d875.ngrok-free.app/api/users/login/';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ message: 'Auth service offline or invalid response' }, { status: 502 });
    }

    const data = await res.json();
    
    if (res.ok) {
      // Prefer explicit token fields
      let token = data && (data.token || data.access || data.access_token);

      // Try to capture backend session cookie in any case (some endpoints require it)
      const setCookie = res.headers.get('set-cookie') || '';
      const backendCookieName = process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid';
      const match = setCookie.match(new RegExp(`${backendCookieName}=([^;]+)`));
      let backendSession: string | undefined;
      if (match && match[1]) {
        backendSession = match[1];
        if (!token) token = backendSession;
      }

      // Filter response to only include required fields
      const filteredResponse = {
        username: data.username || null,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        avatar: data.image || data.avatar || null,
        access_token: token || null
      };

      const response = NextResponse.json(filteredResponse, { status: res.status });

      if (token) {
        response.cookies.set('auth', String(token), {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        });
        if (backendSession) {
          response.cookies.set('backend_session', backendSession, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          });
          response.cookies.set('auth_mode', 'cookie', {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          });
        }
      }

      return response;
    }

    return NextResponse.json(data as any, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Auth proxy error' }, { status: 500 });
  }
}


