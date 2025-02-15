import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDistanceToNow(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true, locale: ptBR })
}
