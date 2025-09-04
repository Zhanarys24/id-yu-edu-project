/**
 * Безопасное форматирование даты для избежания проблем с гидратацией
 */
export const formatDate = (dateString: string, locale: string = 'ru-RU'): string => {
  if (typeof window === 'undefined') {
    // На сервере используем статическое форматирование
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}.${month}.${year}`;
  }
  
  // На клиенте используем стандартное форматирование
  return new Date(dateString).toLocaleDateString(locale);
};

/**
 * Безопасное форматирование времени для избежания проблем с гидратацией
 */
export const formatTime = (dateString: string, locale: string = 'ru-RU'): string => {
  if (typeof window === 'undefined') {
    // На сервере используем статическое форматирование
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // На клиенте используем стандартное форматирование
  return new Date(dateString).toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
