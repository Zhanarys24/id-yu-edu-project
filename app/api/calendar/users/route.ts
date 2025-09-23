import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://id.yu.edu.kz/api';

export async function GET(req: NextRequest) {
  try {
    console.log('=== FETCH USERS API CALLED ===');
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session cookie exists:', !!backendSessionCookie);
    
    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Добавляем авторизацию если есть токены
    if (authCookie) {
      headers['Authorization'] = `Bearer ${authCookie}`;
    }
    
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    console.log(' Fetching users from:', `${API_BASE_URL}/auth/calendar/users/`);
    
    const response = await fetch(`${API_BASE_URL}/auth/calendar/users/`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log(' Users API response status:', response.status);

    if (!response.ok) {
      console.warn('⚠️ API пользователей недоступен, возвращаем пустой массив');
      return NextResponse.json([]);
    }

    const data = await response.json();
    console.log('✅ Users data received:', data);
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.warn('⚠️ Error fetching users:', error);
    return NextResponse.json([]);
  }
}
