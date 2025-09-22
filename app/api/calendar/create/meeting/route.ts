import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://dba33ae368da.ngrok-free.app';

export async function POST(req: NextRequest) {
  try {
    console.log('=== CREATE MEETING API CALLED ===');
    
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
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
    
    // Получаем токены авторизации из cookies (как в profile API)
    const token = req.cookies.get('auth')?.value;
    const authMode = req.cookies.get('auth_mode')?.value;
    const backendSession = req.cookies.get('backend_session')?.value;
    
    console.log('Auth token present:', !!token);
    console.log('Auth mode:', authMode);
    console.log('Backend session present:', !!backendSession);
    
    if (!token && !backendSession) {
      console.error('❌ Нет токена авторизации');
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          details: 'Токен авторизации не найден' 
        },
        { status: 401 }
      );
    }
    
    // Подготавливаем заголовки для внешнего API (как в profile API)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
    };
    
    // Добавляем Authorization header если есть токен
    if (token) {
      headers['Authorization'] = `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${token}`;
      console.log('✅ Added Authorization header');
    }
    
    // Добавляем Cookie для backend session если используется cookie auth
    if (authMode === 'cookie' && (backendSession || token)) {
      headers['Cookie'] = `${process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'}=${backendSession || token}`;
      console.log('✅ Added Cookie header for backend session');
    }
    
    console.log('Headers for external API:', Object.keys(headers));
    
    const externalUrl = `${API_BASE_URL}/auth/calendar/create/meeting/`;
    console.log('Calling external API:', externalUrl);
    
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    console.log('External API response status:', response.status);
    console.log('External API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      
      // Пытаемся распарсить ошибку как JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { 
          error: 'External API error', 
          status: response.status,
          details: errorData.message || errorData.detail || errorText,
          originalError: errorData
        },
        { status: response.status }
      );
    }
    
    const responseText = await response.text();
    console.log('External API success response:', responseText);
    
    if (!responseText.trim()) {
      console.warn('⚠️ Пустой ответ от внешнего API');
      return NextResponse.json(
        { 
          error: 'Empty response', 
          details: 'Внешний API вернул пустой ответ' 
        },
        { status: 500 }
      );
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON ответа:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON response', 
          details: 'Внешний API вернул невалидный JSON',
          response: responseText.substring(0, 200)
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Встреча создана через внешний API:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error in create meeting API:', error);
    
    // Возвращаем структурированную ошибку
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
