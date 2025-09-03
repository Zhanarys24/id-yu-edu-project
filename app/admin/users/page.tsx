'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, ArrowLeft, Edit, Trash2, Plus, Shield, CheckCircle, XCircle, Key, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { userService } from '@/lib/services/userService';
import { RegisteredUser } from '@/lib/types/user';
import { UserRole } from '@/lib/types/auth';

export default function AdminUsersPage() {
  const { user, canAccess, refreshUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [editingUserInfo, setEditingUserInfo] = useState<RegisteredUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPosition, setNewUserPosition] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [generatingPassword, setGeneratingPassword] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccess('site_settings', 'manage')) {
      router.push('/admin');
    }
  }, [user, canAccess, router]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(userService.getAllUsers());
  };

  if (!canAccess('site_settings', 'manage')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600">Только супер-админ может управлять пользователями</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'student': return 'Студент';
      case 'admin_news': return 'Новости';
      case 'admin_events': return 'Мероприятия';
      case 'admin_education': return 'Образование';
      case 'admin_eservices': return 'Е-услуги';
      case 'admin_yessenovai': return 'YessenovAI';
      case 'admin_gamification': return 'Геймификация';
      case 'admin_portfolio': return 'Портфолио';
      case 'super_admin': return 'Супер-админ';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin_news': return 'bg-blue-100 text-blue-800';
      case 'admin_events': return 'bg-green-100 text-green-800';
      case 'admin_education': return 'bg-indigo-100 text-indigo-800';
      case 'admin_eservices': return 'bg-orange-100 text-orange-800';
      case 'admin_yessenovai': return 'bg-cyan-100 text-cyan-800';
      case 'admin_gamification': return 'bg-yellow-100 text-yellow-800';
      case 'admin_portfolio': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (userService.updateUserRole(userId, newRole)) {
      loadUsers();
      setEditingUser(null);
    }
  };

  const handleToggleStatus = (userId: string) => {
    if (userService.toggleUserStatus(userId)) {
      loadUsers();
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      if (userService.deleteUser(userId)) {
        loadUsers();
      }
    }
  };

  const handleAddUser = () => {
    if (!newUserEmail || !newUserName) {
      alert('Заполните все поля');
      return;
    }

    userService.registerUser(newUserEmail, newUserName, newUserRole, newUserPosition);
    loadUsers();
    setShowAddModal(false);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserPosition('');
    setNewUserRole('student');
  };

  const handleEditUserInfo = (userId: string, newName: string, newPosition: string) => {
    if (userService.updateUserInfo(userId, newName, newPosition)) {
      loadUsers();
      setEditingUserInfo(null);
      
      // Если редактируем текущего пользователя, обновляем его данные в контексте
      if (user && user.id === userId) {
        refreshUser();
        alert('Ваши данные обновлены! Изменения отразятся на всех страницах сайта.');
      } else {
        alert('Данные пользователя успешно обновлены!');
      }
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleGenerateNewPassword = async (userId: string) => {
    setGeneratingPassword(userId);
    try {
      const newPassword = userService.generateNewTemporaryPassword(userId);
      if (newPassword) {
        loadUsers();
        alert(`Новый временный пароль: ${newPassword}\nПользователь должен будет сменить его при следующем входе.`);
      } else {
        alert('Ошибка при генерации нового пароля');
      }
    } catch (error) {
      alert('Ошибка при генерации нового пароля');
    } finally {
      setGeneratingPassword(null);
    }
  };

  const stats = userService.getUserStats();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <Users size={32} className="text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">
              Управление пользователями
            </h1>
          </div>
          <p className="text-gray-600">
            Управление ролями и правами всех пользователей системы
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Всего пользователей</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Активных</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Заблокированных</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.temporaryPasswords}</div>
            <div className="text-sm text-gray-600">Временных паролей</div>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск
              </label>
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роль
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="all">Все роли</option>
                <option value="student">Студент</option>
                <option value="admin_news">Новости</option>
                <option value="admin_events">Мероприятия</option>
                <option value="admin_education">Образование</option>
                <option value="admin_eservices">Е-услуги</option>
                <option value="admin_yessenovai">YessenovAI</option>
                <option value="admin_gamification">Геймификация</option>
                <option value="admin_portfolio">Портфолио</option>
                <option value="super_admin">Супер-админ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Заблокированные</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Действия
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Добавить пользователя
                </button>
                <button
                  onClick={() => {
                    loadUsers();
                    refreshUser();
                    alert('Данные обновлены!');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Обновить данные
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица пользователей */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ scrollbarWidth: 'thin' }}>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    Пользователь
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Должность
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Роль
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Регистрация
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Последний вход
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Статус
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Пароль
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap">
                      {editingUserInfo?.id === user.id ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            defaultValue={user.name}
                            id={`name-${user.id}`}
                            className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 w-full"
                            placeholder="Имя"
                          />
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {editingUserInfo?.id === user.id ? (
                        <input
                          type="text"
                          defaultValue={user.position || ''}
                          id={`position-${user.id}`}
                          className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 w-full"
                          placeholder="Должность"
                        />
                      ) : (
                        <div className="text-xs text-gray-600 truncate" title={user.position || 'Не указана'}>
                          {user.position || 'Не указана'}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="text-xs px-1 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="student">Студент</option>
                          <option value="admin_news">Новости</option>
                          <option value="admin_events">Мероприятия</option>
                          <option value="admin_education">Образование</option>
                          <option value="admin_eservices">Е-услуги</option>
                          <option value="admin_yessenovai">YessenovAI</option>
                          <option value="admin_gamification">Геймификация</option>
                          <option value="admin_portfolio">Портфолио</option>
                          <option value="super_admin">Супер-админ</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-500">
                      {new Date(user.registeredAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ru-RU') : 'Никогда'}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1">
                          <code className={`text-xs px-1 py-0.5 rounded ${
                            user.isTemporaryPassword ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {showPasswords[user.id] 
                              ? (user.temporaryPassword || '••••••••')
                              : '••••••••'
                            }
                          </code>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title={showPasswords[user.id] ? 'Скрыть пароль' : 'Показать пароль'}
                          >
                            {showPasswords[user.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                        {user.isTemporaryPassword && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Врем.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        {editingUserInfo?.id === user.id ? (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-900 p-1"
                              onClick={() => {
                                const nameInput = document.getElementById(`name-${user.id}`) as HTMLInputElement;
                                const positionInput = document.getElementById(`position-${user.id}`) as HTMLInputElement;
                                if (nameInput && positionInput) {
                                  handleEditUserInfo(user.id, nameInput.value, positionInput.value);
                                }
                              }}
                              title="Сохранить изменения"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button 
                              className="text-gray-600 hover:text-gray-900 p-1"
                              onClick={() => setEditingUserInfo(null)}
                              title="Отменить редактирование"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1"
                            onClick={() => setEditingUserInfo(editingUserInfo?.id === user.id ? null : user)}
                            title="Изменить имя и должность"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        <button 
                          className="text-purple-600 hover:text-purple-900 p-1"
                          onClick={() => setEditingUser(editingUser?.id === user.id ? null : user)}
                          title="Изменить роль"
                        >
                          <Shield size={14} />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900 p-1"
                          onClick={() => handleGenerateNewPassword(user.id)}
                          disabled={generatingPassword === user.id}
                          title="Сгенерировать новый временный пароль"
                        >
                          {generatingPassword === user.id ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                        </button>
                        <button 
                          className={`p-1 ${user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.isActive ? "Заблокировать" : "Активировать"}
                        >
                          {user.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                        {user.role !== 'super_admin' && (
                          <button 
                            className="text-red-600 hover:text-red-900 p-1"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Удалить"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Модальное окно добавления пользователя */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Добавить нового пользователя
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Имя пользователя"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Должность
                  </label>
                  <input
                    type="text"
                    value={newUserPosition}
                    onChange={(e) => setNewUserPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Должность пользователя"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Студент</option>
                    <option value="admin_news">Новости</option>
                    <option value="admin_events">Мероприятия</option>
                    <option value="admin_education">Образование</option>
                    <option value="admin_eservices">Е-услуги</option>
                    <option value="admin_yessenovai">YessenovAI</option>
                    <option value="admin_gamification">Геймификация</option>
                    <option value="admin_portfolio">Портфолио</option>
                    <option value="super_admin">Супер-админ</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
