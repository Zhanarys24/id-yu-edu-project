'use client';

import { useState } from 'react';
import { useAvatar } from '@/context/AvatarContext';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  className?: string;
}

export function AvatarUpload({ className }: AvatarUploadProps) {
  const { avatar, updateAvatar, isUpdating } = useAvatar();
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [error, setError] = useState('');

  const handleUpdateAvatar = async () => {
    if (!newAvatarUrl.trim()) {
      setError('Пожалуйста, введите URL аватарки');
      return;
    }

    try {
      setError('');
      await updateAvatar(newAvatarUrl.trim());
      setNewAvatarUrl('');
    } catch (err) {
      setError('Ошибка при обновлении аватарки');
      console.error('Avatar update error:', err);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <img 
          src={avatar} 
          alt="Avatar" 
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
        />
        <div>
          <p className="text-sm text-gray-600">Текущая аватарка</p>
          {isUpdating && (
            <p className="text-xs text-blue-600">Обновление...</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="avatar-url" className="block text-sm font-medium text-gray-700">
          URL новой аватарки
        </label>
        <input
          id="avatar-url"
          type="url"
          value={newAvatarUrl}
          onChange={(e) => setNewAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUpdating}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
      
      <Button 
        onClick={handleUpdateAvatar}
        disabled={isUpdating || !newAvatarUrl.trim()}
        className="w-full"
      >
        {isUpdating ? 'Обновление...' : 'Обновить аватарку'}
      </Button>
    </div>
  );
}

