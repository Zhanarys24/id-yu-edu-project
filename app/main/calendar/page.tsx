'use client'

import Layout from '@/components/Layout'
import '@/styles/calendar/calendar.css'
import { useState, useRef, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import { EventClickArg } from '@fullcalendar/core'
import { format, parseISO, isSameDay, addMinutes } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { CalendarService, CalendarEvent, CalendarUser, PersonnelSimple, ExternalParticipant } from '@/lib/services/calendarService'
import { LocalStorageService, LocalEvent } from '@/lib/services/localStorageService'
import { WebSocketService } from '@/lib/services/websocketService'


// Используем типы напрямую из сервиса
type Event = CalendarEvent;
type User = CalendarUser;

export default function CalendarPage() {
  const { t, i18n } = useTranslation('common')
  // Состояния для модального окна
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null)
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Показываем 5 секунд
  };

  // Состояния для данных
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [participants, setParticipants] = useState<PersonnelSimple[]>([])
  const [campuses, setCampuses] = useState<Array<{id: number, name: string}>>([])
  const [locations, setLocations] = useState<Array<{id: number, name: string, campus_id: number}>>([])
  const [personnel, setPersonnel] = useState<PersonnelSimple[]>([])
  const [participantSearch, setParticipantSearch] = useState('')

  // Состояния для формы события
  const [newEvent, setNewEvent] = useState({ start: '', color: 'blue' })
  const [eventTitle, setEventTitle] = useState('')
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')
  const [eventColor, setEventColor] = useState('blue')
  const [eventCampus, setEventCampus] = useState<number | null>(null)
  const [eventLocation, setEventLocation] = useState<number | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [eventLink, setEventLink] = useState('')
  const [eventDescription, setEventDescription] = useState('')

  // Рефы и состояния календаря
  const calendarRef = useRef<FullCalendar>(null)
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())

  // Константы
  const places = [
    'Атриум', 
    'Тәуелсіздік холлы', 
    '15 этаж, конференц зал', 
    'Маңғышлақ', 
    'Бозжыра', 
    'Шерқала', 
    'Ақтау, Technopark'
  ]

const lang = i18n?.language || 'ru' // дефолт, если undefined

