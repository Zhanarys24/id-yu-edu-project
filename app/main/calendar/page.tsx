'use client'

import Layout from '@/components/Layout'
import '@/styles/calendar/calendar.css'
import { useState, useRef, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import { format, parseISO, isSameDay, addMinutes } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/i18n'

// Интерфейсы для типизации
interface Event {
  id?: string | number
  title: string
  start: string
  end: string
  color: string
  place: string
  isOnline: boolean
  link?: string
  participants: string[]
}

interface User {
  id: string | number
  name: string
  email: string
  department: string
}

const API_BASE = 'http://localhost:8080/api' // настройка для FastAPI

export default function CalendarPage() {
  const { t, i18n } = useTranslation('common')
  // Состояния для модального окна
  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Состояния для данных
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [participants, setParticipants] = useState<User[]>([])

  // Состояния для формы события
  const [newEvent, setNewEvent] = useState({ start: '', color: 'blue' })
  const [eventTitle, setEventTitle] = useState('')
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')
  const [eventColor, setEventColor] = useState('blue')
  const [eventPlace, setEventPlace] = useState('Атриум')
  const [isOnline, setIsOnline] = useState(false)
  const [eventLink, setEventLink] = useState('')

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
        const [eRes, uRes] = await Promise.all([
          fetch(`${API_BASE}/events`),
          fetch(`${API_BASE}/users`)
        ])
        
        if (!eRes.ok || !uRes.ok) {
          throw new Error('Ошибка при загрузке данных')
        }
        
        const [eventsData, usersData] = await Promise.all([eRes.json(), uRes.json()])
        
        // Валидация и очистка данных событий
        const validEvents = (eventsData || []).filter((event: any) => {
          return event && 
                 typeof event.start === 'string' && 
                 event.start.length > 0 &&
                 typeof event.end === 'string' && 
                 event.end.length > 0 &&
                 event.title
        })
        
        // Валидация данных пользователей
        const validUsers = (usersData || []).filter((user: any) => {
          return user && user.id && user.name && user.email
        })
        
        setEvents(validEvents)
        setUsers(validUsers)
        
        console.log('Загружено событий:', validEvents.length)
        console.log('Загружено пользователей:', validUsers.length)
        
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
        setEvents([])
        setUsers([])
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
    if (!eventTitle.trim()) return t('calendarPage.errors.titleRequired')
    if (!newEvent.start) return t('calendarPage.errors.dateRequired')
    if (!eventStart) return t('calendarPage.errors.startTimeRequired')
    if (!eventEnd) return t('calendarPage.errors.endTimeRequired')
    if (!eventPlace) return t('calendarPage.errors.placeRequired')
    
    // Проверка времени
    if (eventStart >= eventEnd) {
      return t('calendarPage.errors.endAfterStart')
    }
    
    // Проверка для онлайн встреч
    if (isOnline) {
      if (participants.length === 0) {
        return t('calendarPage.errors.participantsRequired')
      }
      if (!eventLink.trim()) {
        return t('calendarPage.errors.linkRequired')
      }
    }
    
    return null
  }

  // Функция перезагрузки событий
  const reloadEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`)
      if (res.ok) {
        const eventsData = await res.json()
        const validEvents = (eventsData || []).filter((event: any) => {
          return event && 
                 typeof event.start === 'string' && 
                 event.start.length > 0 &&
                 typeof event.end === 'string' && 
                 event.end.length > 0 &&
                 event.title
        })
        setEvents(validEvents)
        console.log('События обновлены:', validEvents)
        
        // Принудительное обновление календаря
        if (calendarRef.current) {
          calendarRef.current.getApi().refetchEvents()
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении событий:', error)
    }
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
    if (!isTimeSlotAvailable(fullStart, fullEnd, eventPlace)) {
      alert(t('calendarPage.errors.slotBusy'))
      return
    }

    const newEventObj: Omit<Event, 'id'> = {
      title: eventTitle.trim(),
      start: fullStart,
      end: fullEnd,
      color: eventColor,
      place: eventPlace,
      isOnline,
      link: isOnline ? eventLink.trim() : '',
      participants: participants.map(p => p.email)
    }

    console.log("Создание события:", newEventObj)

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventObj)
      })

      if (res.ok) {
        const savedEvent = await res.json()
        console.log('Событие сохранено на сервере:', savedEvent)
        
        // Обновляем состояние с новым событием
        const eventToAdd = {
          ...savedEvent,
          // Убеждаемся что поля присутствуют
          title: savedEvent.title || eventTitle.trim(),
          start: savedEvent.start || fullStart,
          end: savedEvent.end || fullEnd,
          color: savedEvent.color || eventColor,
          place: savedEvent.place || eventPlace
        }
        
        setEvents(prev => {
          const newEvents = [...prev, eventToAdd]
          console.log('Обновленный список событий:', newEvents)
          return newEvents
        })
        
        // Перезагружаем события с сервера для синхронизации
        setTimeout(() => {
          reloadEvents()
        }, 500)
        
        resetForm()
        setModalOpen(false)
        alert(t('calendarPage.successCreated'))
        
      } else {
        const errorText = await res.text()
        console.error('Ошибка сервера:', errorText)
        alert(t('calendarPage.createError') + ': ' + errorText)
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error)
      alert(t('calendarPage.connectionError'))
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
    setEventPlace('Атриум')
    setIsOnline(false)
    setEventLink('')
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
    let inMonth = dayNum >= 1 && dayNum <= daysInMonth
    
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
  const handleParticipantToggle = (user: User) => {
    setParticipants(prev =>
      prev.some(p => p.id === user.id)
        ? prev.filter(p => p.id !== user.id)
        : [...prev, user]
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
              <button 
                onClick={reloadEvents} 
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? t('common.loading') : t('calendarPage.refresh')}
              </button>
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
            events={events}
            eventDidMount={(info) => {
              // Дополнительная отладка для отображения событий
              console.log('Событие отображено:', info.event.title, info.event.start)
            }}
            dateClick={handleDateClick}
            locale={i18n.language === 'kz' ? 'kk' : i18n.language}
            height="auto"
            loading={loading}
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
                  placeholder={t('calendarPage.form.titlePlaceholder')}
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  disabled={loading}
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
                  <label>{t('calendarPage.form.place')} *</label>
                  <select 
                    value={eventPlace} 
                    onChange={(e) => setEventPlace(e.target.value)}
                    disabled={loading}
                  >
                    {places.map(place => 
                      <option key={place} value={place}>{place}</option>
                    )}
                  </select>
                </div>
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
                      placeholder={t('calendarPage.form.linkPlaceholder')}
                      value={eventLink}
                      onChange={(e) => setEventLink(e.target.value)}
                      disabled={loading}
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
                          ? participants.map(p => p.name).join(', ') 
                          : <span style={{ color: '#aaa' }}>{t('calendarPage.form.noParticipants')}</span>
                        }
                        <span className="arrow">{dropdownOpen ? '▲' : '▼'}</span>
                      </div>
                      {dropdownOpen && (
                        <div className="options">
                          {users.length === 0 ? (
                            <div className="no-users">{t('calendarPage.form.noUsers')}</div>
                          ) : (
                            users.map(user => (
                              <label key={user.id}>
                                <input
                                  type="checkbox"
                                  checked={participants.some(p => p.id === user.id)}
                                  onChange={() => handleParticipantToggle(user)}
                                  disabled={loading}
                                />
                                <span>{user.name}</span>
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                  {user.department}
                                </small>
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
                >
                  {loading ? t('calendarPage.form.adding') : t('calendarPage.form.add')}
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  {t('calendarPage.form.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}