import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = process.env.API_BASE_URL + '/api/users/login/';
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
      let token = data && (data.token || data.access || data.access_token);

      const setCookie = res.headers.get('set-cookie') || '';
      const backendCookieName = process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid';
      const match = setCookie.match(new RegExp(`${backendCookieName}=([^;]+)`));
      let backendSession: string | undefined;
      if (match && match[1]) {
        backendSession = match[1];
        if (!token) token = backendSession;
      }

      // Нормализуем аватар
      const rawAvatar = data.image || data.avatar || data.profile_image || null;
      let avatar: string | null = null;
      if (rawAvatar) {
        if (rawAvatar.startsWith('http')) {
          avatar = rawAvatar;
        } else {
          avatar = process.env.API_BASE_URL 
            ? process.env.API_BASE_URL + rawAvatar 
            : rawAvatar;
        }
      }

      const filteredResponse = {
        username: data.username || null,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        avatar,
        access_token: token || null
      };

      const response = NextResponse.json(filteredResponse, { status: res.status });

      if (token) {
        response.cookies.set('auth', String(token), {
          httpOnly: false,
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

    // Для 400/401 возвращаем понятный текст
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      return new NextResponse('Неправильный логин или пароль', { status: res.status });
    }

    return NextResponse.json(data as unknown, { status: res.status });
  } catch (e) {
    const err = e as Error
    return NextResponse.json({ message: err.message || 'Auth proxy error' }, { status: 500 });
  }
}
