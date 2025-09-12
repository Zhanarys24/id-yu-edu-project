import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://435ee3adc448.ngrok-free.app';

const DEFAULT_PERSONNEL = [
  { id: 1, full_name: 'Иванов Иван Иванович', work_phone: '+7 (777) 123-45-67' },
  { id: 2, full_name: 'Петров Петр Петрович', work_phone: '+7 (777) 234-56-78' },
  { id: 3, full_name: 'Сидоров Сидор Сидорович', work_phone: '+7 (777) 345-67-89' },
  { id: 4, full_name: 'Козлова Анна Сергеевна', work_phone: '+7 (777) 456-78-90' },
  { id: 5, full_name: 'Нурсултанов Айдар Касымович', work_phone: '+7 (777) 567-89-01' }
];

export async function GET() {
  try {
    console.log('Fetching personnel from:', `${API_BASE_URL}/auth/calendar/personnel/`);
    
    const response = await fetch(`${API_BASE_URL}/auth/calendar/personnel/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('Personnel API response status:', response.status);

    if (!response.ok) {
      console.warn('API персонала недоступен, возвращаем дефолтные данные');
      return NextResponse.json(DEFAULT_PERSONNEL);
    }

    const data = await response.json();
    console.log('Personnel data received:', data);
    return NextResponse.json(Array.isArray(data) ? data : DEFAULT_PERSONNEL);
  } catch (error) {
    console.warn('Error fetching personnel:', error);
    return NextResponse.json(DEFAULT_PERSONNEL);
  }
}

