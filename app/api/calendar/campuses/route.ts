import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '@/lib/config/api';

export async function GET(req: NextRequest) {
  try {
    console.log('=== FETCH CAMPUSES API CALLED ===');
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);
    
    // Подготавливаем заголовки с авторизацией
    const headers = getApiHeaders({
      ...(authCookie && { 'Authorization': `Token ${authCookie}` }),
      ...(backendSessionCookie && { 'Cookie': `backend_session=${backendSessionCookie}` })
    });
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CAMPUSES);
    console.log('🔄 Fetching campuses from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log('📡 API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Campuses loaded successfully:', data.results?.length || 0);
      return NextResponse.json(data.results || []);
    } else {
      const errorText = await response.text();
      console.log('❌ API error, status:', response.status);
      console.log('❌ API error response:', errorText);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Error fetching campuses:', error);
    return NextResponse.json([]);
  }
}