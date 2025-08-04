'use client'

import Layout from '@/components/Layout'
import '@/styles/calendar/calendar.css'
import { useState } from 'react'

export default function CalendarPage() {
  const [activeView, setActiveView] = useState('Месяц')
  const [selectedPlace, setSelectedPlace] = useState('Атриум')

  const places = [
    'Атриум',
    'Тәуелсіздік холлы',
    '15 этаж, конференц зал',
    'Маңғышлақ',
    'Бозжыра',
    'Шерқала',
    'Ақтау, Technopark',
  ]

  return (
    <Layout active="Мероприятия">
      <div className="calendar-page">
        {/* Левая часть */}
        <aside className="calendar-left">
          <h1 className="calendar-title">Мероприятия</h1>
          <button className="calendar-booking-btn">+ Забронировать</button>

          <div className="calendar-datepicker">
            <div className="calendar-header">
              <button>{'<'}</button>
              <span>June 2025</span>
              <button>{'>'}</button>
            </div>
            <table>
              <thead>
                <tr>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, weekIdx) => (
                  <tr key={weekIdx}>
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const day = weekIdx * 7 + dayIdx + 1
                      return (
                        <td key={day}>
                          <button
                            className={`calendar-day-btn ${day === 25 ? 'selected' : ''}`}
                          >
                            {day}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="calendar-places">
            <p>Место проведения</p>
            {places.map((place) => (
              <label key={place}>
                <input
                  type="radio"
                  name="place"
                  checked={selectedPlace === place}
                  onChange={() => setSelectedPlace(place)}
                />
                {place}
              </label>
            ))}
          </div>
        </aside>

        {/* Правая часть */}
        <main className="calendar-right">
          <div className="calendar-header-bar">
            <div className="calendar-nav">
              <button>{'<'}</button>
              <span>Июнь 2025</span>
              <button>{'>'}</button>
            </div>
            <div className="calendar-view-switch">
              {['Месяц', 'Неделя', 'День'].map((v) => (
                <button
                  key={v}
                  className={activeView === v ? 'active' : ''}
                  onClick={() => setActiveView(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-grid">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="calendar-cell">
                <div className="calendar-date">{i + 1}</div>
                {i === 16 && <div className="event blue">16:00 Хак...</div>}
                {i === 16 && <div className="event blue">17:00 Жин...</div>}
                {i === 20 && <div className="event yellow">12:00 Хак...</div>}
                {i === 20 && <div className="event yellow">13:00 Жин...</div>}
                {(i === 21 || i === 23) && <div className="event green">9:00 Конф</div>}
              </div>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  )
}
