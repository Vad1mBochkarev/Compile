/**
 * Форматирует дату в читаемый формат (ru-RU)
 * @param date - ISO строка даты
 * @returns Отформатированная строка
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Форматирует дату в короткий формат (ru-RU)
 * @param date - ISO строка даты
 * @returns Краткая отформатированная строка
 */
export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU');
}
