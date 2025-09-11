/**
 * Утилита для объединения классов с фильтрацией falsy-значений
 * @param classes - Массив классов (строки, undefined, false)
 * @returns Объединённая строка классов
 */
export function cn(...classes: Array<string | undefined | false | null>): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Валидация email адреса
 * @param email - Email для проверки
 * @returns Объект с результатом валидации
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email обязателен' }
  }

  // Базовая проверка длины
  if (email.length > 254) {
    return { isValid: false, error: 'Email слишком длинный (максимум 254 символа)' }
  }

  // Проверка на наличие @ и разделение на 2 части
  if (!email.includes('@')) {
    return { isValid: false, error: 'Email должен содержать символ @' }
  }
  const parts = email.split('@')
  if (parts.length !== 2) {
    return { isValid: false, error: 'Email должен содержать только один символ @' }
  }

  const [localPart, domain] = parts

  // Локальная часть
  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: 'Локальная часть email не может быть пустой' }
  }
  if (localPart.length > 64) {
    return { isValid: false, error: 'Локальная часть email слишком длинная (максимум 64 символа)' }
  }
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error: 'Локальная часть не может начинаться или заканчиваться точкой' }
  }

  // Домен
  if (!domain || domain.length === 0) {
    return { isValid: false, error: 'Домен email не может быть пустым' }
  }
  if (domain.length > 253) {
    return { isValid: false, error: 'Домен email слишком длинный (максимум 253 символа)' }
  }
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, error: 'Домен не может начинаться или заканчиваться точкой' }
  }

  // Запрещаем двойные точки
  if (localPart.includes('..') || domain.includes('..')) {
    return { isValid: false, error: 'Email не может содержать двойные точки' }
  }

  // Разрешенные символы
  const localPartRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
  if (!localPartRegex.test(localPart)) {
    return { isValid: false, error: 'Локальная часть содержит недопустимые символы' }
  }
  const domainRegex = /^[a-zA-Z0-9.-]+$/
  if (!domainRegex.test(domain)) {
    return { isValid: false, error: 'Домен содержит недопустимые символы' }
  }

  // Домен должен содержать точку и валидный TLD
  if (!domain.includes('.')) {
    return { isValid: false, error: 'Домен должен содержать точку' }
  }
  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Домен должен иметь валидное окончание (минимум 2 символа)' }
  }
  const tldRegex = /^[a-zA-Z]+$/
  if (!tldRegex.test(tld)) {
    return { isValid: false, error: 'Окончание домена должно содержать только буквы' }
  }

  return { isValid: true }
}