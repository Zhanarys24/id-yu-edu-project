import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://dba33ae368da.ngrok-free.app';

const DEFAULT_LOCATIONS = [
  { id: 1, name: 'Атриум', campus_id: 1 },
  { id: 2, name: 'Конференц-зал', campus_id: 1 },
  { id: 3, name: 'Аудитория 101', campus_id: 1 },
  { id: 4, name: 'Аудитория 201', campus_id: 2 }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get('campus');
    
    const url = campusId 
    ? `${API_BASE_URL}/auth/calendar/meeting-rooms/?campus=${campusId}`
    : `${API_BASE_URL}/auth/calendar/meeting-rooms/`;
    
    console.log('Fetching locations from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('Locations API response status:', response.status);

    if (!response.ok) {
      console.warn('API мест недоступен, возвращаем дефолтные');
      return NextResponse.json(DEFAULT_LOCATIONS);
    }

    const data = await response.json();
    console.log('Locations data received:', data);
    return NextResponse.json(Array.isArray(data) ? data : DEFAULT_LOCATIONS);
  } catch (error) {
    console.warn('Error fetching locations:', error);
    return NextResponse.json(DEFAULT_LOCATIONS);
  }
}
