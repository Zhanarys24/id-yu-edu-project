import { NextRequest, NextResponse } from 'next/server';

// Обновленный URL для вашего API
const API_BASE_URL = 'https://31f494e70eb1.ngrok-free.app';

// Дефолтные данные на случай если API недоступен
const DEFAULT_PERSONNEL = [
  { id: 1, full_name: 'у вас не работает ссылка на персонал', work_phone: '+7 (777) 123-45-67' },
  { id: 2, full_name: 'у вас не работает ссылка на персонал', work_phone: '+7 (777) 234-56-78' },
  { id: 3, full_name: 'у вас не работает ссылка на персонал', work_phone: '+7 (777) 345-67-89' },
  { id: 4, full_name: 'у вас не работает ссылка на персонал', work_phone: '+7 (777) 456-78-90' },
  { id: 5, full_name: 'у вас не работает ссылка на персонал', work_phone: '+7 (777) 567-89-01' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '100';

    const url = `${API_BASE_URL}/auth/calendar/personnel/?page=${page}&size=${size}`;
    console.log(' Загружаем персонал из API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('📡 API ответ статус:', response.status);
    console.log('📡 API ответ headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.warn('⚠️ API персонала недоступен, возвращаем дефолтные данные');
      return NextResponse.json({
        count: DEFAULT_PERSONNEL.length,
        size: DEFAULT_PERSONNEL.length,
        next: null,
        previous: null,
        results: DEFAULT_PERSONNEL
      });
    }

    const responseText = await response.text();
    console.log('📡 API ответ текст (первые 500 символов):', responseText.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Ошибка парсинга JSON:', parseError);
      console.log('📡 Полный ответ:', responseText);
      return NextResponse.json({
        count: DEFAULT_PERSONNEL.length,
        size: DEFAULT_PERSONNEL.length,
        next: null,
        previous: null,
        results: DEFAULT_PERSONNEL
      });
    }

    console.log('✅ Получены данные персонала:', {
      count: data.count,
      results: data.results?.length || 0,
      firstResult: data.results?.[0] || 'нет данных'
    });

    // Возвращаем данные в том же формате что и ваш API
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Ошибка при загрузке персонала:', error);
    return NextResponse.json({
      count: DEFAULT_PERSONNEL.length,
      size: DEFAULT_PERSONNEL.length,
      next: null,
      previous: null,
      results: DEFAULT_PERSONNEL
    });
  }
}



