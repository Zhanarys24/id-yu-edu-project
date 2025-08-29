'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, ArrowLeft, Edit, Trash2, Plus, Shield, CheckCircle, XCircle, Key, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { userService } from '@/lib/services/userService';
import { RegisteredUser } from '@/lib/types/user';
import { UserRole } from '@/lib/types/auth';

export default function AdminUsersPage() {
  const { user, canAccess } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
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
      case 'admin_news': return 'Админ новостей';
      case 'admin_events': return 'Админ мероприятий';
      case 'admin_education': return 'Админ образования';
      case 'admin_eservices': return 'Админ Е-услуг';
      case 'admin_yessenovai': return 'Админ YessenovAI';
      case 'admin_gamification': return 'Админ YU-Gamification';
      case 'admin_portfolio': return 'Админ портфолио';
      case 'super_admin': return 'Супер администратор';
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

    userService.registerUser(newUserEmail, newUserName, newUserRole);
    loadUsers();
    setShowAddModal(false);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserRole('student');
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
                <option value="admin_news">Админ новостей</option>
                <option value="admin_events">Админ мероприятий</option>
                <option value="admin_education">Админ образования</option>
                <option value="admin_eservices">Админ Е-услуг</option>
                <option value="admin_yessenovai">Админ YessenovAI</option>
                <option value="admin_gamification">Админ YU-Gamification</option>
                <option value="admin_portfolio">Админ портфолио</option>
                <option value="super_admin">Супер администратор</option>
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
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Добавить пользователя
              </button>
            </div>
          </div>
        </div>

        {/* Таблица пользователей */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Последний вход
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пароль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="student">Студент</option>
                          <option value="admin_news">Админ новостей</option>
                          <option value="admin_events">Админ мероприятий</option>
                          <option value="admin_education">Админ образования</option>
                          <option value="admin_eservices">Админ Е-услуг</option>
                          <option value="admin_yessenovai">Админ YessenovAI</option>
                          <option value="admin_gamification">Админ YU-Gamification</option>
                          <option value="admin_portfolio">Админ портфолио</option>
                          <option value="super_admin">Супер администратор</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.registeredAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ru-RU') : 'Никогда'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <code className={`text-xs px-2 py-1 rounded ${
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
                            {showPasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {user.isTemporaryPassword && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Временный
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => setEditingUser(editingUser?.id === user.id ? null : user)}
                          title="Изменить роль"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-900"
                          onClick={() => handleGenerateNewPassword(user.id)}
                          disabled={generatingPassword === user.id}
                          title="Сгенерировать новый временный пароль"
                        >
                          {generatingPassword === user.id ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
                        </button>
                        <button 
                          className={user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.isActive ? "Заблокировать" : "Активировать"}
                        >
                          {user.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        {user.role !== 'super_admin' && (
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Удалить"
                          >
                            <Trash2 size={16} />
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
                    Роль
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Студент</option>
                    <option value="admin_news">Админ новостей</option>
                    <option value="admin_events">Админ мероприятий</option>
                    <option value="admin_education">Админ образования</option>
                    <option value="admin_eservices">Админ Е-услуг</option>
                    <option value="admin_yessenovai">Админ YessenovAI</option>
                    <option value="admin_gamification">Админ YU-Gamification</option>
                    <option value="admin_portfolio">Админ портфолио</option>
                    <option value="super_admin">Супер администратор</option>
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
