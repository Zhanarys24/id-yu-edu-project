import { NextRequest, NextResponse } from 'next/server'

interface StudentInfo {
  firstName: string;
  lastName: string;
  group: string;
  faculty: string;
  isAuthenticated: boolean;
  [key: string]: unknown;
}

interface CacheEntry {
  data: StudentInfo;
  timestamp: number;
}

// Добавляем простой in-memory кэш
const studentInfoCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export async function POST(req: NextRequest) {
  try {
    const { message, studentId } = await req.json()
    const lowerMessage = message.toLowerCase()
    
    console.log('🤖 Processing:', message)
    
    // Быстрые ответы
    const quickResponse = getQuickResponse(lowerMessage)
    if (quickResponse) {
      return NextResponse.json({ response: quickResponse })
    }
    
    const studentInfo = await getStudentInfoCached(req)
    
    // Проверяем различные типы вопросов
    if (isScheduleQuestion(lowerMessage)) {
      return await handleScheduleQuestion(message, studentInfo, req)
    }
    
    if (isPersonalInfoQuestion(lowerMessage)) {
      return await handlePersonalInfoQuestion(message, studentInfo)
    }
    
    // ДОБАВЛЯЕМ: Проверка вопросов о справках
    if (isDocumentsQuestion(lowerMessage)) {
      return await handleDocumentsQuestion(message, studentInfo)
    }
    
    return await handleGeneralQuestion(message, studentInfo)
    
  } catch (error) {
    console.error('Ошибка в чат API:', error)
    return NextResponse.json({ 
      error: 'Ошибка обработки запроса' 
    }, { status: 500 })
  }
}

// Быстрые ответы без API вызовов
function getQuickResponse(message: string): string | null {
  const quickAnswers: Record<string, string> = {
    'привет': `👋 **Привет!** Я Jolserik AI - твой помощник в университете!

🎯 **Что я умею:**
• Отвечать на вопросы о расписании
• Помогать с навигацией по кампусу
• Консультировать по документам и справкам
• Подсказывать контакты деканата

💬 **Просто спроси меня!** Например:
• "Где деканат?"
• "Как получить справку?"
• "Где столовая?"`,

    'спасибо': `😊 **Пожалуйста!** Рад помочь! Если есть еще вопросы - обращайтесь!`,

    'пока': `👋 **До свидания!** Удачи в учебе! 🎓`,

    'помощь': `🆘 **Помощь Jolserik AI**

 **Основные функции:**
• 🏢 **Навигация** - "Где деканат?", "Где столовая?"
• 📄 **Документы** - "Как получить справку?"
• 📅 **Расписание** - "Мое расписание"
• 📞 **Контакты** - "Контакты деканата"

💡 **Совет:** Задавайте вопросы простыми словами!`
  }

  return quickAnswers[message] || null
}

// Кэшированное получение информации о студенте
async function getStudentInfoCached(req: NextRequest): Promise<StudentInfo> {
  const cacheKey = 'student_info'
  const now = Date.now()
  
  // Проверяем кэш
  const cached = studentInfoCache.get(cacheKey)
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  
  try {
    const studentInfo = await getStudentInfo(req)
    studentInfoCache.set(cacheKey, { data: studentInfo, timestamp: now })
    return studentInfo
  } catch (error) {
    console.error('Ошибка получения информации о студенте:', error)
    return {
      firstName: 'Гость',
      lastName: '',
      group: '',
      faculty: '',
      isAuthenticated: false
    }
  }
}

