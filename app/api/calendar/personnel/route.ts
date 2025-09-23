import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '@/lib/config/api';

export async function GET(request: NextRequest) {
  try {
    console.log('=== FETCH PERSONNEL API CALLED ===');
    
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '100';

    // Получаем cookies для авторизации
    const authCookie = request.cookies.get('auth')?.value;
    const backendSessionCookie = request.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);

    // Подготавливаем заголовки с авторизацией
    const headers = getApiHeaders({
      ...(authCookie && { 'Authorization': `Token ${authCookie}` }),
      ...(backendSessionCookie && { 'Cookie': `backend_session=${backendSessionCookie}` })
    });

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.PERSONNEL) + `?page=${page}&size=${size}`;
    console.log(' Загружаем персонал из API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log(' API ответ статус:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API error, status:', response.status);
      console.log('❌ API error response:', errorText);
      return NextResponse.json({
        count: 0,
        size: 0,
        next: null,
        previous: null,
        results: []
      });
    }

    const data = await response.json();
    console.log('✅ Personnel loaded successfully:', data.results?.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching personnel:', error);
    return NextResponse.json({
      count: 0,
      size: 0,
      next: null,
      previous: null,
      results: []
    });
  }
}



