# Руководство по работе с аватаркой через API

## Обзор

Добавлена функциональность для работы с аватаркой пользователя через API, аналогично тому, как работает с именем и фамилией. Аватарка теперь синхронизируется с бэкендом и сохраняется в базе данных.

## Новые API endpoints

### POST /api/auth/update-avatar

Обновляет аватарку пользователя в базе данных.

**Параметры:**
```json
{
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Ответ:**
```json
{
  "success": true,
  "avatar": "https://example.com/normalized-avatar.jpg",
  "message": "Avatar updated successfully"
}
```

## Обновленные сервисы

### AuthApi.updateAvatar()

Новый метод в `lib/services/authApi.ts` для обновления аватарки:

```typescript
const response = await AuthApi.updateAvatar('https://example.com/avatar.jpg');
```

### AuthContext.updateAvatar()

Новый метод в `context/AuthContext.tsx` для обновления аватарки с синхронизацией:

```typescript
const { updateAvatar } = useAuth();
await updateAvatar('https://example.com/avatar.jpg');
```

### AvatarContext.updateAvatar()

Новый метод в `context/AvatarContext.tsx` для обновления аватарки с индикатором загрузки:

```typescript
const { updateAvatar, isUpdating } = useAvatar();
await updateAvatar('https://example.com/avatar.jpg');
```

## Использование

### Базовое использование

```tsx
import { useAvatar } from '@/context/AvatarContext';

function MyComponent() {
  const { avatar, updateAvatar, isUpdating } = useAvatar();

  const handleAvatarChange = async (newAvatarUrl: string) => {
    try {
      await updateAvatar(newAvatarUrl);
      console.log('Аватарка обновлена!');
    } catch (error) {
      console.error('Ошибка обновления аватарки:', error);
    }
  };

  return (
    <div>
      <img src={avatar} alt="Avatar" />
      {isUpdating && <p>Обновление...</p>}
      <button onClick={() => handleAvatarChange('https://example.com/new-avatar.jpg')}>
        Изменить аватарку
      </button>
    </div>
  );
}
```

### Использование готового компонента

```tsx
import { AvatarUpload } from '@/components/AvatarUpload';

function ProfilePage() {
  return (
    <div>
      <h1>Профиль пользователя</h1>
      <AvatarUpload />
    </div>
  );
}
```

## Особенности реализации

1. **Синхронизация с API**: Аватарка автоматически сохраняется в базе данных при обновлении
2. **Нормализация URL**: URL аватарки автоматически нормализуется (добавляется базовый URL API если нужно)
3. **Синхронизация между вкладками**: Изменения аватарки синхронизируются между всеми открытыми вкладками
4. **Индикатор загрузки**: Предоставляется состояние `isUpdating` для отображения процесса обновления
5. **Обработка ошибок**: Все методы включают обработку ошибок с соответствующими сообщениями

## Структура данных

Аватарка сохраняется в следующих местах:
- `user.avatar` в объекте пользователя
- `user.avatar` в localStorage
- База данных через API

## Безопасность

- Все запросы требуют авторизации
- URL аватарки валидируется на сервере
- Поддерживается как cookie-based, так и token-based авторизация

