import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://7584e68761c7.ngrok-free.app';

export async function PUT(req: NextRequest) {
  try {
    console.log('=== UPDATE MEETING API CALLED ===');
    
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Получаем ID мероприятия из URL или body
    const { id, ...meetingData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }
    
    // Получаем cookies для авторизации (точно так же, как в meetings/route.ts)
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);
    
    // Подготавливаем заголовки (точно так же, как в meetings/route.ts)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Добавляем авторизацию если есть токены (точно так же, как в meetings/route.ts)
    if (authCookie) {
      headers['Authorization'] = `Bearer ${authCookie}`;
    }
    
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    // Используем правильный URL для Django API
    const djangoUrl = `${API_BASE_URL}/auth/calendar/change/meeting/${id}/`;
    console.log(' Отправляем запрос к Django:', djangoUrl);
    console.log(' Заголовки:', headers);
    console.log('📋 Данные:', meetingData);
    
    // Отправляем запрос к Django
    const response = await fetch(djangoUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(meetingData),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return NextResponse.json(
        { 
          error: 'Failed to update meeting',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('✅ Meeting updated successfully:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error in update meeting API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}