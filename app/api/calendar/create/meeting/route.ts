import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '@/lib/config/api';

export async function POST(req: NextRequest) {
  try {
    console.log('=== CREATE MEETING API CALLED ===');
    
    const body = await req.json();
    console.log('📋 Request body received:', JSON.stringify(body, null, 2));
    
    // Валидация обязательных полей
    const requiredFields = ['title', 'date', 'time_start', 'time_end', 'campus', 'location'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Отсутствуют обязательные поля:', missingFields);
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: `Отсутствуют обязательные поля: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
    }
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);
    
    if (!authCookie && !backendSessionCookie) {
      console.error('❌ Нет токена авторизации');
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          details: 'Токен авторизации не найден' 
        },
        { status: 401 }
      );
    }
    
    // Подготавливаем заголовки с авторизацией
    const headers = getApiHeaders({
      ...(authCookie && { 'Authorization': `Token ${authCookie}` }),
      ...(backendSessionCookie && { 'Cookie': `backend_session=${backendSessionCookie}` })
    });
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CREATE_MEETING);
    console.log(' Creating meeting at:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    console.log('📡 API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Meeting created successfully:', data);
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      console.log('❌ API error, status:', response.status);
      console.log('❌ API error response:', errorText);
      
      return NextResponse.json(
        { 
          error: 'External API error', 
          status: response.status,
          details: errorText,
          originalError: { message: errorText }
        },
        { status: response.status }
      );
    }
    
  } catch (error) {
    console.error('❌ Error in create meeting API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}
