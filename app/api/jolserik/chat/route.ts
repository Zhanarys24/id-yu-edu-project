import { NextRequest, NextResponse } from 'next/server'

// Добавляем простой in-memory кэш
const studentInfoCache = new Map<string, { data: any, timestamp: number }>();
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

🎯 **Могу помочь с:**
• 📅 "Мое расписание" - занятия
• 👤 "Мой профиль" - личная информация  
• 🏢 "Где деканат?" - навигация
• 📄 "Как получить справку?" - документы

Что интересует? 😊`,

    'спасибо': '😊 Пожалуйста! Рад помочь! Если есть еще вопросы - обращайтесь!',
    'пока': '👋 До свидания! Удачного дня в университете!',
    
    // ОБНОВЛЕННЫЕ локации с прямыми ссылками
    'технопарк': `🏢 **YU Technopark**

📍 **Координаты:** 43.680864, 51.167732

📱 **Телефон (автомаршрут):** 
https://2gis.kz/aktau/directions/points/%7C51.167732%2C43.680864

💻 **Компьютер (открыть место):** 
https://2gis.kz/aktau/geo/70000001097492813/51.167732,43.680864

🔬 **Услуги:**
• Стартап-инкубатор
• IT-центр и лаборатории
• Коворкинг пространства

⏰ **Время работы:** Пн-Пт 9:00-18:00
📞 **Телефон:** +7 (7292) 40-03-01

💡 **Инструкция для компьютера:**
1. Нажмите вторую ссылку
2. На карте нажмите кнопку "Маршрут"
3. Укажите откуда едете`,

'спорт комплекс': `🏋️ **Студенческий спортивный комплекс**

📍 **Координаты:** 43.685380, 51.165561

📱 **Телефон (автомаршрут):** 
https://2gis.kz/aktau/directions/points/%7C51.165561%2C43.685380

💻 **Компьютер (открыть место):** 
https://2gis.kz/aktau/geo/70030076138753705/51.165561,43.685380

🏊 **Услуги:**
• Спортзалы и бассейн
• Тренажерный зал
• Бесплатно для студентов!

⏰ **Время работы:** Пн-Пт 6:00-22:00, Сб-Вс 8:00-20:00
📞 **Телефон:** +7 (7292) 40-04-01

💡 **На компьютере:** Вторая ссылка → кнопка "Маршрут"`,

'общежитие 3': `🏠 **Общежитие №3**

📍 **Координаты:** 43.684928, 51.168348

📱 **Телефон (автомаршрут):** 
https://2gis.kz/aktau/directions/points/%7C51.168348%2C43.684928

💻 **Компьютер (открыть место):** 
https://2gis.kz/aktau/geo/70000001028382451/51.168348,43.684928

💰 **Стоимость:** 
• 1-местные: 9000₸/месяц
• 2-местные: 7000₸/месяц

🛏️ **Удобства:** кухни, прачечная, Wi-Fi
📞 **Комендант:** +7 (7292) 40-02-04

💡 **На ПК:** Вторая ссылка → "Маршрут" → укажите откуда`,

'общежитие 4': `🏠 **Общежитие №4 (новое)**

📍 **Координаты:** 43.684070, 51.169297

📱 **Телефон (автомаршрут):** 
https://2gis.kz/aktau/directions/points/%7C51.169297%2C43.684070

💻 **Компьютер (открыть место):** 
https://2gis.kz/aktau/geo/70000001081159673/51.169297,43.684070

💰 **Стоимость:** 8500₸/месяц  
🆕 **Особенности:** 
• Кухни-студии
• Библиотека
• Кафе в здании
• Медпункт

📞 **Комендант:** +7 (7292) 40-02-05

💡 **ПК:** Вторая ссылка → кнопка "Маршрут"`,

'главный корпус': `🏛️ **Yessenov University (главный корпус)**

📍 **Координаты:** 43.681465, 51.168418

📱 **Телефон (автомаршрут):** 
https://2gis.kz/aktau/directions/points/%7C51.168418%2C43.681465

💻 **Компьютер (открыть место):** 
https://2gis.kz/aktau/geo/70000001028382321/51.168418,43.681465

🏢 **Что внутри:**
• **2 этаж:** Деканаты всех факультетов
• **4 этаж:** Ректорат и администрация  
• **1 этаж:** Столовая и библиотека

⏰ **Время работы:** Пн-Пт 8:00-18:00
📞 **Справочная:** +7 (7292) 40-01-00

