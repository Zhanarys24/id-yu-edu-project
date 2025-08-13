/**
 * Утилита для объединения классов с фильтрацией falsy-значений
 * @param classes - Массив классов (строки, undefined, false)
 * @returns Объединённая строка классов
 */
export function cn(...classes: Array<string | undefined | false | null>): string {
  return classes.filter(Boolean).join(' ')
}