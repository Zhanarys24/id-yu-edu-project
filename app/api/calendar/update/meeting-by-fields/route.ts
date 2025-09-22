import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://dba33ae368da.ngrok-free.app';

export async function PUT(req: NextRequest) {
  try {
    console.log('=== UPDATE MEETING BY FIELDS API CALLED ===');
    
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { searchFields, updatedData } = body;
    
    if (!searchFields || !updatedData) {
      return NextResponse.json(
        { error: 'Search fields and updated data are required' },
        { status: 400 }
      );
    }
    
    // Получаем cookies для авторизации
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (authCookie) {
      headers['Authorization'] = `Bearer ${authCookie}`;
    }
    
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    console.log('🔍 Ищем мероприятие по полям:', searchFields);
    console.log('📝 Обновляем данными:', updatedData);
    
    // Попробуем разные endpoints для получения мероприятий с ID
    const endpoints = [
      '/auth/calendar/meetings/',
      '/auth/calendar/meetings',
      '/auth/calendar/meeting/',
      '/auth/calendar/all_meetings/'
    ];
    
    let foundMeeting = null;
    let meetingId = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(' Пробуем endpoint:', `${API_BASE_URL}${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers,
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          const meetings = data.results || data;
          
          // Ищем мероприятие по полям
          foundMeeting = meetings.find((meeting: any) => {
            return meeting.campus === searchFields.campus &&
                   meeting.location === searchFields.location &&
                   meeting.date === searchFields.date &&
                   meeting.time_start === searchFields.time_start &&
                   meeting.time_end === searchFields.time_end;
          });
          
          if (foundMeeting) {
            // Проверяем, есть ли ID
            meetingId = foundMeeting.id || foundMeeting.pk || foundMeeting.uuid;
            if (meetingId) {
              console.log(`✅ Найдено мероприятие с ID ${meetingId} в ${endpoint}`);
              break;
            }
          }
        }
      } catch (error) {
        console.log(`❌ Ошибка для ${endpoint}:`, error);
      }
    }
    
    if (!foundMeeting) {
      console.error('❌ Мероприятие не найдено по указанным полям');
      return NextResponse.json(
        { error: 'Meeting not found with specified fields' },
        { status: 404 }
      );
    }
    
    if (!meetingId) {
      console.error('❌ У найденного мероприятия нет ID');
      return NextResponse.json(
        { error: 'Found meeting has no ID' },
        { status: 400 }
      );
    }
    
    console.log('✅ Найдено мероприятие:', foundMeeting);
    console.log('🆔 ID мероприятия:', meetingId);
    
    // Попробуем разные URL для обновления
    const updateUrls = [
      `${API_BASE_URL}/auth/calendar/change/meeting/${meetingId}/`,
      `${API_BASE_URL}/auth/calendar/meetings/${meetingId}/`,
      `${API_BASE_URL}/auth/calendar/meeting/${meetingId}/`,
    ];
    
    // Попробуем разные HTTP методы
    const methods = ['POST', 'PATCH', 'PUT'];
    
    const errors: string[] = [];
    
    for (const updateUrl of updateUrls) {
      console.log(' Пробуем URL:', updateUrl);
      
      for (const method of methods) {
        try {
          console.log(`🔄 Пробуем ${method} для ${updateUrl}`);
          
          const response = await fetch(updateUrl, {
            method,
            headers,
            body: JSON.stringify(updatedData),
          });

          console.log(` ${method} ${updateUrl} response status:`, response.status);
          
          if (response.ok) {
            const responseText = await response.text();
            console.log(`✅ ${method} успешен для ${updateUrl}:`, responseText);
            
            return NextResponse.json({ 
              success: true, 
              message: 'Мероприятие обновлено успешно',
              method,
              url: updateUrl,
              meetingId,
              response: responseText || 'Empty response'
            });
          } else {
            const errorText = await response.text();
            const errorMsg = `${method} ${updateUrl}: ${response.status} - ${errorText.substring(0, 100)}`;
            console.log(`❌ ${method} ошибка:`, errorMsg);
            errors.push(errorMsg);
          }
        } catch (error) {
          const errorMsg = `${method} ${updateUrl} exception: ${(error as Error).message}`;
          console.log(`❌ ${method} exception:`, errorMsg);
          errors.push(errorMsg);
        }
      }
    }
    
    // Если все методы не сработали, возвращаем детальную ошибку
    console.error('❌ Все методы обновления не сработали');
    console.error('📋 Детали ошибок:', errors);
    
    return NextResponse.json(
      { 
        error: 'All update methods failed',
        details: errors,
        meetingId,
        searchFields,
        updatedData,
        triedUrls: updateUrls,
        triedMethods: methods
      },
      { status: 500 }
    );
    
  } catch (error) {
    console.error('❌ Error updating meeting by fields:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting by fields', details: (error as Error).message },
      { status: 500 }
    );
  }
}
