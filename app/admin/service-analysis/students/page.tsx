'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  GraduationCap, Clock, Download, Search, Filter, Calendar,
  CheckCircle, XCircle, AlertTriangle, FileSpreadsheet,
  ArrowLeft, RefreshCw, Eye, MoreVertical, BookOpen, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Список факультетов
const FACULTIES = [
  'Педагогика',
  'Филология и спорт', 
  'Бизнес и туризм',
  'Право и международные отношения',
  'Компьютерные науки и искусственный интеллект',
  'Инжиниринг',
  'Морская академия',
  'Естественные науки',
  'Казахская филология',
  'Менеджмент',
  'Правоведение',
  'Компьютерные технологии',
  'Нефтехимический инжиниринг',
  'Морская техника и технологии',
  'Фундаментальные науки',
  'Мировые языки',
  'Экономика и финансы',
  'Международные отношения',
  'SMART технологии',
  'Экология и геология',
  'Машиностроение и логистика',
  'Общая педагогика',
  'Физическая культура и спорт',
  'Туризм',
  'Ассамблея народа Казахстана',
  'Yessenov 01 AI School',
  'Строительный инжиниринг',
  'История и традиционное искусство',
  'Английская филология',
  'Энергетика'
];

// Типы для системы учета посещаемости студентов
type StudentAttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  studentGroup: string;
  studentCourse: number;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent' | 'early_leave';
  lateMinutes?: number;
  attendanceHours?: number;
  subject?: string;
  notes?: string;
};

type Student = {
  id: string;
  name: string;
  group: string;
  course: number;
  email: string;
  phone: string;
  enrollmentDate: string;
  isActive: boolean;
  major: string;
  faculty: string;
  gpa?: number;
};

