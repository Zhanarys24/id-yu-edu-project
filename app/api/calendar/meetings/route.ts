import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://dba33ae368da.ngrok-free.app';

export async function GET(req: NextRequest) {
  try {
    console.log('=== FETCH MEETINGS API CALLED ===');
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);
    
    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Добавляем авторизацию если есть токены
    if (authCookie) {
      headers['Authorization'] = `Bearer ${authCookie}`;
    }
    
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    console.log(' Fetching meetings from:', `${API_BASE_URL}/auth/calendar/all_meetings/`);
    
    const response = await fetch(`${API_BASE_URL}/auth/calendar/all_meetings/`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log(' Meetings API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Meetings API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Meetings data received:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings', details: (error as Error).message },
      { status: 500 }
    );
  }
}
