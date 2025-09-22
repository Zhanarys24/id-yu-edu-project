import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://dba33ae368da.ngrok-free.app';

export async function DELETE(req: NextRequest) {
  try {
    console.log('=== DELETE MEETING API CALLED ===');
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }
    
    // Получаем токены авторизации из cookies (как в create API)
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
    
    // Подготавливаем заголовки для внешнего API (как в create API)
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
    
    // Попробуем разные URL для удаления
    const deleteUrls = [
      `${API_BASE_URL}/auth/calendar/meetings/${id}/`,
      `${API_BASE_URL}/auth/calendar/meeting/${id}/`,
      `${API_BASE_URL}/auth/calendar/delete/meeting/${id}/`,
    ];
    
    // Попробуем разные HTTP методы
    const methods = ['DELETE', 'POST'];
    
    const errors: string[] = [];
    
    for (const deleteUrl of deleteUrls) {
      console.log(' Пробуем URL:', deleteUrl);
      
      for (const method of methods) {
        try {
          console.log(`🔄 Пробуем ${method} для ${deleteUrl}`);
          
          const response = await fetch(deleteUrl, {
            method,
            headers,
          });

          console.log(` ${method} ${deleteUrl} response status:`, response.status);
          
          if (response.ok) {
            const responseText = await response.text();
            console.log(`✅ ${method} успешен для ${deleteUrl}:`, responseText);
            
            return NextResponse.json({ 
              success: true, 
              message: 'Meeting deleted successfully',
              method,
              url: deleteUrl,
              response: responseText || 'Empty response'
            });
          } else {
            const errorText = await response.text();
            const errorMsg = `${method} ${deleteUrl}: ${response.status} - ${errorText.substring(0, 100)}`;
            console.log(`❌ ${method} ошибка:`, errorMsg);
            errors.push(errorMsg);
          }
        } catch (error) {
          const errorMsg = `${method} ${deleteUrl} exception: ${(error as Error).message}`;
          console.log(`❌ ${method} exception:`, errorMsg);
          errors.push(errorMsg);
        }
      }
    }
    
    // Если все методы не сработали, возвращаем детальную ошибку
    console.error('❌ Все методы удаления не сработали');
    console.error('📋 Детали ошибок:', errors);
    
    return NextResponse.json(
      { 
        error: 'All delete methods failed',
        details: errors,
        meetingId: id,
        triedUrls: deleteUrls,
        triedMethods: methods
      },
      { status: 500 }
    );
    
  } catch (error) {
    console.error('❌ Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting', details: (error as Error).message },
      { status: 500 }
    );
  }
}