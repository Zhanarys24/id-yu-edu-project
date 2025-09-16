import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://6673d47c36db.ngrok-free.app';

const DEFAULT_CAMPUSES = [
  { id: 1, name: 'Технопарк', status: 'active' }
];

export async function GET() {
  try {
    console.log('Fetching campuses from:', `${API_BASE_URL}/auth/calendar/campuses/`);
    
    const response = await fetch(`${API_BASE_URL}/auth/calendar/campuses/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('Campuses API response status:', response.status);

    if (!response.ok) {
      console.warn('API корпусов недоступен, возвращаем дефолтные');
      return NextResponse.json(DEFAULT_CAMPUSES);
    }

    const data = await response.json();
    console.log('Campuses data received:', data);
    
    // Обрабатываем ответ в формате {count, size, next, previous, results}
    if (data.results && Array.isArray(data.results)) {
      return NextResponse.json(data.results);
    }
    
    return NextResponse.json(Array.isArray(data) ? data : DEFAULT_CAMPUSES);
  } catch (error) {
    console.warn('Error fetching campuses:', error);
    return NextResponse.json(DEFAULT_CAMPUSES);
  }
}
