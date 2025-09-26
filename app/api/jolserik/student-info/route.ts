import { NextRequest, NextResponse } from 'next/server';

// Определяем типы для API ответов
interface ProfileData {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  student?: StudentData;
  custom_data?: CustomData;
  [key: string]: unknown;
}

interface StudentData {
  course?: number;
  year?: number;
  level?: number;
  current_course?: number;
  study_year?: number;
  faculty?: FacultyData | string;
  group?: string;
  [key: string]: unknown;
}

interface FacultyData {
  name_ru?: string;
  name_kk?: string;
  name_en?: string;
  [key: string]: unknown;
}

interface CustomData {
  course?: number;
  year?: number;
  [key: string]: unknown;
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
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  try {
    console.log('=== JOLSERIK STUDENT INFO API CALLED ===');
    
    const authCookie = req.cookies.get('auth')?.value;
    const backendSessionCookie = req.cookies.get('backend_session')?.value;
    
    if (!authCookie) {
      return NextResponse.json({ 
        error: 'Authentication required',
        isAuthenticated: false 
      }, { status: 401 });
    }
    
    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authCookie}`,
      'Content-Type': 'application/json',
    };
    
    if (backendSessionCookie) {
      headers['Cookie'] = `backend_session=${backendSessionCookie}`;
    }
    
    // Получаем профиль пользователя
    const profileUrl = 'https://id.yu.edu.kz/api/v1/user/profile/';
    console.log(' Fetching profile from:', profileUrl);
    
    const profileResponse = await fetch(profileUrl, { method: 'GET', headers });
    console.log('👤 Profile API status:', profileResponse.status);
    
    if (!profileResponse.ok) {
      console.error('❌ Profile API failed:', profileResponse.status);
      return NextResponse.json({ 
        error: 'Failed to fetch profile',
        isAuthenticated: false 
      }, { status: profileResponse.status });
    }
    
    const profileData: ProfileData = await profileResponse.json();
    console.log(' Profile data received:', JSON.stringify(profileData, null, 2));

    // Извлекаем данные студента из поля student
    let studentData: StudentData = {};
    if (profileData.student && typeof profileData.student === 'object') {
      studentData = profileData.student;
      console.log(' Student data extracted:', JSON.stringify(studentData, null, 2));
    }
    
    // Получаем академическую информацию студента
    const academicUrl = 'https://id.yu.edu.kz/api/v1/student/academic-info/';
    console.log('🎓 Fetching academic info from:', academicUrl);
    
    const academicResponse = await fetch(academicUrl, { method: 'GET', headers });
    console.log('🎓 Academic API status:', academicResponse.status);
    
    let academicData: AcademicData = {};
    if (academicResponse.ok) {
      academicData = await academicResponse.json();
      console.log(' Academic data received:', JSON.stringify(academicData, null, 2));
    } else {
      console.log('⚠️ Academic API not available, using profile data only');
    }
    
    // Определяем курс студента
    const course = extractCourseFromStudentData(studentData, profileData);
    console.log('🎓 Extracted course:', course);
    
    // Определяем факультет
    const faculty = getFacultyName(studentData.faculty || academicData.faculty);
    console.log('🏛️ Faculty:', faculty);
    
    // Формируем итоговый ответ
    const studentInfo = {
      isAuthenticated: true,
      firstName: profileData.first_name || 'Студент',
      lastName: profileData.last_name || '',
      username: profileData.username || '',
      email: profileData.email || '',
      faculty: faculty || 'Не указан',
      course: course || 1,
      group: studentData.group || academicData.group || 'Не указана',
      gpa: academicData.gpa || 0,
      scholarshipStatus: academicData.scholarship_status || false,
      scholarshipAmount: academicData.scholarship_amount || 0,
      dormitoryPlace: academicData.dormitory_place || false,
      dormitoryBuilding: academicData.dormitory_building || '',
      dormitoryRoom: academicData.dormitory_room || '',
      rawData: {
        profile: profileData,
        student: studentData,
        academic: academicData
      }
    };
    
    console.log('✅ Final student info:', JSON.stringify(studentInfo, null, 2));
    
    return NextResponse.json(studentInfo);
    
  } catch (error) {
    console.error('❌ Student info error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch student information',
      isAuthenticated: false 
    }, { status: 500 });
  }
}

function extractCourseFromStudentData(studentData: StudentData, profileData: ProfileData): number | null {
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
  
  return null;
}

function getFacultyName(facultyData: FacultyData | string | undefined): string | null {
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
