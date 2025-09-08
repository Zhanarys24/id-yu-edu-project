'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { 
  Clock, Users, Building, Calendar, Download, Search, Filter,
  CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, RefreshCw,
  ArrowLeft, Eye, MoreVertical, MapPin, UserCheck, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Типы для СКУД системы
type AccessRecord = {
  id: string;
  personId: string;
  personName: string;
  personType: 'employee' | 'student';
  personPosition?: string;
  personGroup?: string;
  personCourse?: number;
  accessPoint: string;
  accessType: 'entry' | 'exit';
  timestamp: string;
  cardNumber: string;
  status: 'success' | 'denied' | 'expired';
  notes?: string;
};

type AccessPoint = {
  id: string;
  name: string;
  location: string;
  type: 'main_entrance' | 'classroom' | 'office' | 'lab' | 'library' | 'cafeteria';
  isActive: boolean;
  lastActivity?: string;
};

export default function AttendancePage() {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const [accessRecords, setAccessRecords] = useState<AccessRecord[]>([]);
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPersonType, setFilterPersonType] = useState<string>('all');
  const [filterAccessPoint, setFilterAccessPoint] = useState<string>('all');
  const [showRealTime, setShowRealTime] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/main/news');
    }
    loadAccessPoints();
    loadAccessRecords();
  }, [selectedDate]);

  // Автообновление данных в реальном времени
  useEffect(() => {
    if (showRealTime) {
      const interval = setInterval(() => {
        loadAccessRecords();
      }, 5000); // Обновление каждые 5 секунд
      return () => clearInterval(interval);
    }
  }, [showRealTime, selectedDate]);

  const loadAccessPoints = () => {
    const mockAccessPoints: AccessPoint[] = [
      {
        id: '1',
        name: 'Главный вход',
        location: 'Здание A, 1 этаж',
        type: 'main_entrance',
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      {
        id: '2',
        name: 'IT-лаборатория',
        location: 'Здание B, 3 этаж',
        type: 'lab',
        isActive: true,
        lastActivity: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: '3',
        name: 'Аудитория 101',
        location: 'Здание A, 1 этаж',
        type: 'classroom',
        isActive: true,
        lastActivity: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: '4',
        name: 'Библиотека',
        location: 'Здание C, 2 этаж',
        type: 'library',
        isActive: true,
        lastActivity: new Date(Date.now() - 1200000).toISOString()
      },
      {
        id: '5',
        name: 'Кафетерий',
        location: 'Здание A, 0 этаж',
        type: 'cafeteria',
        isActive: false,
        lastActivity: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setAccessPoints(mockAccessPoints);
  };

  const loadAccessRecords = () => {
    const mockRecords: AccessRecord[] = [
      {
        id: '1',
        personId: '1',
        personName: 'Абыков Мирас',
        personType: 'employee',
        personPosition: 'Директор IT-департамента',
        accessPoint: 'Главный вход',
        accessType: 'entry',
        timestamp: new Date().toISOString(),
        cardNumber: 'EMP001',
        status: 'success'
      },
      {
        id: '2',
        personId: '2',
        personName: 'Алмас Жумабеков',
        personType: 'student',
        personGroup: 'IT-21-1',
        personCourse: 3,
        accessPoint: 'IT-лаборатория',
        accessType: 'entry',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        cardNumber: 'STU001',
        status: 'success'
      },
      {
        id: '3',
        personId: '3',
        personName: 'Айгерим Нурланова',
        personType: 'student',
        personGroup: 'IT-21-2',
        personCourse: 3,
        accessPoint: 'Аудитория 101',
        accessType: 'entry',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        cardNumber: 'STU002',
        status: 'success'
      },
      {
        id: '4',
        personId: '4',
        personName: 'Данияр Касымов',
        personType: 'student',
        personGroup: 'BUS-22-1',
        personCourse: 2,
        accessPoint: 'Библиотека',
        accessType: 'exit',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        cardNumber: 'STU003',
        status: 'success'
      },
      {
        id: '5',
        personId: '5',
        personName: 'Неизвестный пользователь',
        personType: 'student',
        accessPoint: 'Кафетерий',
        accessType: 'entry',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        cardNumber: 'UNK001',
        status: 'denied',
        notes: 'Недействительная карта'
      }
    ];
    setAccessRecords(mockRecords);
  };

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <UserCheck className="w-5 h-5 text-green-500" />;
      case 'exit':
        return <UserX className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAccessTypeText = (type: string) => {
    switch (type) {
      case 'entry':
        return 'Вход';
      case 'exit':
        return 'Выход';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Успешно';
      case 'denied':
        return 'Отказано';
      case 'expired':
        return 'Истек срок';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPersonTypeColor = (type: string) => {
    switch (type) {
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = accessRecords.filter(record => {
    const matchesSearch = record.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.accessPoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.accessType === filterType;
    const matchesPersonType = filterPersonType === 'all' || record.personType === filterPersonType;
    const matchesAccessPoint = filterAccessPoint === 'all' || record.accessPoint === filterAccessPoint;
    return matchesSearch && matchesType && matchesPersonType && matchesAccessPoint;
  });

  const getStats = () => {
    const total = accessRecords.length;
    const entries = accessRecords.filter(r => r.accessType === 'entry').length;
    const exits = accessRecords.filter(r => r.accessType === 'exit').length;
    const successful = accessRecords.filter(r => r.status === 'success').length;
    const denied = accessRecords.filter(r => r.status === 'denied').length;
    const employees = accessRecords.filter(r => r.personType === 'employee').length;
    const students = accessRecords.filter(r => r.personType === 'student').length;
    
    return { total, entries, exits, successful, denied, employees, students };
  };

  const stats = getStats();

  const exportToExcel = () => {
    const headers = ['Время', 'Имя', 'Тип', 'Номер карты', 'Точка доступа', 'Действие', 'Статус', 'Примечания'];
    const csvData = [
      headers.join(','),
      ...accessRecords.map(record => [
        new Date(record.timestamp).toLocaleString(),
        record.personName,
        record.personType === 'employee' ? 'Сотрудник' : 'Студент',
        record.cardNumber,
        record.accessPoint,
        record.accessType === 'entry' ? 'Вход' : 'Выход',
        record.status === 'success' ? 'Успешно' : record.status === 'denied' ? 'Отказано' : 'Истек срок',
        record.notes || '-'
      ].join(','))
    ].join('\n');
    
    downloadCSV(csvData, `access_records_${selectedDate}.csv`);
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
              <h1 className="text-3xl font-bold text-gray-900">СКУД система</h1>
              <p className="text-gray-600">Система контроля и управления доступом</p>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Всего записей</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Входы</p>
                  <p className="text-2xl font-bold">{stats.entries}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <UserX className="w-8 h-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Выходы</p>
                  <p className="text-2xl font-bold">{stats.exits}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Успешные</p>
                  <p className="text-2xl font-bold">{stats.successful}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Отказано</p>
                  <p className="text-2xl font-bold">{stats.denied}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Сотрудники</p>
                  <p className="text-2xl font-bold">{stats.employees}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Студенты</p>
                  <p className="text-2xl font-bold">{stats.students}</p>
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
                  placeholder="Поиск по имени, карте или точке доступа..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все типы</option>
                <option value="entry">Вход</option>
                <option value="exit">Выход</option>
              </select>
              <select
                value={filterPersonType}
                onChange={(e) => setFilterPersonType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все типы</option>
                <option value="employee">Сотрудники</option>
                <option value="student">Студенты</option>
              </select>
              <select
                value={filterAccessPoint}
                onChange={(e) => setFilterAccessPoint(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все точки</option>
                {accessPoints.map(point => (
                  <option key={point.id} value={point.name}>{point.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button 
                onClick={loadAccessRecords} 
                variant="outline"
              >
                <RefreshCw size={16} className="mr-2" />
                Обновить
              </Button>
              <Button 
                onClick={() => setShowRealTime(!showRealTime)}
                className={showRealTime ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {showRealTime ? "Остановить" : "Реальное время"}
              </Button>
              <Button onClick={exportToExcel} className="bg-blue-600 hover:bg-blue-700">
                <FileSpreadsheet size={16} className="mr-2" />
                Экспорт Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Точки доступа */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Точки доступа</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessPoints.map(point => (
              <div key={point.id} className={`p-4 rounded-lg border-2 ${point.isActive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{point.name}</h4>
                    <p className="text-sm text-gray-600">{point.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Последняя активность: {point.lastActivity ? new Date(point.lastActivity).toLocaleTimeString() : 'Нет данных'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${point.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Таблица записей доступа */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Человек
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Карта
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Точка доступа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действие
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Примечания
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${
                            record.personType === 'employee' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}>
                            {record.personName.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.personName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.personPosition || record.personGroup}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPersonTypeColor(record.personType)}`}>
                        {record.personType === 'employee' ? 'Сотрудник' : 'Студент'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.cardNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {record.accessPoint}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getAccessTypeIcon(record.accessType)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getAccessTypeText(record.accessType)}
                        </span>
                      </div>
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
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