export default function StudentsPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterFaculty, setFilterFaculty] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/main/news');
    }
    loadStudents();
    loadAttendanceRecords();
  }, [selectedDate]);

  const loadStudents = () => {
    // Моковые данные студентов
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Алмас Жумабеков',
        group: 'IT-21-1',
        course: 3,
        email: 'almas@student.yu.edu.kz',
        phone: '+7 777 111 1111',
        enrollmentDate: '2021-09-01',
        isActive: true,
        major: 'Информационные технологии',
        faculty: 'Компьютерные науки и искусственный интеллект',
        gpa: 3.8
      },
      {
        id: '2',
        name: 'Айгерим Нурланова',
        group: 'IT-21-2',
        course: 3,
        email: 'aigerim@student.yu.edu.kz',
        phone: '+7 777 222 2222',
        enrollmentDate: '2021-09-01',
        isActive: true,
        major: 'Информационные технологии',
        faculty: 'Компьютерные технологии',
        gpa: 3.9
      },
      {
        id: '3',
        name: 'Данияр Касымов',
        group: 'BUS-22-1',
        course: 2,
        email: 'daniyar@student.yu.edu.kz',
        phone: '+7 777 333 3333',
        enrollmentDate: '2022-09-01',
        isActive: true,
        major: 'Бизнес-администрирование',
        faculty: 'Бизнес и туризм',
        gpa: 3.6
      },
      {
        id: '4',
        name: 'Жанар Сейтжанова',
        group: 'ENG-23-1',
        course: 1,
        email: 'zhanar@student.yu.edu.kz',
        phone: '+7 777 444 4444',
        enrollmentDate: '2023-09-01',
        isActive: true,
        major: 'Инженерия',
        faculty: 'Инжиниринг',
        gpa: 3.7
      },
      {
        id: '5',
        name: 'Асель Толеуова',
        group: 'IT-20-1',
        course: 4,
        email: 'asel@student.yu.edu.kz',
        phone: '+7 777 555 5555',
        enrollmentDate: '2020-09-01',
        isActive: true,
        major: 'Информационные технологии',
        faculty: 'SMART технологии',
        gpa: 3.5
      },
      {
        id: '6',
        name: 'Ерлан Мухтаров',
        group: 'MAR-22-1',
        course: 2,
        email: 'erlan@student.yu.edu.kz',
        phone: '+7 777 666 6666',
        enrollmentDate: '2022-09-01',
        isActive: true,
        major: 'Морские технологии',
        faculty: 'Морская академия',
        gpa: 3.4
      },
      {
        id: '7',
        name: 'Динара Аскарова',
        group: 'PED-23-1',
        course: 1,
        email: 'dinara@student.yu.edu.kz',
        phone: '+7 777 777 7777',
        enrollmentDate: '2023-09-01',
        isActive: true,
        major: 'Педагогические науки',
        faculty: 'Педагогика',
        gpa: 3.8
      },
      {
        id: '8',
        name: 'Арман Садыков',
        group: 'LAW-21-1',
        course: 3,
        email: 'arman@student.yu.edu.kz',
        phone: '+7 777 888 8888',
        enrollmentDate: '2021-09-01',
        isActive: true,
        major: 'Юриспруденция',
        faculty: 'Право и международные отношения',
        gpa: 3.6
      }
    ];
    setStudents(mockStudents);
  };

  const loadAttendanceRecords = () => {
    // Моковые данные учета посещаемости студентов
    const mockRecords: StudentAttendanceRecord[] = [
      {
        id: '1',
        studentId: '1',
        studentName: 'Алмас Жумабеков',
        studentGroup: 'IT-21-1',
        studentCourse: 3,
        date: selectedDate,
        checkIn: '08:30',
        checkOut: '17:00',
        status: 'present',
        attendanceHours: 8,
        subject: 'Программирование'
      },
      {
        id: '2',
        studentId: '2',
        studentName: 'Айгерим Нурланова',
        studentGroup: 'IT-21-2',
        studentCourse: 3,
        date: selectedDate,
        checkIn: '08:45',
        checkOut: '16:30',
        status: 'late',
        lateMinutes: 15,
        attendanceHours: 7.5,
        subject: 'Базы данных'
      },
      {
        id: '3',
        studentId: '3',
        studentName: 'Данияр Касымов',
        studentGroup: 'BUS-22-1',
        studentCourse: 2,
        date: selectedDate,
        checkIn: '09:00',
        checkOut: '15:30',
        status: 'early_leave',
        attendanceHours: 6.5,
        subject: 'Маркетинг'
      },
      {
        id: '4',
        studentId: '4',
        studentName: 'Жанар Сейтжанова',
        studentGroup: 'ENG-23-1',
        studentCourse: 1,
        date: selectedDate,
        checkIn: '08:15',
        checkOut: '17:15',
        status: 'present',
        attendanceHours: 8.5,
        subject: 'Математика'
      },
      {
        id: '5',
        studentId: '5',
        studentName: 'Асель Толеуова',
        studentGroup: 'ИС-21',
        studentCourse: 2,
        date: '2025-09-10',
        status: 'absent',
        subject: 'Математика',
        checkIn: '' // или '' если строка
      }

    ];
    setAttendanceRecords(mockRecords);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'late':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'early_leave':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Присутствует';
      case 'late':
        return 'Опоздал';
      case 'absent':
        return 'Отсутствует';
      case 'early_leave':
        return 'Ушел раньше';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'early_leave':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const student = students.find(s => s.id === record.studentId);
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.subject && record.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || record.studentCourse.toString() === filterCourse;
    const matchesFaculty = filterFaculty === 'all' || (student && student.faculty === filterFaculty);
    return matchesSearch && matchesStatus && matchesCourse && matchesFaculty;
  });

  const exportToExcel = () => {
    // Экспорт всех данных студентов с более подробной информацией
    const headers = [
      'Дата', 
      'Имя студента', 
      'Группа', 
      'Курс', 
      'Факультет', 
      'Предмет', 
      'Время прихода', 
      'Время ухода', 
      'Статус', 
      'Часов присутствия',
      'Минут опоздания'
    ];
    
    const csvData = [
      createCSVRow(headers),
      ...filteredRecords.map(record => {
        const student = students.find(s => s.id === record.studentId);
        return createCSVRow([
          record.date,
          record.studentName,
          record.studentGroup,
          record.studentCourse.toString(),
          student?.faculty || 'Не указан',
          record.subject || '-',
          record.checkIn || '-',
          record.checkOut || '-',
          getStatusText(record.status),
          record.attendanceHours?.toString() || '-',
          record.lateMinutes?.toString() || '-'
        ]);
      })
    ].join('\n');
    
    downloadCSV(csvData, `students_attendance_${selectedDate}.csv`);
  };

  const exportAllStudentsData = () => {
    // Экспорт всех студентов с их полной информацией
    const headers = [
      'Имя студента',
      'Группа', 
      'Курс',
      'Факультет',
      'Специальность',
      'Email',
      'Телефон',
      'Дата поступления',
      'Средний балл',
      'Статус активности'
    ];
    
    const csvData = [
      createCSVRow(headers),
      ...students.map(student => createCSVRow([
        student.name,
        student.group,
        student.course.toString(),
        student.faculty,
        student.major,
        student.email,
        student.phone,
        student.enrollmentDate,
        student.gpa?.toString() || 'Не указан',
        student.isActive ? 'Активен' : 'Неактивен'
      ]))
    ].join('\n');
    
    downloadCSV(csvData, `all_students_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportStudentData = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
    
    if (!student) return;
    
    const exportData = {
      name: student.name,
      group: student.group,
      course: student.course,
      major: student.major,
      email: student.email,
      phone: student.phone,
      enrollmentDate: student.enrollmentDate,
      attendanceRecords: studentRecords.map(record => ({
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        subject: record.subject,
        attendanceHours: record.attendanceHours,
        lateMinutes: record.lateMinutes
      })),
      totalAttendanceDays: studentRecords.length,
      totalLateDays: studentRecords.filter(r => r.status === 'late').length,
      averageAttendance: studentRecords.reduce((sum, r) => sum + (r.attendanceHours || 0), 0) / studentRecords.length || 0,
      attendanceRate: (studentRecords.filter(r => r.status === 'present' || r.status === 'late').length / studentRecords.length) * 100 || 0
    };
    
    const headers = [
      'Имя студента', 
      'Группа', 
      'Курс', 
      'Факультет', 
      'Специальность', 
      'Email', 
      'Телефон', 
      'Дата поступления', 
      'Общее количество дней посещения', 
      'Количество опозданий', 
      'Средняя посещаемость (часы)', 
      'Процент посещаемости'
    ];
    const summaryRow = [
      exportData.name,
      exportData.group,
      exportData.course.toString(),
      student.faculty,
      exportData.major,
      exportData.email,
      exportData.phone,
      exportData.enrollmentDate,
      exportData.totalAttendanceDays.toString(),
      exportData.totalLateDays.toString(),
      exportData.averageAttendance.toFixed(2),
      `${exportData.attendanceRate.toFixed(1)}%`
    ];
    
    const recordHeaders = [
      'Дата', 
      'Время прихода', 
      'Время ухода', 
      'Статус', 
      'Предмет', 
      'Часов присутствия', 
      'Минут опоздания'
    ];
    const recordRows = exportData.attendanceRecords.map(record => [
      record.date,
      record.checkIn || '-',
      record.checkOut || '-',
      getStatusText(record.status),
      record.subject || '-',
      record.attendanceHours?.toFixed(2) || '-',
      record.lateMinutes?.toString() || '-'
    ]);
    
    const csvData = [
      createCSVRow(headers),
      createCSVRow(summaryRow),
      '',
      'Детальные записи посещаемости:',
      createCSVRow(recordHeaders),
      ...recordRows.map(row => createCSVRow(row))
    ].join('\n');
    
    downloadCSV(csvData, `student_${student.name.replace(/\s+/g, '_')}_${selectedDate}.csv`);
  };

  const downloadCSV = (csvData: string, filename: string) => {
    // Добавляем BOM для правильного отображения кириллицы в Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvData;
    
    const blob = new Blob([csvWithBOM], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Функция для правильного экранирования CSV данных
  const escapeCSV = (value: string): string => {
    if (value.includes(';') || value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Функция для создания CSV строки с правильным разделителем
  const createCSVRow = (values: string[]): string => {
    return values.map(escapeCSV).join(';');
  };

  const getAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const earlyLeave = attendanceRecords.filter(r => r.status === 'early_leave').length;
    
    return { total, present, late, absent, earlyLeave };
  };

  const stats = getAttendanceStats();

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/admin/service-analysis')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Студенты</h1>
              <p className="text-gray-600">Учет посещаемости и анализ активности студентов</p>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Всего студентов</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Присутствуют</p>
                  <p className="text-2xl font-bold">{stats.present}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Опоздали</p>
                  <p className="text-2xl font-bold">{stats.late}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Отсутствуют</p>
                  <p className="text-2xl font-bold">{stats.absent}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Ушли раньше</p>
                  <p className="text-2xl font-bold">{stats.earlyLeave}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* Поиск */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Поиск по имени, группе или предмету..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Фильтры */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="present">Присутствует</option>
                <option value="late">Опоздал</option>
                <option value="absent">Отсутствует</option>
                <option value="early_leave">Ушел раньше</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Курс</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все курсы</option>
                <option value="1">1 курс</option>
                <option value="2">2 курс</option>
                <option value="3">3 курс</option>
                <option value="4">4 курс</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Факультет</label>
              <select
                value={filterFaculty}
                onChange={(e) => setFilterFaculty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все факультеты</option>
                {FACULTIES.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadAttendanceRecords} variant="outline" className="flex items-center">
              <RefreshCw size={16} className="mr-2" />
              Обновить
            </Button>
            <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 flex items-center">
              <FileSpreadsheet size={16} className="mr-2" />
              Экспорт посещаемости
            </Button>
            <Button onClick={exportAllStudentsData} className="bg-blue-600 hover:bg-blue-700 flex items-center">
              <Users size={16} className="mr-2" />
              Экспорт студентов
            </Button>
          </div>
        </div>

        {/* Таблица учета посещаемости студентов */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Студент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Группа / Курс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Факультет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Предмет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время прихода
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время ухода
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Часов присутствия
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                            {record.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.studentName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{record.studentGroup}</div>
                        <div className="text-gray-500">{record.studentCourse} курс</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-sm text-gray-900">
                        {students.find(s => s.id === record.studentId)?.faculty || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.subject || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkIn ? (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {record.checkIn}
                          {record.lateMinutes && (
                            <span className="ml-2 text-xs text-red-600">
                              (+{record.lateMinutes} мин)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOut ? (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {record.checkOut}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.attendanceHours ? `${record.attendanceHours} ч` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportStudentData(record.studentId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Экспорт данных студента"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const student = students.find(s => s.id === record.studentId);
                            setSelectedStudent(student || null);
                            setShowStudentDetails(true);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Подробная информация"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно с деталями студента */}
        {showStudentDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Детали студента</h3>
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Имя</label>
                    <p className="text-gray-900">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Группа</label>
                    <p className="text-gray-900">{selectedStudent.group}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Курс</label>
                    <p className="text-gray-900">{selectedStudent.course}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Специальность</label>
                    <p className="text-gray-900">{selectedStudent.major}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Факультет</label>
                    <p className="text-gray-900">{selectedStudent.faculty}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Телефон</label>
                    <p className="text-gray-900">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Дата поступления</label>
                    <p className="text-gray-900">{selectedStudent.enrollmentDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Средний балл</label>
                    <p className="text-gray-900">{selectedStudent.gpa || 'Не указан'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => exportStudentData(selectedStudent.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileSpreadsheet size={16} className="mr-2" />
                  Экспорт в Excel
                </Button>
                <Button
                  onClick={() => setShowStudentDetails(false)}
                  variant="outline"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
