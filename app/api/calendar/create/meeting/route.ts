import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://8af0cec014ee.ngrok-free.app';

export async function POST(req: NextRequest) {
  try {
    console.log('=== CREATE MEETING API CALLED ===');
    
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Получаем заголовки авторизации из оригинального запроса
    const originalHeaders = req.headers;
    const cookieHeader = originalHeaders.get('cookie');
    
    console.log('Original cookie header:', cookieHeader);
    
    // Подготавливаем заголовки для внешнего API
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json',
    };
    
    // Добавляем cookie для аутентификации
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('✅ Added Cookie header');
    }
    
    console.log('Headers for external API:', headers);
    
    const externalUrl = `${API_BASE_URL}/auth/calendar/create/meeting/`;
    console.log('Calling external API:', externalUrl);
    
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    console.log('External API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      throw new Error(`External API error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseText = await response.text();
    console.log('External API success response:', responseText);
    
    if (!responseText.trim()) {
      throw new Error('Empty response from external API');
    }
    
    const result = JSON.parse(responseText);
    console.log('✅ Встреча создана через внешний API:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in create meeting API:', error);
    throw error;
  }
}
