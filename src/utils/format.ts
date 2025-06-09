import { format, formatDistance } from 'date-fns'
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
