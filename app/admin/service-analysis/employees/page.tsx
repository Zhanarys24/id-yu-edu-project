'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  Users, Clock, Download, Search, Filter, Calendar,
  AlertTriangle, CheckCircle, XCircle, FileSpreadsheet,
  ArrowLeft, RefreshCw, Eye, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Типы для системы учета рабочего времени
type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent' | 'early_leave';
  lateMinutes?: number;
  workHours?: number;
  notes?: string;
};

type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  isActive: boolean;
  workSchedule: {
    startTime: string;
    endTime: string;
    breakDuration: number; // в минутах
  };
};

export default function EmployeesPage() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/main/news');
    }
    loadEmployees();
    loadAttendanceRecords();
  }, [selectedDate]);

  const loadEmployees = () => {
    // Моковые данные сотрудников
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'Абыков Мирас',
        position: 'Директор IT-департамента',
        department: 'IT',
        email: 'aidar@yu.edu.kz',
        phone: '+7 777 123 4567',
        hireDate: '2020-01-15',
        isActive: true,
        workSchedule: { startTime: '09:00', endTime: '18:00', breakDuration: 60 }
      },
      {
        id: '2',
        name: 'Асель Толеуова',
        position: 'Менеджер по коммуникациям',
        department: 'Маркетинг',
        email: 'asel@yu.edu.kz',
        phone: '+7 777 234 5678',
        hireDate: '2021-03-20',
        isActive: true,
        workSchedule: { startTime: '09:00', endTime: '18:00', breakDuration: 60 }
      },
      {
        id: '3',
        name: 'Данияр Касымов',
        position: 'Координатор академических программ',
        department: 'Образование',
        email: 'daniyar@yu.edu.kz',
        phone: '+7 777 345 6789',
        hireDate: '2019-09-01',
        isActive: true,
        workSchedule: { startTime: '09:00', endTime: '18:00', breakDuration: 60 }
      },
      {
        id: '4',
        name: 'Жанар Сейтжанова',
        position: 'Организатор мероприятий',
        department: 'События',
        email: 'zhanar@yu.edu.kz',
        phone: '+7 777 456 7890',
        hireDate: '2022-01-10',
        isActive: true,
        workSchedule: { startTime: '09:00', endTime: '18:00', breakDuration: 60 }
      }
    ];
    setEmployees(mockEmployees);
  };

  const loadAttendanceRecords = () => {
    // Моковые данные учета рабочего времени
    const mockRecords: AttendanceRecord[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Абыков Мирас',
        employeePosition: 'Директор IT-департамента',
        date: selectedDate,
        checkIn: '08:45',
        checkOut: '18:15',
        status: 'present',
        workHours: 8.5
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Асель Толеуова',
        employeePosition: 'Менеджер по коммуникациям',
        date: selectedDate,
        checkIn: '09:15',
        checkOut: '18:00',
        status: 'late',
        lateMinutes: 15,
        workHours: 8.25
      },
      {
        id: '3',
        employeeId: '3',
        employeeName: 'Данияр Касымов',
        employeePosition: 'Координатор академических программ',
        date: selectedDate,
        checkIn: '08:55',
        checkOut: '17:30',
        status: 'early_leave',
        workHours: 7.5
      },
      {
        id: '4',
        employeeId: '4',
        employeeName: 'Жанар Сейтжанова',
        employeePosition: 'Организатор мероприятий',
        date: selectedDate,
        checkIn: '09:00',
        checkOut: '18:00',
        status: 'present',
        workHours: 8
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
        return 'На работе';
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
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeePosition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToExcel = () => {
    // Экспорт всех данных сотрудников
    const exportData = attendanceRecords.map(record => ({
      timestamp: record.date + ' ' + record.checkIn,
      personName: record.employeeName,
      personType: 'employee',
      cardNumber: 'EMP' + record.employeeId,
      accessPoint: 'Офис',
      accessType: record.checkOut ? 'exit' : 'entry',
      status: record.status,
      notes: record.notes
    }));
    
    // Создаем CSV данные
    const headers = ['Время', 'Имя', 'Должность', 'Время прихода', 'Время ухода', 'Статус', 'Отработано часов'];
    const csvData = [
      headers.join(','),
      ...attendanceRecords.map(record => [
        record.date,
        record.employeeName,
        record.employeePosition,
        record.checkIn,
        record.checkOut || '-',
        record.status,
        record.workHours?.toString() || '-'
      ].join(','))
    ].join('\n');
    
    downloadCSV(csvData, `employees_attendance_${selectedDate}.csv`);
  };

  const exportEmployeeData = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const employeeRecords = attendanceRecords.filter(r => r.employeeId === employeeId);
    
    if (!employee) return;
    
    const exportData = {
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
      hireDate: employee.hireDate,
      workSchedule: `${employee.workSchedule.startTime} - ${employee.workSchedule.endTime}`,
      attendanceRecords: employeeRecords.map(record => ({
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        workHours: record.workHours,
        lateMinutes: record.lateMinutes
      })),
      totalWorkDays: employeeRecords.length,
      totalLateDays: employeeRecords.filter(r => r.status === 'late').length,
      averageWorkHours: employeeRecords.reduce((sum, r) => sum + (r.workHours || 0), 0) / employeeRecords.length || 0,
      attendanceRate: (employeeRecords.filter(r => r.status === 'present' || r.status === 'late').length / employeeRecords.length) * 100 || 0
    };
    
    const headers = ['Имя', 'Должность', 'Отдел', 'Email', 'Телефон', 'Дата найма', 'Рабочий график', 'Общее количество рабочих дней', 'Количество опозданий', 'Среднее время работы (часы)', 'Процент посещаемости'];
    const summaryRow = [
      exportData.name,
      exportData.position,
      exportData.department,
      exportData.email,
      exportData.phone,
      exportData.hireDate,
      exportData.workSchedule,
      exportData.totalWorkDays.toString(),
      exportData.totalLateDays.toString(),
      exportData.averageWorkHours.toFixed(2),
      `${exportData.attendanceRate.toFixed(1)}%`
    ];
    
    const recordHeaders = ['Дата', 'Время прихода', 'Время ухода', 'Статус', 'Отработано часов', 'Минут опоздания'];
    const recordRows = exportData.attendanceRecords.map(record => [
      record.date,
      record.checkIn,
      record.checkOut || '-',
      record.status,
      record.workHours?.toFixed(2) || '-',
      record.lateMinutes?.toString() || '-'
    ]);
    
    const csvData = [
      headers.join(','),
      summaryRow.join(','),
      '',
      'Детальные записи посещаемости:',
      recordHeaders.join(','),
      ...recordRows.map(row => row.join(','))
    ].join('\n');
    
    downloadCSV(csvData, `employee_${employee.name.replace(/\s+/g, '_')}_${selectedDate}.csv`);
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
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
              <h1 className="text-3xl font-bold text-gray-900">Сотрудники</h1>
              <p className="text-gray-600">Учет рабочего времени и контроль посещаемости</p>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Всего сотрудников</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">На работе</p>
                  <p className="text-2xl font-bold">{attendanceRecords.filter(r => r.status === 'present').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Опозданий</p>
                  <p className="text-2xl font-bold">{attendanceRecords.filter(r => r.status === 'late').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Отсутствует</p>
                  <p className="text-2xl font-bold">{attendanceRecords.filter(r => r.status === 'absent').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по имени или должности..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="present">На работе</option>
                <option value="late">Опоздал</option>
                <option value="absent">Отсутствует</option>
                <option value="early_leave">Ушел раньше</option>
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={loadAttendanceRecords} variant="outline">
                <RefreshCw size={16} className="mr-2" />
                Обновить
              </Button>
              <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                <FileSpreadsheet size={16} className="mr-2" />
                Экспорт Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Таблица учета рабочего времени */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Должность
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
                    Отработано часов
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
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {record.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.employeeName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.employeePosition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {record.checkIn}
                        {record.lateMinutes && (
                          <span className="ml-2 text-xs text-red-600">
                            (+{record.lateMinutes} мин)
                          </span>
                        )}
                      </div>
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
                      {record.workHours ? `${record.workHours} ч` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportEmployeeData(record.employeeId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Экспорт данных сотрудника"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const employee = employees.find(e => e.id === record.employeeId);
                            setSelectedEmployee(employee || null);
                            setShowEmployeeDetails(true);
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

        {/* Модальное окно с деталями сотрудника */}
        {showEmployeeDetails && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Детали сотрудника</h3>
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Имя</label>
                    <p className="text-gray-900">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Должность</label>
                    <p className="text-gray-900">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Отдел</label>
                    <p className="text-gray-900">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Телефон</label>
                    <p className="text-gray-900">{selectedEmployee.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Дата найма</label>
                    <p className="text-gray-900">{selectedEmployee.hireDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Рабочий график</label>
                  <p className="text-gray-900">
                    {selectedEmployee.workSchedule.startTime} - {selectedEmployee.workSchedule.endTime}
                    <span className="text-gray-500 ml-2">
                      (перерыв: {selectedEmployee.workSchedule.breakDuration} мин)
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => exportEmployeeData(selectedEmployee.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileSpreadsheet size={16} className="mr-2" />
                  Экспорт в Excel
                </Button>
                <Button
                  onClick={() => setShowEmployeeDetails(false)}
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
