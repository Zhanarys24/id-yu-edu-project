/**
 * Получить переведенное название роли
 * @param role - роль пользователя из API
 * @param t - функция перевода из react-i18next
 * @returns переведенное название роли
 */
export const getTranslatedRole = (role: string, t: (key: string) => string): string => {
  const roleKey = `roles.${role}` as const
  return t(roleKey)
}

/**
 * Получить переведенное название роли с fallback
 * @param role - роль пользователя из API
 * @param t - функция перевода из react-i18next
 * @param fallback - значение по умолчанию, если перевод не найден
 * @returns переведенное название роли
 */
export const getTranslatedRoleWithFallback = (
  role: string, 
  t: (key: string) => string, 
  fallback: string = role
): string => {
  const roleKey = `roles.${role}` as const
  const translated = t(roleKey)
  
  // Если перевод не найден (возвращается тот же ключ), используем fallback
  if (translated === roleKey) {
    return fallback
  }
  
  return translated
}
