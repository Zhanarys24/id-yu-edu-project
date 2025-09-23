import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = process.env.API_BASE_URL + '/api/users/me/';
    const token = req.cookies.get('auth')?.value;
    const authMode = req.cookies.get('auth_mode')?.value;
    const backendSession = req.cookies.get('backend_session')?.value;

    if (!token && !backendSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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

    const data: Record<string, unknown> = await res.json();
    
    // Нормализуем аватар
    const rawAvatar = data.image || data.avatar || data.profile_image || null;
    let avatar: string | null = null;
    if (rawAvatar && typeof rawAvatar === 'string') {
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
      recovery_email: data.recovery_email || data.reserve_email || null,
      position: data.position || data.job_title || data.title || null, // Должность из API
      role: data.role || data.user_type || data.user_role || null // Роль из API
    };
    
    return NextResponse.json(filteredResponse, { status: res.status });
  } catch (e) {
    const err = e as Error
    return NextResponse.json({ message: err.message || 'Profile proxy error' }, { status: 500 });
  }
}


