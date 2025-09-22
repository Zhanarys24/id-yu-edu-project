import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://dba33ae368da.ngrok-free.app';

export async function GET(req: NextRequest) {
  try {
    console.log('=== GET CSRF TOKEN API CALLED ===');
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (authCookie) {
      headers['Authorization'] = `Bearer ${authCookie}`;
    }
    
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    // Попробуем получить CSRF токен
    const csrfUrl = `${API_BASE_URL}/auth/calendar/csrf/`;
    console.log('�� Getting CSRF token from:', csrfUrl);
    
    const response = await fetch(csrfUrl, {
      method: 'GET',
      headers,
    });

    console.log('📡 CSRF response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ CSRF token received:', data);
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      console.error('❌ CSRF API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get CSRF token', details: errorText },
        { status: response.status }
      );
    }
    
  } catch (error) {
    console.error('❌ Error getting CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to get CSRF token', details: (error as Error).message },
      { status: 500 }
    );
  }
}


