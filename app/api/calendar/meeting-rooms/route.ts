import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '@/lib/config/api';

export async function GET(req: NextRequest) {
  try {
    console.log('=== FETCH MEETING ROOMS API CALLED ===');
    
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get('campus');
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);
    console.log('🏢 Campus ID filter:', campusId);
    
    // Подготавливаем заголовки с авторизацией
    const headers = getApiHeaders({
      ...(authCookie && { 'Authorization': `Token ${authCookie}` }),
      ...(backendSessionCookie && { 'Cookie': `backend_session=${backendSessionCookie}` })
    });
    
    // Строим URL с фильтром по корпусу если указан
    let url = buildApiUrl(API_CONFIG.ENDPOINTS.MEETING_ROOMS);
    if (campusId) {
      url += `?campus=${campusId}`;
    }
    
    console.log('�� Fetching meeting rooms from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log('📡 API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Meeting rooms loaded successfully:', data.results?.length || 0);
      
      // Обрабатываем ответ в формате {count, size, next, previous, results}
      let rooms = [];
      if (data.results && Array.isArray(data.results)) {
        rooms = data.results;
      } else if (Array.isArray(data)) {
        rooms = data;
      }
      
      // Дополнительная фильтрация по корпусу если указан
      if (campusId) {
        rooms = rooms.filter(room => room.campus === parseInt(campusId));
      }
      
      return NextResponse.json(rooms);
    } else {
      const errorText = await response.text();
      console.log('❌ API error, status:', response.status);
      console.log('❌ API error response:', errorText);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Error fetching meeting rooms:', error);
    return NextResponse.json([]);
  }
}