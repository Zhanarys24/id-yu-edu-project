import { NextRequest, NextResponse } from 'next/server';

// Временные данные из API (пока не работает авторизация)
const TEMP_API_DATA = [
  // ... все 14 приложений
];

export async function GET(req: NextRequest) {
  try {
    const url = 'https://id.yu.edu.kz/api/v1/site_applications/';
    
    console.log('Попытка запроса к API без авторизации...');
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('API Response status:', res.status);

    if (res.ok) {
      const data = await res.json();
      console.log('✅ API работает без авторизации:', data.results?.length || 0);
      return NextResponse.json(data, { status: res.status });
    } else {
      console.log('❌ API требует авторизацию, используем статические данные');
      return NextResponse.json({
        count: TEMP_API_DATA.length,
        results: TEMP_API_DATA
      });
    }
  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json({
      count: TEMP_API_DATA.length,
      results: TEMP_API_DATA
    });
  }
}