const weekValue = t('calendarPage.weekdaysShort', { returnObjects: true }) as unknown
const weekdaysShort: string[] = Array.isArray(weekValue)
  ? (weekValue as string[])
  : lang.startsWith('en')
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : lang === 'kz'
      ? ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб', 'Жс']
      : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']


  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log('🚀 Начинаем загрузку данных...');
        
        // Сначала тестируем подключение к API
        const connectionTest = await CalendarService.testConnection();
        console.log('📡 Тест подключения:', connectionTest.message);
        
        if (!connectionTest.success) {
          console.warn('⚠️ Проблема с подключением к API, но продолжаем...');
        }
        
        // Загружаем все данные параллельно, включая участников
        const [meetingsData, usersData, campusesData, locationsData, externalParticipantsData] = await Promise.all([
          CalendarService.getAllMeetings(),
          CalendarService.getUsers(),
          CalendarService.getCampuses(),
          CalendarService.getLocations(),
          CalendarService.getAllExternalParticipants() // ДОБАВЛЯЕМ ЗАГРУЗКУ УЧАСТНИКОВ
        ])
        
        // Преобразуем встречи в события календаря
        const calendarEvents = meetingsData.map(meeting => 
          CalendarService.transformMeetingToEvent(meeting)
        )
        
        // Преобразуем внешних участников в PersonnelSimple для совместимости
        const personnelData = externalParticipantsData.map(participant => 
          CalendarService.transformExternalToPersonnel(participant)
        )
        
        // Валидация и очистка данных событий
        const validEvents = calendarEvents.filter((event) => {
          return event && 
                 typeof event.start === 'string' && 
                 event.start.length > 0 &&
                 typeof event.end === 'string' && 
                 event.end.length > 0 &&
                 event.title
        })
        
        // Валидация данных пользователей
        const validUsers = usersData.filter((user) => {
          return user && user.id && user.name && user.email
        })
        
        // Валидация данных персонала с дедупликацией
        const validPersonnel = personnelData
          .filter((person) => {
            return person && person.id && person.full_name
          })
          .reduce((unique, person) => {
            // Проверяем, есть ли уже участник с таким ID
            const exists = unique.some(p => p.id === person.id);
            if (!exists) {
              unique.push(person);
            }
            return unique;
          }, [] as PersonnelSimple[]);
        
        setEvents(validEvents)
        setUsers(validUsers)
        setPersonnel(validPersonnel) // УСТАНАВЛИВАЕМ УЧАСТНИКОВ
        setCampuses(campusesData)
        setLocations(locationsData)
        
        console.log('✅ Загружено событий:', validEvents.length)
        console.log('✅ Загружено пользователей:', validUsers.length)
        console.log('✅ Загружено участников из внешнего API:', validPersonnel.length)
        console.log('✅ Загружено корпусов:', campusesData.length)
        console.log('✅ Загружено мест:', locationsData.length)
        
      } catch (error) {
        console.error('❌ Ошибка при загрузке данных:', error)
        setEvents([])
        setUsers([])
        setPersonnel([]) // ДОБАВЛЯЕМ СБРОС УЧАСТНИКОВ
        setCampuses([])
        setLocations([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Обработчик клика по дате
  const handleDateClick = (arg: DateClickArg) => {
    console.log('📅 Открываем модальное окно, текущее количество участников:', participants.length);
    setNewEvent({ ...newEvent, start: arg.dateStr })
    setModalOpen(true)
  }

  // Проверка доступности временного слота
  const isTimeSlotAvailable = (startStr: string, endStr: string, place: string): boolean => {
    try {
      const newStart = parseISO(startStr)
      const newEnd = parseISO(endStr)
      
      return !events.some(event => {
        if (!event.place || event.place !== place) return false
        if (!event.start || !event.end) return false
        
        try {
          const eventStart = parseISO(event.start)
          const eventEnd = parseISO(event.end)
          const bufferEnd = addMinutes(eventEnd, 10)
          
          return (newStart < bufferEnd && newEnd > eventStart)
        } catch (error) {
          console.warn('Ошибка при парсинге даты события:', event)
          return false
        }
      })
    } catch (error) {
      console.error('Ошибка при проверке доступности времени:', error)
      return false
    }
  }

  // Валидация формы
  const validateForm = (): string | null => {
    if (!eventTitle.trim()) return 'Название встречи обязательно'
    if (eventTitle.trim().length > 200) return 'Название встречи не должно превышать 200 символов'
    if (!newEvent.start) return 'Дата встречи обязательна'
    if (!eventStart) return 'Время начала обязательно'
    if (!eventEnd) return 'Время окончания обязательно'
    if (!eventLocation) return 'Место встречи обязательно'
    
    // Проверка времени
    if (eventStart >= eventEnd) {
      return 'Время окончания должно быть позже времени начала'
    }
    
    // Проверка даты (не в прошлом)
    const selectedDate = new Date(newEvent.start)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      return 'Нельзя создавать встречи в прошлом'
    }
    
    // Проверка для онлайн встреч
    if (isOnline) {
      if (participants.length === 0) {
        return 'Для онлайн встреч необходимо выбрать участников'
      }
      if (!eventLink.trim()) {
        return 'Для онлайн встреч необходима ссылка'
      }
      // Валидация URL
      try {
        new URL(eventLink.trim())
      } catch {
        return 'Введите корректную ссылку'
      }
    }
    
    return null
  }


  // Обработчик добавления события
  const handleAdd = async () => {
    // Валидация формы
    const validationError = validateForm()
    if (validationError) {
      showToast(validationError, 'error')
      return
    }

    const fullStart = `${newEvent.start}T${eventStart}`
    const fullEnd = `${newEvent.start}T${eventEnd}`

    // Проверка доступности времени и места
    const locationName = locations.find(l => l.id === eventLocation)?.name || 'Неизвестное место';
    if (!isTimeSlotAvailable(fullStart, fullEnd, locationName)) {
      showToast('Выбранное время уже занято в этом месте', 'error')
      return
    }

    // Правильный формат для API
    const meetingData = {
      title: eventTitle.trim(),
      date: newEvent.start,  // YYYY-MM-DD
      time_start: eventStart,  // HH:MM
      time_end: eventEnd,      // HH:MM
      campus: eventCampus,     // ID корпуса
      location: eventLocation, // ID места
      guests: participants.map(p => p.id), // Массив ID участников
      description: eventDescription.trim() || null,
      link: isOnline ? eventLink.trim() : null,
      color: eventColor
    }

    console.log("Создание встречи:", meetingData)

    setLoading(true)
    try {
      // Создаем встречу через API
      const savedMeeting = await CalendarService.createMeeting(meetingData)
      console.log('Встреча создана на сервере:', savedMeeting)
      
      // Преобразуем встречу в событие календаря
      const eventToAdd = CalendarService.transformMeetingToEvent(savedMeeting)
      console.log('Преобразованное событие:', eventToAdd)
      
      setEvents(prev => {
        const newEvents = [...prev, eventToAdd]
        console.log('✅ Добавлено событие, всего:', newEvents.length)
        return newEvents
      })
      
      // Принудительное обновление календаря
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents()
      }
      
      resetForm()
      setModalOpen(false)
      showToast('Встреча успешно создана!', 'success')
      
    } catch (error) {
      console.error('Ошибка при создании встречи:', error)
      const errorMessage = (error as Error).message
      
      // Более детальная обработка ошибок
      if (errorMessage.includes('уже занято')) {
        showToast('Выбранное время и место уже занято. Пожалуйста, выберите другое время или место.', 'error')
      } else if (errorMessage.includes('400')) {
        showToast('Ошибка валидации данных. Проверьте правильность заполнения полей.', 'error')
      } else if (errorMessage.includes('401')) {
        showToast('Ошибка авторизации. Войдите в систему заново.', 'error')
      } else if (errorMessage.includes('403')) {
        showToast('Недостаточно прав для создания встречи.', 'error')
      } else if (errorMessage.includes('500')) {
        showToast('Ошибка сервера. Попробуйте позже.', 'error')
      } else {
        showToast('Ошибка при создании встречи: ' + errorMessage, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // Сброс формы
  const resetForm = () => {
    setEventTitle('')
    setEventStart('')
    setEventEnd('')
    setEventColor('blue')
    setEventCampus(null)
    setEventLocation(null)
    setIsOnline(false)
    setEventLink('')
    setEventDescription('')
    setParticipants([])
    setNewEvent({ start: '', color: 'blue' })
  }

  // Закрытие модального окна
  const handleCloseModal = () => {
    setModalOpen(false)
    setDropdownOpen(false)
    resetForm()
  }

  // Вычисления для мини-календаря
  const startOfMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 1)
  const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1
  const daysInMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 0).getDate()
  const daysInPrev = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 0).getDate()
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7

  // Создание ячеек для мини-календаря
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDay + 1
    let date = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), dayNum)
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth
    
    if (!inMonth) {
      if (dayNum < 1) {
        date = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1, daysInPrev + dayNum)
      } else {
        date = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, dayNum - daysInMonth)
      }
    }
    
    // Безопасное получение точек для дней с событиями
    const dots: Array<{color: string}> = [] // ← ПРОСТО ВОЗВРАЩАЕМ ПУСТОЙ МАССИВ
    
    return { date, inMonth, dots }
  })

  // Изменение месяца в мини-календаре
  const changeMonth = (offset: number) => {
    const newDate = new Date(miniCalendarDate)
    newDate.setMonth(newDate.getMonth() + offset)
    setMiniCalendarDate(newDate)
  }

  // Получение ближайших событий
  const nearestEvents = events
    .filter(event => {
      if (!event.start || typeof event.start !== 'string') {
        return false
      }
      try {
        return isSameDay(parseISO(event.start), new Date())
      } catch (error) {
        console.warn('Ошибка при парсинге даты:', event.start, error)
        return false
      }
    })
    .sort((a, b) => {
      try {
        return parseISO(a.start).getTime() - parseISO(b.start).getTime()
      } catch (error) {
        console.warn('Ошибка при сортировке событий:', error)
        return 0
      }
    })
    .slice(0, 3)

  // Обработчик выбора участников
  const handleParticipantToggle = (user: PersonnelSimple) => {
    setParticipants(prev =>
      prev.some(p => p.id === user.id)
        ? prev.filter(p => p.id !== user.id)
        : [...prev, user]
    )
  }

  // Функция для принудительной перезагрузки участников
  const loadParticipants = async () => {
    setLoading(true);
    try {
      console.log('🔄 Принудительная перезагрузка участников...');
      const externalParticipantsData = await CalendarService.getAllExternalParticipants();
      const personnelData = externalParticipantsData.map(participant => 
        CalendarService.transformExternalToPersonnel(participant)
      );
      // В функции loadParticipants также добавим дедупликацию
      const validPersonnel = personnelData
        .filter((person) => {
          return person && person.id && person.full_name
        })
        .reduce((unique, person) => {
          // Проверяем, есть ли уже участник с таким ID
          const exists = unique.some(p => p.id === person.id);
          if (!exists) {
            unique.push(person);
          }
          return unique;
        }, [] as PersonnelSimple[]);
      setPersonnel(validPersonnel); // Обновляем основной список участников
      console.log('✅ Перезагружено участников:', validPersonnel.length);
    } catch (error) {
      console.error('❌ Ошибка при перезагрузке участников:', error);
      alert('Ошибка при загрузке участников: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect для очистки участников при выключении онлайн встречи
  useEffect(() => {
    if (!isOnline) {
      // При выключении онлайн встречи очищаем выбранных участников
      console.log('🔄 Выключена онлайн встреча, очищаем выбранных участников...');
      setParticipants([]);
    }
  }, [isOnline]);

  // useEffect для модального окна больше не нужен, так как участники загружаются при входе на страницу

  // Компонент dropdown для участников
  const ParticipantsDropdown = () => {
    // Добавляем дедупликацию участников
    const uniquePersonnel = personnel.reduce((unique, person) => {
      const exists = unique.some(p => p.id === person.id);
      if (!exists) {
        unique.push(person);
      }
      return unique;
    }, [] as PersonnelSimple[]);

    return (
      <div className="form-group">
        <label style={{
          display: 'block',
          marginBottom: '12px',
          fontWeight: '600',
          color: '#2c3e50',
          fontSize: '16px'
        }}>
          <Users className="inline-block w-4 h-4 mr-2" />
          {t('calendarPage.form.participants')} *
        </label>
        
        {/* Поле с выбранными участниками */}
        <div style={{ 
          minHeight: '60px',
          border: '2px solid #e1e5e9',
          borderRadius: '12px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          marginBottom: '12px',
          transition: 'border-color 0.3s ease',
          position: 'relative'
        }}>
          {participants.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#6c757d', 
              fontSize: '14px',
              height: '36px'
            }}>
              <span style={{ marginRight: '8px' }}>🔍</span>
              Выберите участников из списка ниже
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {participants.map(person => (
                <div
                  key={person.id}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#0056b3';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#007bff';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{person.full_name}</span>
                  <button
                    type="button"
                    onClick={() => handleParticipantToggle(person)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s ease',
                      lineHeight: '1',
                      minWidth: '18px',
                      minHeight: '18px'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Счетчик выбранных участников */}
          {participants.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '10px',
              fontWeight: '600'
            }}>
              {participants.length}
            </div>
          )}
        </div>
        
        {/* Поиск участников */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="🔍 Поиск участников..."
            value={participantSearch}
            onChange={(e) => setParticipantSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>
        
        {/* Выпадающий список участников */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => {
              if (!loading) {
                setDropdownOpen(!dropdownOpen);
              }
            }}
            style={{ 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              padding: '12px 16px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              backgroundColor: 'white',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.borderColor = '#007bff')}
            onMouseLeave={(e) => !loading && ((e.target as HTMLElement).style.borderColor = '#e1e5e9')}
          >
            <span style={{ 
              color: loading ? '#6c757d' : '#495057',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {loading ? '⏳ Загрузка участников...' : 
               uniquePersonnel.length === 0 ? '❌ Нет доступных участников' : 
               `📋 Выберите из ${uniquePersonnel.length} участников`}
            </span>
            <span style={{ 
              fontSize: '12px',
              color: '#6c757d',
              transition: 'transform 0.3s ease',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </div>
          
          {dropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                marginTop: '4px'
              }}
            >
              {loading ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>⏳</div>
                  Загрузка участников...
                </div>
              ) : uniquePersonnel.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#6c757d'
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>❌</div>
                  Участники не найдены
                </div>
              ) : (
                uniquePersonnel
                  .filter(person => {
                    const isNotSelected = !participants.some(p => p.id === person.id);
                    const matchesSearch = person.full_name.toLowerCase().includes(participantSearch.toLowerCase());
                    return isNotSelected && matchesSearch;
                  })
                  .map(person => (
                    <div
                      key={person.id}
                      onClick={() => handleParticipantToggle(person)}
                      style={{ 
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#f8f9fa';
                        (e.target as HTMLElement).style.paddingLeft = '20px';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLElement).style.paddingLeft = '16px';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#007bff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {person.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '500', 
                          color: '#2c3e50',
                          fontSize: '14px'
                        }}>
                          {person.full_name}
                        </div>
                        {person.work_phone && (
                          <div style={{ 
                            color: '#6c757d', 
                            fontSize: '12px',
                            marginTop: '2px'
                          }}>
                            📞 {person.work_phone}
                          </div>
                        )}
                      </div>
                      <div style={{
                        color: '#28a745',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        +
                      </div>
                    </div>
                  ))
              )}
              
              {/* Показываем количество отфильтрованных результатов */}
              {participantSearch && uniquePersonnel.filter(person => 
                !participants.some(p => p.id === person.id) && 
                person.full_name.toLowerCase().includes(participantSearch.toLowerCase())
              ).length === 0 && (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#6c757d',
                  fontSize: '14px'
                }}>
                  🔍 По запросу "{participantSearch}" ничего не найдено
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Добавьте в компонент календаря
  const [adminChanges, setAdminChanges] = useState<Array<{
    type: 'created' | 'updated' | 'deleted';
    event: LocalEvent;
    timestamp: Date;
  }>>([]);

  // В useEffect для синхронизации
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const result = await LocalStorageService.syncWithConflictResolution();
        
        // Показываем уведомления об изменениях
        if (result.conflicts > 0) {
          showToast(`Обнаружено ${result.conflicts} конфликтов. Локальные изменения сохранены.`);
        }
        
        // 1. Синхронизируем локальные изменения с API
        const serverEvents = await CalendarService.getAllMeetings();
        const localEvents = LocalStorageService.getEvents();
        
        // 2. Загружаем обновления с сервера
        const updatedEvents = localEvents.map((localEvent: any) => {
          const serverEvent = serverEvents.find(e => e.id === localEvent.id);
          if (serverEvent && serverEvent.lastModified > localEvent.lastModified) {
            // Серверная версия новее - обновляем локально
            return {
              ...serverEvent,
              syncStatus: 'synced' as const
            };
          }
          return localEvent;
        });
        
        // 3. Добавляем новые события с сервера
        const newServerEvents = serverEvents.filter(serverEvent => 
          !localEvents.some((localEvent: any) => localEvent.id === serverEvent.id)
        );
        
        const allEvents = [...updatedEvents, ...newServerEvents.map(e => ({
          ...e,
          syncStatus: 'synced' as const
        }))];
        
        // 4. Сохраняем обновленные события
        LocalStorageService.saveEvents(allEvents);
        setEvents(allEvents);
        
        // Обновляем счетчик ожидающих синхронизации
        // const pendingSync = LocalStorageService.getPendingSync();
        // setPendingSyncCount(pendingSync.length);
        
      } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
      }
    }, 30000); // Синхронизация каждые 30 секунд

    return () => clearInterval(syncInterval);
  }, []);

  // useEffect для модального окна больше не нужен, так как участники загружаются при входе на страницу

  // Компонент для показа изменений админа
  const AdminChangesIndicator = () => {
    if (adminChanges.length === 0) return null;

    return (
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: '#17a2b8',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <div>🔄 Изменения от администратора:</div>
        {adminChanges.map((change, index) => (
          <div key={index} style={{ fontSize: '12px', marginTop: '4px' }}>
            {change.type === 'created' && '➕ Создано: '}
            {change.type === 'updated' && '✏️ Обновлено: '}
            {change.type === 'deleted' && '🗑️ Удалено: '}
            {change.event.title}
          </div>
        ))}
        <button 
          onClick={() => setAdminChanges([])}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            marginTop: '8px'
          }}
        >
          Закрыть
        </button>
      </div>
    );
  };

  return (
    <Layout active="calendar">
      <div className="calendar-page">
        <aside className="calendar-left">
          <h1 className="calendar-title">
            <Calendar className="inline-block w-6 h-6 mr-2" />
            {t('calendarPage.title')}
          </h1>
          <button 
            className="calendar-booking-btn" 
            onClick={() => {
              console.log('📅 Открываем модальное окно через кнопку, текущее количество участников:', participants.length);
              setModalOpen(true);
            }}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('calendarPage.book')}
          </button>

          <div className="calendar-datepicker centered">
            <div className="calendar-header">
              <button 
                onClick={() => changeMonth(-1)} 
                className="month-btn"
                disabled={loading}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="month-label">
                {format(miniCalendarDate, 'LLLL yyyy', { locale: (lang.startsWith('en') ? enUS : ru) })}
              </span>
              <button 
                onClick={() => changeMonth(1)} 
                className="month-btn"
                disabled={loading}
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            <table>
              <thead>
                <tr>
                  {weekdaysShort.map((d: string) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: totalCells / 7 }).map((_, r) =>
                  <tr key={r}>
                    {cells.slice(r * 7, (r + 1) * 7).map((c, i) => {
                      const isToday = isSameDay(c.date, new Date())
                      return (
                        <td key={i} className={`${isToday ? 'today-cell' : ''}`}>
                          <div className={`day-cell ${c.inMonth ? '' : 'faded'}`}>
                            <span>{c.date.getDate()}</span>
                            <div className="dots">
                              {c.dots.map((event, di) => 
                                <span 
                                  key={di} 
                                  className="dot" 
                                  style={{ backgroundColor: event.color || 'blue' }} 
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="nearest-events">
            <h3>
              <Clock className="inline-block w-4 h-4 mr-2" />
              {t('calendarPage.nearestTitle')}
            </h3>
            {loading ? (
              <p>{t('common.loading')}</p>
            ) : nearestEvents.length === 0 ? (
              <p>{t('calendarPage.noEventsToday')}</p>
            ) : (
              nearestEvents.map((event, idx) => (
                <div key={event.id || idx} className="event-item">
                  <strong>{event.title}</strong><br />
                  <span>
                    <MapPin className="inline-block w-3 h-3 mr-1" />
                    {event.place}
                  </span><br />
                  <span>
                    <Clock className="inline-block w-3 h-3 mr-1" />
                    {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="calendar-right">
          <div className="calendar-header-bar">
            <h2>{t('calendarPage.headerTitle')}</h2>
            <div style={{ display: 'flex', gap: '10px' }}>

              <span style={{ fontSize: '14px', color: '#666', alignSelf: 'center' }}>
                {t('calendarPage.eventsCount')}: {events.length}
              </span>
            </div>
          </div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            timeZone="local" // ← ДОБАВЛЯЕМ ЭТУ СТРОКУ
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events.map(e => ({ ...e, id: String(e.id) }))} // id всегда строка
            eventDidMount={(info) => {
              console.log('Событие отображено:', info.event.title, info.event.start);
            }}
            dateClick={handleDateClick}
            locale={i18n.language === 'kz' ? 'kk' : i18n.language}
            height="auto"
            loading={(isLoading) => setLoading(isLoading)} // функция вместо boolean
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
          />

        </main>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="form-group">
                <label>
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  {t('calendarPage.form.title')} *
                </label>
                <input
                  type="text"
                  placeholder="Введите название встречи"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  disabled={loading}
                  maxLength={200}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('calendarPage.form.date')}</label>
                  <input 
                    type="date" 
                    value={newEvent.start} 
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <Clock className="inline-block w-4 h-4 mr-2" />
                    {t('calendarPage.form.startTime')}
                  </label>
                  <input 
                    type="time" 
                    value={eventStart} 
                    onChange={(e) => setEventStart(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <Clock className="inline-block w-4 h-4 mr-2" />
                    {t('calendarPage.form.endTime')}
                  </label>
                  <input 
                    type="time" 
                    value={eventEnd} 
                    onChange={(e) => setEventEnd(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('calendarPage.form.color')} *</label>
                  <select 
                    value={eventColor} 
                    onChange={(e) => setEventColor(e.target.value)}
                    disabled={loading}
                  >
                    <option value="blue">{t('calendarPage.form.colors.blue')}</option>
                    <option value="green">{t('calendarPage.form.colors.green')}</option>
                    <option value="yellow">{t('calendarPage.form.colors.yellow')}</option>
                    <option value="red">{t('calendarPage.form.colors.red')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Корпус *</label>
                  <select 
                    value={eventCampus || ''}
                    onChange={(e) => {
                      console.log('🏢 Выбран корпус:', e.target.value);
                      const campusId = e.target.value ? parseInt(e.target.value) : null;
                      setEventCampus(campusId);
                      setEventLocation(null); // Сбрасываем выбранное место при смене корпуса
                    }}
                    disabled={loading}
                  >
                    <option value="">-- Выберите корпус --</option>
                    {campuses.map(campus => 
                      <option key={campus.id} value={campus.id}>{campus.name}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <MapPin className="inline-block w-4 h-4 mr-2" />
                    Место встречи *
                  </label>
                  <select 
                    value={eventLocation || ''}
                    onChange={(e) => {
                      console.log('🏢 Выбрано место:', e.target.value);
                      setEventLocation(e.target.value ? parseInt(e.target.value) : null);
                    }}
                    disabled={loading}
                  >
                    <option value="">-- Выберите место встречи --</option>
                    {locations.map(location => 
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    )}
                  </select>
                  {/* Отладочная информация */}
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    <div>Всего мест: {locations.length}</div>
                    <div>Выбрано место: {eventLocation || 'нет'}</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Описание встречи</label>
                <textarea
                  placeholder="Введите описание встречи (необязательно)"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="toggle-container">
                <label>{t('calendarPage.form.isOnline')}</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="online-toggle"
                    checked={isOnline}
                    onChange={() => setIsOnline(!isOnline)}
                    disabled={loading}
                  />
                  <label htmlFor="online-toggle" className="slider"></label>
                </div>
              </div>

              {isOnline && (
                <>
                  <div className="form-group">
                    <label>{t('calendarPage.form.link')} *</label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={eventLink}
                      onChange={(e) => setEventLink(e.target.value)}
                      disabled={loading}
                      maxLength={200}
                    />
                  </div>

                  {ParticipantsDropdown()}
                </>
              )}

              <div className="modal-actions">
                <button 
                  className="add-btn" 
                  onClick={handleAdd}
                  disabled={loading}
                  style={{ 
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Создание...' : 'Создать встречу'}
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={handleCloseModal}
                  disabled={loading}
                  style={{ 
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold min-w-[300px] animate-[slideIn_0.3s_ease-out] ${
              toast.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-pink-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20`}>
                {toast.type === 'error' ? (
                  <span className="text-xl">⚠️</span>
                ) : (
                  <span className="text-xl">✅</span>
                )}
              </div>
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Toast animation keyframes */}
        <style jsx global>{`
          @keyframes slideIn {
            from { transform: translateY(16px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Компонент для показа изменений админа */}
        <AdminChangesIndicator />
      </div>
    </Layout>
  )
}