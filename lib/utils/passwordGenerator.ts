// Генератор временных паролей
export function generateTemporaryPassword(length: number = 8): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}

// Простое хеширование пароля (в продакшене использовать bcrypt)
export function hashPassword(password: string): string {
  // Простой hash для демонстрации (НЕ ИСПОЛЬЗОВАТЬ В ПРОДАКШЕНЕ!)
  return btoa(password + 'salt_key_yu_edu');
}

// Проверка пароля
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Проверка силы пароля
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Пароль должен содержать минимум 8 символов');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Добавьте строчные буквы');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Добавьте заглавные буквы');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Добавьте цифры');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Добавьте специальные символы');
  } else {
    score += 1;
  }

  const isStrong = score >= 4;

  if (isStrong) {
    feedback.push('Пароль достаточно надежный');
  }

  return { score, feedback, isStrong };
}

