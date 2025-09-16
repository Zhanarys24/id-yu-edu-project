import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://6673d47c36db.ngrok-free.app';

const DEFAULT_MEETING_ROOMS = [
  { 
    id: 1, 
    name: 'Кабинет номер 2', 
    campus: 1, 
    campus_name: 'Технопарк', 
    color: '#07F', 
    status: 'active' 
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get('campus');
    
    const url = campusId 
      ? `${API_BASE_URL}/auth/calendar/meeting-rooms/?campus=${campusId}`
      : `${API_BASE_URL}/auth/calendar/meeting-rooms/`;
    
    console.log('Fetching meeting rooms from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store',
    });

    console.log('Meeting rooms API response status:', response.status);

    if (!response.ok) {
      console.warn('API мест встреч недоступен, возвращаем дефолтные');
      const filteredRooms = campusId 
        ? DEFAULT_MEETING_ROOMS.filter(room => room.campus === parseInt(campusId))
        : DEFAULT_MEETING_ROOMS;
      return NextResponse.json(filteredRooms);
    }

    const data = await response.json();
    console.log('Meeting rooms data received:', data);
    
    // Обрабатываем ответ в формате {count, size, next, previous, results}
    let rooms = [];
    if (data.results && Array.isArray(data.results)) {
      rooms = data.results;
    } else if (Array.isArray(data)) {
      rooms = data;
    } else {
      rooms = DEFAULT_MEETING_ROOMS;
    }
    
    // Фильтруем по корпусу если указан
    if (campusId) {
      rooms = rooms.filter(room => room.campus === parseInt(campusId));
    }
    
    return NextResponse.json(rooms);
  } catch (error) {
    console.warn('Error fetching meeting rooms:', error);
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get('campus');
    const filteredRooms = campusId 
      ? DEFAULT_MEETING_ROOMS.filter(room => room.campus === parseInt(campusId))
      : DEFAULT_MEETING_ROOMS;
    return NextResponse.json(filteredRooms);
  }
}



