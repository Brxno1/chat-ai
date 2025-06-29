import {
  format,
  formatDistance,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isYesterday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDateToLocale(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export function formatDateToLocaleWithHour(date: Date): string {
  return format(date, 'HH:mm', { locale: ptBR })
}

export function formatDistanceToNow(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true, locale: ptBR })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const size = bytes / Math.pow(k, i)
  const formattedSize = size >= 10 ? size.toFixed(0) : size.toFixed(1)

  return `${formattedSize} ${units[i]}`
}

type DateGroupType =
  | 'Hoje'
  | 'Ontem'
  | 'Esta semana'
  | 'Este mês'
  | 'Este ano'
  | string

export type DateGroup<T> = {
  title: DateGroupType
  items: T[]
}

export function groupItemsByDate<T>(
  items: T[],
  dateSelector: (item: T) => Date,
): DateGroup<T>[] {
  const groups: Record<string, T[]> = {}

  items.forEach((item) => {
    const date = dateSelector(item)
    let groupName: DateGroupType

    if (isToday(date)) {
      groupName = 'Hoje'
    } else if (isYesterday(date)) {
      groupName = 'Ontem'
    } else if (isThisWeek(date)) {
      groupName = 'Esta semana'
    } else if (isThisMonth(date)) {
      groupName = 'Este mês'
    } else if (isThisYear(date)) {
      groupName = format(date, 'MMMM', { locale: ptBR })
    } else {
      groupName = format(date, 'MMMM yyyy', { locale: ptBR })
    }

    if (!groups[groupName]) {
      groups[groupName] = []
    }

    groups[groupName].push(item)
  })

  return Object.entries(groups).map(([title, items]) => ({
    title,
    items,
  }))
}
