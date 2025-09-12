import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://435ee3adc448.ngrok-free.app';

const DEFAULT_MEETING_ROOMS = [
  { 
    id: 1, 
    name: 'Атриум', 
    campus: 1, 
    campus_name: 'Главный корпус', 
    color: '#3B82F6', 
    status: 'active' 
  },
  { 
    id: 2, 
    name: 'Конференц-зал', 
    campus: 1, 
    campus_name: 'Главный корпус', 
    color: '#10B981', 
    status: 'active' 
  },
  { 
    id: 3, 
    name: 'Аудитория 101', 
    campus: 1, 
    campus_name: 'Главный корпус', 
    color: '#F59E0B', 
    status: 'active' 
  },
  { 
    id: 4, 
    name: 'Аудитория 201', 
    campus: 2, 
    campus_name: 'Корпус А', 
    color: '#EF4444', 
    status: 'active' 
  },
  { 
    id: 5, 
    name: 'Переговорная 301', 
    campus: 2, 
    campus_name: 'Корпус А', 
    color: '#8B5CF6', 
    status: 'active' 
  },
  { 
    id: 6, 
    name: 'Зал заседаний', 
    campus: 3, 
    campus_name: 'Корпус Б', 
    color: '#06B6D4', 
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
    return NextResponse.json(Array.isArray(data) ? data : DEFAULT_MEETING_ROOMS);
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

