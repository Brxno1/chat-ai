import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  RefreshCcw,
} from 'lucide-react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function TodoDataTableFallback() {
  const headers = [
    { icon: null, text: '', component: <Checkbox disabled /> },
    { icon: null, text: 'Status', component: null },
    { icon: <ArrowUpDown />, text: 'Título', component: null },
    { icon: <ArrowUpDown />, text: 'Criado em', component: null },
    { icon: <ArrowUpDown />, text: 'Atualizado em', component: null },
    { icon: null, text: 'Ações', component: null },
  ]

  return (
    <ContainerWrapper className="rounded-lg border border-border bg-muted p-3 drop-shadow-md dark:bg-background">
      <ContainerWrapper className="flex items-center py-4">
        <div className="relative flex max-w-sm items-center justify-center gap-2">
          <Input placeholder="Filtrar Todos..." disabled className="w-full" />
          <Button
            variant="outline"
            className="animate-pulse cursor-not-allowed"
          >
            <RefreshCcw
              size={16}
              className="animate-duration-1000 animate-spin"
            />{' '}
            Atualizando...
          </Button>
        </div>
        <Button variant="outline" className="ml-auto" disabled>
          Colunas <ChevronDown />
        </Button>
      </ContainerWrapper>

      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="text-center">
                {index === 0 ? (
                  <div className="flex justify-center">
                    <Checkbox disabled />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="cursor-default hover:bg-transparent"
                    disabled
                  >
                    {header.text}
                    {header.icon}
                  </Button>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <SkeletonTableBodyFallback />
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 py-4">
        <ContainerWrapper className="flex-1">
          <Skeleton className="h-5 w-40" />
        </ContainerWrapper>
        <div className="space-x-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
          </Button>
        </div>
      </div>
    </ContainerWrapper>
  )
}

interface TableHeaderFallback {
  component: React.ReactNode
  icon?: React.ReactNode
}

function TableHeaderFallback() {
  const headersFallback: TableHeaderFallback[] = [
    { component: <Checkbox disabled /> },
    {
      component: (
        <Button variant="ghost" disabled>
          Status
        </Button>
      ),
    },
    {
      component: (
        <Button variant="ghost" disabled>
          Título <ArrowUpDown />
        </Button>
      ),
    },
    {
      component: (
        <Button variant="ghost" disabled>
          Criado em <ArrowUpDown />
        </Button>
      ),
    },
    {
      component: (
        <Button variant="ghost" disabled>
          Atualizado em <ArrowUpDown />
        </Button>
      ),
    },
    {
      component: (
        <Button variant="ghost" disabled>
          Ações
        </Button>
      ),
    },
  ]

  return headersFallback
}

function SkeletonTableBodyFallback() {
  const skeletonSizes = [
    'h-6 rounded-sm w-24 mx-auto',
    'h-5 w-24 mx-auto',
    'h-5 w-28 mx-auto',
    'h-5 w-28 mx-auto',
  ]

  return Array.from({ length: 10 }).map((_, rowIndex) => (
    <TableRow key={rowIndex} className="h-12">
      <TableCell className="text-center">
        <Checkbox disabled />
      </TableCell>
      {skeletonSizes.map((size, index) => (
        <TableCell key={index} className="text-center">
          <Skeleton className={size} />
        </TableCell>
      ))}
      <TableCell className="text-center">
        <MoreHorizontal className="mx-auto h-5 w-5 text-muted-foreground" />
      </TableCell>
    </TableRow>
  ))
}

export { TodoDataTableFallback, TableHeaderFallback, SkeletonTableBodyFallback }
