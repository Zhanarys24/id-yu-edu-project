'use client'

import Layout from '@/components/Layout'
import '@/styles/calendar/calendar.css'
import { useState, useRef, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import { format, parseISO, isBefore, addMinutes, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function CalendarPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', color: 'blue', place: '' })
  const [events, setEvents] = useState<any[]>([])
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')
  const [eventColor, setEventColor] = useState('blue')
  const [eventPlace, setEventPlace] = useState('Атриум')
  const [isOnline, setIsOnline] = useState(false)
  const [eventLink, setEventLink] = useState('')
  const [participants, setParticipants] = useState<string[]>([])

  const calendarRef = useRef<FullCalendar>(null)

  const places = ['Атриум', 'Тәуелсіздік холлы', '15 этаж, конференц зал', 'Маңғышлақ', 'Бозжыра', 'Шерқала', 'Ақтау, Technopark']
  const users = ['user1@example.com', 'user2@example.com', 'manager@company.kz', 'teamlead@corp.kz'] // заглушка для участников

  const startOfMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 1)
  const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1
  const daysInMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 0).getDate()
  const daysInPrev = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 0).getDate()
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDay + 1
    let date = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), dayNum)
    let inMonth = dayNum >= 1 && dayNum <= daysInMonth
    if (!inMonth) {
      if (dayNum < 1) date = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1, daysInPrev + dayNum)
      else date = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, dayNum - daysInMonth)
    }
    const dots = events.filter(e => {
      const d = new Date(e.start)
      return d.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
    })
    return { date, inMonth, dots }
  })

  const changeMonth = (o: number) => {
    const m = new Date(miniCalendarDate)
    m.setMonth(m.getMonth() + o)
    setMiniCalendarDate(m)
  }

  const handleDateClick = (arg: DateClickArg) => {
    setNewEvent({ ...newEvent, start: arg.dateStr })
    setModalOpen(true)
  }

  const isTimeSlotAvailable = (startStr: string, endStr: string, place: string) => {
    const newStart = parseISO(startStr)
    const newEnd = parseISO(endStr)
    return !events.some(e => {
      if (e.place !== place) return false
      const eStart = parseISO(e.start)
      const eEnd = parseISO(e.end)
      const bufferEnd = addMinutes(eEnd, 10)
      return (newStart < bufferEnd && newEnd > eStart)
    })
  }

  const handleAdd = () => {
    const fullStart = `${newEvent.start}T${eventStart}`
    const fullEnd = `${newEvent.start}T${eventEnd}`
    if (!eventTitle || !eventStart || !eventEnd || !eventPlace) return

    if (!isTimeSlotAvailable(fullStart, fullEnd, eventPlace)) {
      alert('Это время и место уже занято!')
      return
    }

    const eventObj: any = {
      title: eventTitle,
      start: fullStart,
      end: fullEnd,
      color: eventColor,
      place: eventPlace,
      isOnline,
      participants,
      link: eventLink
    }

    // TODO: можно отправлять email с приглашением участникам здесь

    setEvents([...events, eventObj])
    setModalOpen(false)
    setEventTitle('')
    setEventStart('')
    setEventEnd('')
    setEventColor('blue')
    setEventPlace('Атриум')
    setIsOnline(false)
    setEventLink('')
    setParticipants([])
  }

  const nearestEvents = events
    .filter(e => isSameDay(parseISO(e.start), new Date()))
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
    .slice(0, 3)

  return (
    <Layout active="Мероприятия">
      <div className="calendar-page">
        <aside className="calendar-left">
          <h1 className="calendar-title">Мероприятия</h1>
          <button className="calendar-booking-btn" onClick={() => setModalOpen(true)}>+ Забронировать</button>
          <div className="calendar-datepicker centered">
            <div className="calendar-header">
              <button onClick={() => changeMonth(-1)} className="month-btn">&#9664;</button>
              <span className="month-label">{format(miniCalendarDate, 'LLLL yyyy', { locale: ru })}</span>
              <button onClick={() => changeMonth(1)} className="month-btn">&#9654;</button>
            </div>
            <table>
              <thead><tr>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {Array.from({ length: totalCells / 7 }).map((_, r) =>
                  <tr key={r}>
                    {cells.slice(r * 7, (r + 1) * 7).map((c, i) =>
                      <td key={i}>
                        <div className={`day-cell ${c.inMonth ? '' : 'faded'}`}>
                          <span>{c.date.getDate()}</span>
                          <div className="dots">
                            {c.dots.map((e, di) => <span key={di} className="dot" style={{ backgroundColor: e.color }} />)}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="nearest-events">
            <h3>Ближайшие события</h3>
            {nearestEvents.length === 0 && <p>Сегодня мероприятий нет</p>}
            {nearestEvents.map((e, idx) => (
              <div key={idx} className="event-item">
                <strong>{e.title}</strong><br />
                <span>{e.place}</span><br />
                <span>{format(parseISO(e.start), 'HH:mm')} - {format(parseISO(e.end), 'HH:mm')}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="calendar-right">
          <div className="calendar-header-bar"><h2>Календарь событий</h2></div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            events={events}
            dateClick={handleDateClick}
            locale="ru"
            height="auto"
          />
        </main>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <label>Название мероприятия</label>
                <input
                type="text"
                placeholder="Введите название мероприятия"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                />
              <label>Дата</label>
              <input type="date" value={newEvent.start} onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })} />
              <label>Время начала</label>
              <input type="time" value={eventStart} onChange={(e) => setEventStart(e.target.value)} />
              <label>Время окончания</label>
              <input type="time" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} />
              <label>Цвет</label>
              <select value={eventColor} onChange={(e) => setEventColor(e.target.value)}>
                <option value="blue">Голубой</option>
                <option value="green">Зелёный</option>
                <option value="yellow">Жёлтый</option>
                <option value="red">Красный</option>
              </select>
              <label>Место проведения</label>
              <select value={eventPlace} onChange={(e) => setEventPlace(e.target.value)}>
                {places.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <div className="toggle-container">
                <label>Онлайн встреча</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="online-toggle"
                    checked={isOnline}
                    onChange={() => setIsOnline(!isOnline)}
                  />
                  <label htmlFor="online-toggle" className="slider"></label>
                </div>
              </div>

              {isOnline && (
                <>
                  <label>Ссылка на мероприятие</label>
                  <input
                    type="text"
                    placeholder="Вставьте ссылку на встречу"
                    value={eventLink}
                    onChange={(e) => setEventLink(e.target.value)}
                  />


                  <label>Участники</label>
                  <div className="custom-dropdown">
                    <div className="selected-list" onClick={() => setDropdownOpen(!dropdownOpen)}>
                      {participants.length > 0 ? participants.join(', ') : 'Выберите участников'}
                      <span className="arrow">{dropdownOpen ? '▲' : '▼'}</span>
                    </div>
                    {dropdownOpen && (
                      <div className="options">
                        {users.map(email => (
                          <label key={email}>
                            <input
                              type="checkbox"
                              checked={participants.includes(email)}
                              onChange={() => {
                                setParticipants(prev =>
                                  prev.includes(email)
                                    ? prev.filter(p => p !== email)
                                    : [...prev, email]
                                )
                              }}
                            />
                            {email}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>



                </>
              )}

              <div className="modal-actions">
                <button className="add-btn" onClick={handleAdd}>Добавить</button>
                <button className="cancel-btn" onClick={() => setModalOpen(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
