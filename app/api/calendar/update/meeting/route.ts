import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, buildApiUrl, getApiHeaders } from '@/lib/config/api';

export async function PUT(req: NextRequest) {
  try {
    console.log('=== UPDATE MEETING API CALLED ===');
    
    const body = await req.json();
    console.log('📋 Request body received:', JSON.stringify(body, null, 2));
    
    // Получаем ID мероприятия из body
    const { id, ...meetingData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }
    
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
    
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.UPDATE_MEETING);
    console.log(' Updating meeting at:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ id, ...meetingData }),
    });
    
    console.log('📡 API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Meeting updated successfully:', data);
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
    console.error('❌ Error in update meeting API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}