💡 **На компьютере:** Вторая ссылка → "Построить маршрут"`
  };

  const lowerMessage = message.toLowerCase().trim()
  
  for (const [keyword, response] of Object.entries(quickAnswers)) {
    if (lowerMessage === keyword || lowerMessage.includes(keyword)) {
      if (quickAnswers[response]) {
        return quickAnswers[response];
      }
      return response;
    }
  }

  return null;
}

// Кэширование данных студента
async function getStudentInfoCached(req: NextRequest) {
  const cacheKey = 'student_info';
  const cached = studentInfoCache.get(cacheKey);
  
  // Проверяем кэш
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('📦 Using cached student info');
    return cached.data;
  }
  
  // Получаем свежие данные
  try {
    const baseUrl = req.url.split('/jolserik')[0]
    const response = await fetch(`${baseUrl}/jolserik/student-info`, {
      method: 'GET',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
        'Authorization': req.headers.get('authorization') || ''
      }
    })

    if (response.ok) {
      const data = await response.json()
      const studentInfo = {
        isAuthenticated: true,
        fullName: data.data?.fullName || 'Студент',
        firstName: data.data?.fullName?.split(' ')[0] || 'Студент',
        studentNumber: data.data?.studentNumber || '',
        email: data.data?.email || '',
        faculty: data.data?.faculty || '',
        course: data.data?.course || 1,
        group: data.data?.group || '',
        gpa: data.data?.gpa || 0
      }
      
      // Сохраняем в кэш
      studentInfoCache.set(cacheKey, { data: studentInfo, timestamp: Date.now() });
      console.log('💾 Student info cached');
      
      return studentInfo;
    }
  } catch (error) {
    console.log('⚠️ Failed to fetch student info:', error)
  }

  return {
    isAuthenticated: false,
    fullName: 'Гость',
    firstName: 'Гость'
  }
}

function isScheduleQuestion(message: string): boolean {
  const scheduleKeywords = [
    'расписание', 'пары', 'занятия', 'лекция', 'семинар',
    'когда', 'во сколько', 'где проходит', 'следующая пара',
    'сегодня', 'завтра', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница',
    'математика', 'физика', 'химия', 'история', 'философия'
  ]
  
  return scheduleKeywords.some(keyword => message.includes(keyword))
}

function isPersonalInfoQuestion(message: string): boolean {
  const personalKeywords = [
    // Правильные варианты
    'мое имя', 'как меня зовут', 'мой профиль', 'моя информация',
    'мой курс', 'моя группа', 'мой gpa', 'моя успеваемость',
    'кто я', 'мои данные', 'студенческий номер',
    'мой факультет', 'моя специальность',
    
    // Варианты с опечатками и сокращениями
    'мой прфиль', 'мой профи', 'профиль', 'прфиль',
    'моя инфармация', 'моя инфо', 'инфо',
    'мой курсэ', 'курс', 'курсэ',
    'факультет', 'специальность', 'группа',
    'мои данны', 'данные',
    
    // Короткие варианты
    'профиль', 'инфо', 'данные', 'курс', 'группа', 'факультет'
  ]
  
  const lowerMessage = message.toLowerCase().trim()
  
  // Точное совпадение для коротких фраз
  if (personalKeywords.includes(lowerMessage)) {
    return true
  }
  
  // Частичное совпадение для длинных фраз
  return personalKeywords.some(keyword => lowerMessage.includes(keyword))
}

async function handleScheduleQuestion(message: string, studentInfo: any, req: NextRequest) {
  // Упрощенный ответ о расписании
  return NextResponse.json({
    response: `📅 **Расписание, ${studentInfo.firstName}**

🔄 Для просмотра актуального расписания:
• Проверьте Platonus: https://platonus.yu.edu.kz
• Обратитесь в деканат: +7 (7292) 40-01-01

📱 Также можете спросить у одногруппников!`
  })
}

async function handlePersonalInfoQuestion(message: string, studentInfo: any) {
  if (!studentInfo.isAuthenticated) {
    return NextResponse.json({
      response: "🔐 Для просмотра личной информации войдите в систему"
    })
  }

  const lowerMessage = message.toLowerCase().trim()

  // Проверяем различные варианты вопросов о профиле
  const profileVariants = ['профиль', 'прфиль', 'профи', 'инфо', 'информация', 'данные']
  const isProfileQuestion = profileVariants.some(variant => lowerMessage.includes(variant))

  const facultyVariants = ['факультет', 'специальность']
  const isFacultyQuestion = facultyVariants.some(variant => lowerMessage.includes(variant))

  const courseVariants = ['курс', 'курсэ', 'группа']
  const isCourseQuestion = courseVariants.some(variant => lowerMessage.includes(variant))

  const nameVariants = ['имя', 'зовут']
  const isNameQuestion = nameVariants.some(variant => lowerMessage.includes(variant))

  if (isNameQuestion) {
    return NextResponse.json({
      response: `👋 **Привет, ${studentInfo.firstName}!**

📋 **Ваша информация:**
• **Полное имя:** ${studentInfo.fullName}
• **Студенческий номер:** ${studentInfo.studentNumber}

😊 Приятно познакомиться! Чем могу помочь?`
    })
  }

  if (isFacultyQuestion) {
    return NextResponse.json({
      response: `🏛️ **Ваш факультет:** ${studentInfo.faculty}