// Получение информации о студенте
async function getStudentInfo(req: NextRequest): Promise<StudentInfo> {
  try {
    const authCookie = req.cookies.get('auth')?.value
    if (!authCookie) {
      return {
        firstName: 'Гость',
        lastName: '',
        group: '',
        faculty: '',
        isAuthenticated: false
      }
    }

    const response = await fetch(`${process.env.API_BASE_URL}/auth/student-info/`, {
      headers: {
        'Authorization': `Bearer ${authCookie}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        firstName: data.first_name || 'Студент',
        lastName: data.last_name || '',
        group: data.group || '',
        faculty: data.faculty || '',
        isAuthenticated: true
      }
    }
  } catch (error) {
    console.error('Ошибка API студента:', error)
  }

  return {
    firstName: 'Гость',
    lastName: '',
    group: '',
    faculty: '',
    isAuthenticated: false
  }
}

// Проверка вопросов о расписании
function isScheduleQuestion(message: string): boolean {
  const scheduleKeywords = [
    'расписание', 'расписании', 'пары', 'уроки', 'занятия',
    'когда', 'во сколько', 'время', 'расписании', 'schedule'
  ]
  
  return scheduleKeywords.some(keyword => message.includes(keyword))
}

// Проверка личных вопросов
function isPersonalInfoQuestion(message: string): boolean {
  const personalKeywords = [
    'кто я', 'мои данные', 'мой профиль', 'информация обо мне',
    'мой факультет', 'моя группа', 'мой курс', 'личные данные'
  ]
  
  // Частичное совпадение для длинных фраз
  return personalKeywords.some(keyword => message.includes(keyword))
}

async function handleScheduleQuestion(message: string, studentInfo: StudentInfo, req: NextRequest) {
  // Упрощенный ответ о расписании
  return NextResponse.json({
    response: `📅 **Расписание, ${studentInfo.firstName}**

🔄 Для просмотра актуального расписания:
• Проверьте Platonus: https://platonus.yu.edu.kz
• Обратитесь в деканат: +7 (7292) 40-01-01

📱 Также можете спросить у одногруппников!`
  })
}

async function handlePersonalInfoQuestion(message: string, studentInfo: StudentInfo) {
  if (!studentInfo.isAuthenticated) {
    return NextResponse.json({
      response: ` **Информация о профиле**

🔐 Для просмотра личной информации необходимо войти в систему.

💡 **Как войти:**
• Используйте свой логин и пароль
• Обратитесь в деканат для восстановления доступа`
    })
  }

  return NextResponse.json({
    response: `👤 **Ваш профиль, ${studentInfo.firstName}**

📋 **Личная информация:**
• Имя: ${studentInfo.firstName} ${studentInfo.lastName}
• Группа: ${studentInfo.group}
• Факультет: ${studentInfo.faculty}

💡 **Для изменения данных обратитесь в деканат**`
  })
}

// Проверка вопросов о документах
function isDocumentsQuestion(message: string): boolean {
  const documentsKeywords = [
    'справка', 'справки', 'документ', 'документы', 'получить',
    'заказать', 'оформить', 'выдать', 'транскрипт', 'академическая',
    'справка об обучении', 'справка о зачислении'
  ]
  
  return documentsKeywords.some(keyword => message.includes(keyword))
}

// Добавляем обработчик вопросов о документах
async function handleDocumentsQuestion(message: string, studentInfo: StudentInfo) {
  const lowerMessage = message.toLowerCase()
  
  // Определяем тип справки
  if (lowerMessage.includes('академическая') || lowerMessage.includes('транскрипт')) {
    return NextResponse.json({
      response: `📄 **Академическая справка (транскрипт)**

📋 **Процедура получения:**
1. Обратиться в учебную часть с документами
2. Заполнить заявление на выдачу справки
3. Оплатить госпошлину (если требуется)
4. Получить справку в течение 3-5 рабочих дней

📞 **Контакты:**
• Учебная часть: +7 (7292) 40-01-01
• Часы работы: Пн-Пт 9:00-17:00

 **Документы:** Паспорт, студенческий билет`
    })
  }

  if (lowerMessage.includes('справка об обучении')) {
    return NextResponse.json({
      response: ` **Справка об обучении**

 **Процедура получения:**
1. Обратиться в деканат факультета
2. Написать заявление
3. Получить справку в течение 1-2 дней

 **Контакты деканата:**
• Телефон: +7 (7292) 40-01-01
• Email: dekanat@yu.edu.kz

 **Документы:** Студенческий билет, паспорт`
    })
  }

  // Общий ответ о документах
  return NextResponse.json({
    response: `📄 **Документы и справки**

🎯 **Популярные справки:**
•  Справка об обучении
•  Академическая справка (транскрипт)
• 🏠 Справка о зачислении
• 💰 Справка о стипендии

📞 **Где получить:**
• Деканат факультета
• Учебная часть
• Отдел кадров

💡 **Совет:** Уточните конкретный тип справки для подробной информации!`
  })
}

async function handleGeneralQuestion(message: string, studentInfo: StudentInfo) {
  const lowerMessage = message.toLowerCase()
  const greeting = studentInfo.isAuthenticated ? 
    `${studentInfo.firstName}` : 
    'Гость'

  // Общий ответ для неизвестных вопросов
  return NextResponse.json({
    response: `🤔 **Не совсем понял, ${greeting}**

📋 **Популярные темы:**
• 🏢 "Где деканат?" - местоположение и контакты
• 🍽️ "Где столовая?" - информация о питании
• 📄 "Как получить справку?" - процедуры документов
•  "Мое расписание" - информация о занятиях
• 🏠 "Где общежитие?" - информация о проживании

💡 **Попробуйте переформулировать вопрос или выберите одну из тем выше!**

 **Я помогу с:**
• Навигацией по кампусу
• Информацией о деканате
• Навигацией по кампусу
• Получением справок`
  })
}
