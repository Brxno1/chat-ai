import {
  endOfWeek,
  format,
  formatDistance,
  isThisMonth,
  isThisYear,
  isToday,
  isWithinInterval,
  isYesterday,
  startOfWeek,
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

  const now = new Date()
  const weekOptions = { locale: ptBR, weekStartsOn: 1 as const }

  items.forEach((item) => {
    const date = dateSelector(item)
    let groupName: DateGroupType

    if (isToday(date)) {
      groupName = 'Hoje'
    } else if (isYesterday(date)) {
      groupName = 'Ontem'
    } else {
      const weekStart = startOfWeek(now, weekOptions)
      const weekEnd = endOfWeek(now, weekOptions)
      const isCurrentWeek = isWithinInterval(date, {
        start: weekStart,
        end: weekEnd,
      })

      if (isCurrentWeek) {
        groupName = 'Esta semana'
      } else if (isThisMonth(date)) {
        groupName = 'Este mês'
      } else if (isThisYear(date)) {
        groupName = format(date, 'MMMM', { locale: ptBR })
      } else {
        groupName = format(date, 'MMMM yyyy', { locale: ptBR })
      }
    }

    if (!groups[groupName]) {
      groups[groupName] = []
    }

    groups[groupName].push(item)
  })

  const groupOrder: Record<string, number> = {
    Hoje: 0,
    Ontem: 1,
    'Esta semana': 2,
    'Este mês': 3,
  }

  return Object.entries(groups)
    .map(([title, items]) => ({
      title,
      items: items.sort(
        (a, b) => dateSelector(b).getTime() - dateSelector(a).getTime(),
      ),
    }))
    .sort((a, b) => {
      const orderA = groupOrder[a.title] ?? 999
      const orderB = groupOrder[b.title] ?? 999

      if (orderA !== orderB) {
        return orderA - orderB
      }

      return b.title.localeCompare(a.title)
    })
}

export const formatLocations = (locations: string[]) => {
  const formatter = new Intl.ListFormat('pt-BR', {
    style: 'long',
    type: 'conjunction',
  })
  return formatter.format(locations)
}
