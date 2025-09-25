import { NextRequest, NextResponse } from 'next/server';

// Типы для расписания
interface ScheduleItem {
  time_start?: string;
  time_end?: string;
  subject_name?: string;
  teacher_name?: string;
  room_number?: string;
  building_name?: string;
  lesson_type?: string;
  status?: string;
  [key: string]: any;
}

interface ScheduleResponse {
  results?: ScheduleItem[];
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  try {
    console.log('=== JOLSERIK SCHEDULE API CALLED ===');
    
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session exists:', !!backendSessionCookie);
    console.log('📅 Requesting date:', date);
    
    if (!authCookie && !backendSessionCookie) {
      console.log('❌ No auth cookies found');
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Требуется авторизация для просмотра расписания' 
      }, { status: 401 });
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    if (authCookie) {
      headers['Authorization'] = `Token ${authCookie}`;
    }
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    // Запрос расписания студента
    const url = `https://id.yu.edu.kz/api/v1/student/schedule/?date=${date}`;
    console.log('🔄 Fetching schedule from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data: ScheduleResponse = await response.json();
      console.log('✅ Schedule data received:', JSON.stringify(data, null, 2));
      
      // Проверяем, есть ли данные
      if (!data.results || data.results.length === 0) {
        console.log('⚠️ No schedule data found');
        return NextResponse.json({
          success: false,
          message: 'Расписание не найдено для указанной даты',
          date,
          hasData: false
        });
      }
      
      // Форматируем данные для Jolserik AI
      const formattedSchedule = {
        success: true,
        date,
        classes: data.results.map((item: ScheduleItem) => ({
          time: `${item.time_start}-${item.time_end}`,
          subject: item.subject_name || 'Предмет не указан',
          teacher: item.teacher_name || 'Преподаватель не указан',
          room: item.room_number || 'Аудитория не указана',
          building: item.building_name || 'Корпус не указан',
          type: item.lesson_type || 'Тип не указан',
          status: item.status || 'active'
        }))
      };
      
      console.log('✅ Formatted schedule:', formattedSchedule);
      return NextResponse.json(formattedSchedule);
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, errorText);
      
      return NextResponse.json({ 
        error: 'Failed to fetch schedule',
        status: response.status,
        message: errorText || 'Ошибка получения расписания',
        apiUrl: url
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('💥 Schedule API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Внутренняя ошибка сервера при получении расписания',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
