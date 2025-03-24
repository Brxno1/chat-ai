import { format, formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDistanceToNow(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true, locale: ptBR })
}
