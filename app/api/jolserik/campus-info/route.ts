import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.toLowerCase() || '';
    
    // Статическая база данных кампуса (можно потом перенести в базу данных)
    const campusLocations = {
      'деканат': {
        name: 'Деканат',
        building: 'Главный корпус',
        floor: 2,
        room: '201-205',
        workingHours: 'Пн-Пт 9:00-17:00',
        phone: '+7 (7292) 40-01-01',
        directions: [
          'Войдите в главный вход',
          'Поднимитесь на 2 этаж',
          'Поверните направо по коридору'
        ]
      },
      'столовая': {
        name: 'Столовая',
        building: 'Главный корпус',
        floor: 1,
        room: 'Столовая',
        workingHours: '8:00-16:00',
        phone: '+7 (7292) 40-01-20',
        services: ['Комплексные обеды: 800-1200 тенге', 'Горячие напитки', 'Выпечка']
      },
      'библиотека': {
        name: 'Научная библиотека',
        building: 'Главный корпус',
        floor: 1,
        room: 'Библиотека',
        workingHours: 'Пн-Пт: 8:00-18:00, Сб: 9:00-15:00',
        phone: '+7 (7292) 40-01-30',
        services: ['Читальный зал (200 мест)', 'Электронные ресурсы', 'Ксерокопирование']
      }
    };
    
    // Поиск локации
    const foundLocations = Object.entries(campusLocations)
      .filter(([key, value]) => 
        key.includes(query) || 
        value.name.toLowerCase().includes(query) ||
        value.building.toLowerCase().includes(query)
      )
      .map(([key, value]) => value);
    
    return NextResponse.json({
      success: true,
      data: foundLocations
    });
  } catch (error) {
    console.error('❌ Error fetching campus info:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}