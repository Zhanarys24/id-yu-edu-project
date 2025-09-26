import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = process.env.API_BASE_URL + '/api/users/me/';
    const token = req.cookies.get('auth')?.value;
    const authMode = req.cookies.get('auth_mode')?.value;
    const backendSession = req.cookies.get('backend_session')?.value;

    if (!token && !backendSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `${process.env.AUTH_TOKEN_SCHEME || 'Bearer'} ${token}`;
    }
    if (authMode === 'cookie' && (backendSession || token)) {
      headers['Cookie'] = `${process.env.AUTH_BACKEND_COOKIE_NAME || 'sessionid'}=${backendSession || token}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ message: 'Profile service invalid response' }, { status: 502 });
    }

    const data: Record<string, unknown> = await res.json();
    
    // Добавляем отладочную информацию
    console.log(' Raw profile data from backend:', JSON.stringify(data, null, 2));
    
    // Извлекаем данные персонала и студента
    const personnelData = data.personnel as Record<string, unknown> || {};
    const studentData = data.student as Record<string, unknown> || {};
    
    console.log('📞 Phone fields:', {
      phone_number: data.phone_number,
      phone: data.phone,
      mobile: data.mobile,
      personnel_mobile: personnelData.mobile_phone,
      student_mobile: studentData.mobile_phone,
      personnel_work_phone: personnelData.work_phone
    });
    console.log(' Birth date fields:', {
      personnel_birth_date: personnelData.birth_date,
      student_birth_date: studentData.birth_date,
      birth_date: data.birth_date
    });
    
    // Нормализуем аватар
    const rawAvatar = data.image || data.avatar || data.profile_image || null;
    let avatar: string | null = null;
    if (rawAvatar && typeof rawAvatar === 'string') {
      if (rawAvatar.startsWith('http')) {
        avatar = rawAvatar;
      } else {
        avatar = process.env.API_BASE_URL 
          ? process.env.API_BASE_URL + rawAvatar 
          : rawAvatar;
      }
    }
    
    // Универсальная логика извлечения телефона
    const phone = 
      data.phone_number || 
      data.phone || 
      data.mobile || 
      personnelData.mobile_phone || 
      personnelData.work_phone ||
      studentData.mobile_phone || 
      null;
    
    // Универсальная логика извлечения даты рождения
    const birth_date = 
      personnelData.birth_date || 
      studentData.birth_date || 
      data.birth_date || 
      null;
    
    const filteredResponse = {
      username: data.username || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      avatar,
      recovery_email: data.recovery_email || data.reserve_email || null,
      role: data.role || data.user_type || data.user_role || null,
      phone,
      birth_date
    };
    
    console.log('✅ Filtered response:', JSON.stringify(filteredResponse, null, 2));
    
    return NextResponse.json(filteredResponse, { status: res.status });
  } catch (e) {
    const err = e as Error
    return NextResponse.json({ message: err.message || 'Profile proxy error' }, { status: 500 });
  }
}