🎓 **Курс:** ${studentInfo.course} • **Группа:** ${studentInfo.group}

📞 **Деканат:** +7 (7292) 40-01-01
📍 **Местоположение:** Главный корпус, 2 этаж`
    })
  }

  if (isCourseQuestion) {
    return NextResponse.json({
      response: `🎓 **Академическая информация:**

• **Курс:** ${studentInfo.course}
• **Группа:** ${studentInfo.group}
• **Факультет:** ${studentInfo.faculty}
• **Средний балл (GPA):** ${studentInfo.gpa}

📚 Если нужна помощь с учебными вопросами, обращайтесь!`
    })
  }

  // Полный профиль (по умолчанию)
  return NextResponse.json({
    response: `👤 **Ваш профиль:**

• **Имя:** ${studentInfo.fullName}
• **Студенческий номер:** ${studentInfo.studentNumber}
• **Email:** ${studentInfo.email}
• **Курс:** ${studentInfo.course}
• **Группа:** ${studentInfo.group}
• **Факультет:** ${studentInfo.faculty}
• **GPA:** ${studentInfo.gpa}

💡 **Могу помочь с:**
• Расписанием занятий
• Информацией о деканате
• Навигацией по кампусу
• Получением справок`
  })
}

async function handleGeneralQuestion(message: string, studentInfo: any) {
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
• 💻 "Проблемы с Platonus" - IT-поддержка
• 🏠 "Общежитие" - вопросы проживания

📞 **Контакты для помощи:**
• Деканат: +7 (7292) 40-01-01
• IT-поддержка: +7 (7292) 40-01-05

💡 Попробуйте переформулировать вопрос!`
  })
}

// Добавляем функцию проверки вопросов о документах
function isDocumentsQuestion(message: string): boolean {
  const documentsKeywords = [
    'справка', 'справки', 'справку', 'справок',
    'документ', 'документы', 'документов',
    'заявление', 'заявления', 'заявку',
    'получение', 'получить', 'получением',
    'как получить', 'где получить',
    'статус', 'готова ли',
    'академическая справка', 'справка об обучении',
    'транскрипт', 'выписка'
  ]
  
  const lowerMessage = message.toLowerCase()
  return documentsKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Добавляем обработчик вопросов о документах
async function handleDocumentsQuestion(message: string, studentInfo: any) {
  const lowerMessage = message.toLowerCase()
  
  // Определяем тип справки
  if (lowerMessage.includes('академическая') || lowerMessage.includes('транскрипт')) {
    return NextResponse.json({
      response: `📄 **Академическая справка (транскрипт)**

📋 **Процедура получения:**
1. Обратиться в учебную часть с документами
2. Заполнить заявление на выдачу справки
3. Оплатить госпошлину 1000 тенге
4. Получить справку через 5 рабочих дней

📑 **Необходимые документы:**
• Паспорт (оригинал)
• Студенческий билет
• Квитанция об оплате

💰 **Стоимость:** 1000 тенге
⏱️ **Срок:** 5 рабочих дней

📞 **Учебная часть:** +7 (7292) 40-01-03`
    })
  }
  
  if (lowerMessage.includes('справка об обучении') || lowerMessage.includes('справка о')) {
    return NextResponse.json({
      response: `📄 **Справка об обучении**

📋 **Процедура получения:**
1. Обратиться в деканат с документами
2. Заполнить заявление на выдачу справки
3. Оплатить госпошлину 500 тенге
4. Получить справку через 3 рабочих дня

📑 **Необходимые документы:**
• Паспорт (оригинал)
• Студенческий билет
• Квитанция об оплате

💰 **Стоимость:** 500 тенге
⏱️ **Срок:** 3 рабочих дня

📞 **Деканат:** +7 (7292) 40-01-01
📍 **Местоположение:** Главный корпус, 2 этаж, каб. 201-205`
    })
  }
  
  // Общий ответ о получении справок
  return NextResponse.json({
    response: `📄 **Получение справок и документов**

📋 **Основные виды справок:**

🔹 **Справка об обучении**
• Стоимость: 500 тенге
• Срок: 3 рабочих дня
• Где: Деканат (каб. 201-205)

🔹 **Академическая справка (транскрипт)**
• Стоимость: 1000 тенге  
• Срок: 5 рабочих дней
• Где: Учебная часть

🔹 **Справка о стипендии**
• Бесплатно
• Срок: 1 рабочий день
• Где: Студенческий отдел

📑 **Общие требования:**
• Паспорт + студенческий билет
• Заполненное заявление
• Оплата госпошлины

📞 **Контакты:**
• Деканат: +7 (7292) 40-01-01
• Учебная часть: +7 (7292) 40-01-03
• Студенческий отдел: +7 (7292) 40-01-04

💡 Какую именно справку вам нужно получить?`
  })
}
