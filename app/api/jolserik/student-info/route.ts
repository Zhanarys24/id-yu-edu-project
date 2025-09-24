import { NextRequest, NextResponse } from 'next/server';

// Определяем типы для API ответов
interface ProfileData {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

interface AcademicData {
  faculty?: string;
  course?: number;
  group?: string;
  gpa?: number;
  scholarship_status?: boolean;
  scholarship_amount?: number;
  dormitory_place?: boolean;
  dormitory_building?: string;
  dormitory_room?: string;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  try {
    console.log('=== JOLSERIK STUDENT INFO API CALLED ===');
    
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    console.log('🔐 Auth cookie exists:', !!authCookie);
    console.log('🔐 Backend session exists:', !!backendSessionCookie);
    
    if (!authCookie && !backendSessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Получаем профиль пользователя
    const profileUrl = 'https://id.yu.edu.kz/api/users/me/';
    console.log('📡 Fetching profile from:', profileUrl);
    
    const profileResponse = await fetch(profileUrl, { method: 'GET', headers });
    
    if (!profileResponse.ok) {
      console.log('❌ Profile API failed:', profileResponse.status);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 401 });
    }
    
    const profileData: ProfileData = await profileResponse.json();
    console.log('👤 Profile data received:', JSON.stringify(profileData, null, 2));

    // Добавьте эти строки для отладки:
    console.log('🎓 Student field exists:', !!profileData.student);
    console.log('�� Student field type:', typeof profileData.student);
    if (profileData.student) {
      console.log('🎓 Student field content:', JSON.stringify(profileData.student, null, 2));
    }

    // Извлекаем данные студента из поля student
    let studentData: any = {};
    if (profileData.student && typeof profileData.student === 'object') {
      studentData = profileData.student;
      console.log('🎓 Student data extracted:', JSON.stringify(studentData, null, 2));
    }
    
    // Получаем академическую информацию студента
    const academicUrl = 'https://id.yu.edu.kz/api/v1/student/academic-info/';
    console.log('🎓 Fetching academic info from:', academicUrl);
    
    const academicResponse = await fetch(academicUrl, { method: 'GET', headers });
    console.log('🎓 Academic API status:', academicResponse.status);
    
    let academicData: AcademicData = {};
    if (academicResponse.ok) {
      academicData = await academicResponse.json();
      console.log('🎓 Academic data received:', JSON.stringify(academicData, null, 2));
    } else {
      const errorText = await academicResponse.text();
      console.log('❌ Academic API error:', errorText);
    }
    
    // Форматируем ответ для Jolserik AI с приоритетом данных из student
    const studentInfo = {
      success: true,
      data: {
        fullName: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        studentNumber: profileData.username || '',
        email: profileData.email || '',
        faculty: getFacultyName(academicData.faculty || studentData.faculty) || extractFacultyFromEmail(profileData.email || '') || 'Не указан',
        course: academicData.course || studentData.course || extractCourseFromStudentData(studentData, profileData) || 'Не указан',
        group: academicData.group || studentData.group || 'Не указана',
        gpa: academicData.gpa || studentData.gpa || 0,
        scholarship: {
          status: academicData.scholarship_status || studentData.scholarship_status || false,
          amount: academicData.scholarship_amount || studentData.scholarship_amount || 0
        },
        dormitory: {
          hasPlace: academicData.dormitory_place || studentData.dormitory_place || false,
          building: academicData.dormitory_building || studentData.dormitory_building || 'Не указано',
          room: academicData.dormitory_room || studentData.dormitory_room || 'Не указано'
        },
        debug: {
          profileKeys: Object.keys(profileData),
          academicKeys: Object.keys(academicData),
          studentKeys: Object.keys(studentData),
          academicApiWorked: academicResponse.ok,
          hasStudentData: !!profileData.student
        }
      }
    };
    
    console.log('✅ Final student info:', JSON.stringify(studentInfo, null, 2));
    return NextResponse.json(studentInfo);
    
  } catch (error) {
    console.error('💥 Student info API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function extractCourseFromStudentData(studentData: any, profileData: any): number | null {
  // Проверяем различные возможные поля в student данных
  const possibleFields = [
    studentData?.course,
    studentData?.year,
    studentData?.level,
    studentData?.current_course,
    studentData?.study_year,
    // Проверяем custom_data если есть
    profileData?.custom_data?.course,
    profileData?.custom_data?.year
  ];
  
  for (const field of possibleFields) {
    if (field && typeof field === 'number' && field > 0 && field <= 6) {
      return field;
    }
  }
  
  // Попробуем извлечь из email или username
  const email = profileData?.email || '';
  const username = profileData?.username || '';
  
  // Если в email есть год поступления (например 22 = 2022 = сейчас 3 курс)
  const currentYear = new Date().getFullYear();
  const yearMatch = email.match(/(\d{2})/);
  if (yearMatch) {
    const twoDigitYear = parseInt(yearMatch[1]);
    const fullYear = twoDigitYear > 50 ? 1900 + twoDigitYear : 2000 + twoDigitYear;
    const courseCalculated = currentYear - fullYear + 1;
    if (courseCalculated > 0 && courseCalculated <= 6) {
      return courseCalculated;
    }
  }
  
  return null;
}

function extractFacultyFromEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  
  // Список сокращений факультетов по email
  const facultyMap: Record<string, string> = {
    'ng': 'Факультет нефти и газа',
    'itfm': 'Факультет информационных технологий', 
    'eco': 'Экономический факультет',
    'law': 'Юридический факультет',
    'med': 'Медицинский факультет',
    'tech': 'Технический факультет'
  };
  
  const lowerEmail = email.toLowerCase();
  for (const [abbr, fullName] of Object.entries(facultyMap)) {
    if (lowerEmail.includes(abbr)) {
      return fullName;
    }
  }
  
  return null;
}

function getFacultyName(facultyData: any): string | null {
  if (!facultyData) return null;
  
  // Если это объект с названиями
  if (typeof facultyData === 'object') {
    return facultyData.name_ru || facultyData.name_kk || facultyData.name_en || null;
  }
  
  // Если это просто строка
  if (typeof facultyData === 'string') {
    return facultyData;
  }
  
  return null;
}
