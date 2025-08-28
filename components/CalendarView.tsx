'use client';

import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg, EventClickArg } from '@fullcalendar/interaction';
import { Dialog } from '@headlessui/react';

export default function CalendarView() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    color: 'blue'
  });

  const [events, setEvents] = useState([
    {
      title: 'Хакатон',
      start: '2025-08-17T16:00',
      color: '#4fc3f7'
    },
    {
      title: 'Конференция',
      start: '2025-08-21T12:00',
      color: '#81c784'
    }
  ]);

  const handleDateClick = (arg: DateClickArg) => {
    setNewEvent(prev => ({ ...prev, date: arg.dateStr }));
    setIsOpen(true);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const newEv = {
      title: newEvent.title,
      start: `${newEvent.date}T${newEvent.time}`,
      color: newEvent.color === 'blue' ? '#4fc3f7' : newEvent.color === 'green' ? '#81c784' : '#fbc02d'
    };

    setEvents([...events, newEv]);
    setIsOpen(false);
    setNewEvent({ title: '', date: '', time: '', color: 'blue' });
  };

  return (
    <div className="p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="ru"
        dateClick={handleDateClick}
        events={events}
        height="auto"
      />

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <Dialog.Title className="text-xl font-semibold">Новое мероприятие</Dialog.Title>

            <input
              type="text"
              placeholder="Название"
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <select
              value={newEvent.color}
              onChange={e => setNewEvent({ ...newEvent, color: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="blue">Голубой</option>
              <option value="green">Зелёный</option>
              <option value="yellow">Жёлтый</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Отмена</button>
              <button onClick={handleAddEvent} className="px-4 py-2 bg-blue-500 text-white rounded">Добавить</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
