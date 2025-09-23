import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('=== FETCH EDUCATION APPLICATIONS API CALLED ===');
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);
    
    // Если пользователь не авторизован, возвращаем пустой результат
    if (!authCookie && !backendSessionCookie) {
      console.log('❌ User not authorized');
      return NextResponse.json({
        count: 0,
        results: []
      });
    }
    
    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    // Добавляем авторизацию
    if (authCookie) {
      headers['Authorization'] = `Token ${authCookie}`;
    }
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    console.log('📤 Headers being sent:', headers);
    
    const url = 'https://id.yu.edu.kz/api/v1/site_applications/';
    console.log('🔄 Fetching applications from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log('📡 API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Applications loaded successfully:', data.results?.length || 0);
      return NextResponse.json(data, { status: response.status });
    } else {
      const errorText = await response.text();
      console.log('❌ API error, status:', response.status);
      console.log('❌ API error response:', errorText);
      
      return NextResponse.json({
        count: 0,
        results: []
      });
    }
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    return NextResponse.json({
      count: 0,
      results: []
    });
  }
}