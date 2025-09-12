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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/i18n'
import { CalendarService, CalendarEvent, CalendarUser, PersonnelSimple, Campus, MeetingRoom } from '@/lib/services/calendarService'


// Используем типы напрямую из сервиса
type Event = CalendarEvent;
type User = CalendarUser;

export default function CalendarPage() {
  const { t, i18n } = useTranslation('common')
  // Состояния для модального окна
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Состояния для данных
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [personnel, setPersonnel] = useState<PersonnelSimple[]>([])
  const [participants, setParticipants] = useState<PersonnelSimple[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([])
  const [locations, setLocations] = useState<Array<{id: number, name: string, campus_id: number}>>([])

  // Состояния для формы события
  const [newEvent, setNewEvent] = useState({ start: '', color: 'blue' })
  const [eventTitle, setEventTitle] = useState('')
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')
  const [eventColor, setEventColor] = useState('blue')
  const [eventCampus, setEventCampus] = useState(1)
  const [eventLocation, setEventLocation] = useState(1)
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
        // Загружаем встречи, персонал, корпуса и места встреч через новый API
        const [meetingsData, usersData, personnelData, campusesData, meetingRoomsData] = await Promise.all([
          CalendarService.getAllMeetings(),
          CalendarService.getUsers(),
          CalendarService.getPersonnel(),
          CalendarService.getCampuses(),
          CalendarService.getMeetingRooms()
        ])
        
        // Преобразуем встречи в события календаря
        const calendarEvents = meetingsData.map(meeting => 
          CalendarService.transformMeetingToEvent(meeting)
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
        
        // Валидация данных персонала
        const validPersonnel = personnelData.filter((person) => {
          return person && person.id && person.full_name
        })
        
        // Преобразуем meeting rooms в locations для обратной совместимости
        const locationsData = meetingRoomsData.map(room => ({
          id: room.id,
          name: room.name,
          campus_id: room.campus
        }))
        
        setEvents(validEvents)
        setUsers(validUsers)
        setPersonnel(validPersonnel)
        setCampuses(campusesData)
        setMeetingRooms(meetingRoomsData)
        setLocations(locationsData)
        
        console.log('Загружено событий:', validEvents.length)
        console.log('Загружено пользователей:', validUsers.length)
        console.log('Загружено персонала:', validPersonnel.length)
        console.log('Загружено корпусов:', campusesData.length)
        console.log('Загружено мест встреч:', meetingRoomsData.length)
        
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
        setEvents([])
        setUsers([])
        setPersonnel([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Обработчик клика по дате
  const handleDateClick = (arg: DateClickArg) => {
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
      alert(validationError)
      return
    }

    const fullStart = `${newEvent.start}T${eventStart}`
    const fullEnd = `${newEvent.start}T${eventEnd}`

    // Проверка доступности времени и места
    const locationName = locations.find(l => l.id === eventLocation)?.name || 'Неизвестное место';
    if (!isTimeSlotAvailable(fullStart, fullEnd, locationName)) {
      alert('Выбранное время уже занято в этом месте')
      return
    }

    const newEventObj: Omit<Event, 'id'> & { campusId: number, locationId: number } = {
      title: eventTitle.trim(),
      start: fullStart,
      end: fullEnd,
      color: eventColor,
      place: locations.find(l => l.id === eventLocation)?.name || 'Неизвестное место',
      isOnline,
      link: isOnline ? eventLink.trim() : '',
      participants: participants.map(p => p.full_name), // Используем full_name вместо email
      description: eventDescription.trim(),
      campusId: eventCampus,
      locationId: eventLocation
    }

    console.log("Создание события:", newEventObj)

    setLoading(true)
    try {
      // Создаем встречу через API
      const savedMeeting = await CalendarService.createMeeting(newEventObj)
      console.log('Встреча создана на сервере:', savedMeeting)
      
      // Преобразуем встречу в событие календаря
      const eventToAdd = CalendarService.transformMeetingToEvent(savedMeeting)
      
      setEvents(prev => {
        const newEvents = [...prev, eventToAdd]
        console.log('Обновленный список событий:', newEvents)
        return newEvents
      })
      
      // Принудительное обновление календаря
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents()
      }
      
      resetForm()
      setModalOpen(false)
      alert('Встреча успешно создана!')
      
    } catch (error) {
      console.error('Ошибка при создании встречи:', error)
      const errorMessage = (error as Error).message
      
      // Более детальная обработка ошибок
      if (errorMessage.includes('400')) {
        alert('Ошибка валидации данных. Проверьте правильность заполнения полей.')
      } else if (errorMessage.includes('401')) {
        alert('Ошибка авторизации. Войдите в систему заново.')
      } else if (errorMessage.includes('403')) {
        alert('Недостаточно прав для создания встречи.')
      } else if (errorMessage.includes('500')) {
        alert('Ошибка сервера. Попробуйте позже.')
      } else {
        alert('Ошибка при создании встречи: ' + errorMessage)
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
    setEventCampus(1)
    setEventLocation(1)
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
    const dots = events.filter(event => {
      if (!event.start || typeof event.start !== 'string') {
        return false
      }
      try {
        const eventDateStr = event.start.slice(0, 10)
        const cellDateStr = date.toISOString().slice(0, 10)
        return eventDateStr === cellDateStr
      } catch (error) {
        console.warn('Ошибка при сравнении дат:', event.start, error)
        return false
      }
    })
    
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
  const handleParticipantToggle = (person: PersonnelSimple) => {
    setParticipants(prev =>
      prev.some(p => p.id === person.id)
        ? prev.filter(p => p.id !== person.id)
        : [...prev, person]
    )
  }

  return (
    <Layout active="calendar">
      <div className="calendar-page">
        <aside className="calendar-left">
          <h1 className="calendar-title">{t('calendarPage.title')}</h1>
          <button 
            className="calendar-booking-btn" 
            onClick={() => setModalOpen(true)}
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
                <ChevronLeft size={28} />
              </button>
              <span className="month-label">
                {format(miniCalendarDate, 'LLLL yyyy', { locale: (lang.startsWith('en') ? enUS : ru) })}
              </span>
              <button 
                onClick={() => changeMonth(1)} 
                className="month-btn"
                disabled={loading}
              >
                <ChevronRight size={28} />
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
            <h3>{t('calendarPage.nearestTitle')}</h3>
            {loading ? (
              <p>{t('common.loading')}</p>
            ) : nearestEvents.length === 0 ? (
              <p>{t('calendarPage.noEventsToday')}</p>
            ) : (
              nearestEvents.map((event, idx) => (
                <div key={event.id || idx} className="event-item">
                  <strong>{event.title}</strong><br />
                  <span>{event.place}</span><br />
                  <span>
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
                <label>{t('calendarPage.form.title')} *</label>
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
                  <label>{t('calendarPage.form.startTime')}</label>
                  <input 
                    type="time" 
                    value={eventStart} 
                    onChange={(e) => setEventStart(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>{t('calendarPage.form.endTime')}</label>
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
                    value={eventCampus} 
                    onChange={async (e) => {
                      const campusId = parseInt(e.target.value);
                      setEventCampus(campusId);
                      // Обновляем список мест встреч при смене корпуса
                      try {
                        const meetingRoomsData = await CalendarService.getMeetingRooms(campusId);
                        setMeetingRooms(meetingRoomsData);
                        const locationsData = meetingRoomsData.map(room => ({
                          id: room.id,
                          name: room.name,
                          campus_id: room.campus
                        }));
                        setLocations(locationsData);
                      } catch (error) {
                        console.error('Ошибка при загрузке мест встреч:', error);
                      }
                    }}
                    disabled={loading}
                  >
                    {campuses.map(campus => 
                      <option key={campus.id} value={campus.id}>{campus.name}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Место встречи *</label>
                  <select 
                    value={eventLocation} 
                    onChange={(e) => setEventLocation(parseInt(e.target.value))}
                    disabled={loading}
                  >
                    {locations.filter(loc => loc.campus_id === eventCampus).map(location => 
                      <option key={location.id} value={location.id}>{location.name}</option>
                    )}
                  </select>
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

                  <div className="form-group">
                    <label>{t('calendarPage.form.participants')} *</label>
                    <div className="custom-dropdown">
                      <div 
                        className="selected-list" 
                        onClick={() => !loading && setDropdownOpen(!dropdownOpen)}
                      >
                        {participants.length > 0 
                          ? participants.map(p => p.full_name).join(', ') 
                          : <span style={{ color: '#aaa' }}>{t('calendarPage.form.noParticipants')}</span>
                        }
                        <span className="arrow">{dropdownOpen ? '▲' : '▼'}</span>
                      </div>
                      {dropdownOpen && (
                        <div className="options">
                          {personnel.length === 0 ? (
                            <div className="no-users">{t('calendarPage.form.noUsers')}</div>
                          ) : (
                            personnel.map(person => (
                              <label key={person.id}>
                                <input
                                  type="checkbox"
                                  checked={participants.some(p => p.id === person.id)}
                                  onChange={() => handleParticipantToggle(person)}
                                  disabled={loading}
                                />
                                <span>{person.full_name}</span>
                                {person.work_phone && (
                                  <small style={{ color: '#666', fontSize: '12px' }}>
                                    {person.work_phone}
                                  </small>
                                )}
                              </label>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
      </div>
    </Layout>
  )
}