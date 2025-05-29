'use client'

import { Todo } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  type Table as TableInstance,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ChevronDown, RefreshCcw, X } from 'lucide-react'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { queryKeys } from '@/lib/query-client'
import { cn } from '@/utils/utils'

import { columns } from './columns'
import {
  SkeletonTableBodyFallback,
  TableHeaderFallback,
} from './data-table-fallback'

interface SelectionTextProps {
  table: TableInstance<Todo>
}

function SelectionText({ table }: SelectionTextProps) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length

  const isSingular = selectedCount <= 1

  return (
    <p className="flex items-center gap-1 text-muted-foreground">
      <strong className="text-foreground">{selectedCount}</strong>
      de
      <strong className="text-foreground">
        <NumberTicker value={totalCount} />
      </strong>
      {isSingular ? 'Todo selecionado.' : 'Todos selecionados.'}
    </p>
  )
}

interface TodoDataTableProps {
  initialData: Todo[]
  refreshTodos: () => Promise<Todo[]>
}

export function TodoDataTable({
  initialData,
  refreshTodos,
}: TodoDataTableProps) {
  const {
    data: todos,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.todos.all,
    queryFn: refreshTodos,
    initialData,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })

  const hasTodos = todos.length > 0

  const containerRef = React.useRef<HTMLDivElement>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    columns,
    data: todos ?? [],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const filterValue = table.getColumn('title')?.getFilterValue() as
    | string
    | undefined

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleRefreshTodos = async () => await refetch()

  React.useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom, todos])

  return (
    <div
      className="w-full overflow-x-auto rounded-lg border border-border bg-background p-3 drop-shadow-md"
      ref={containerRef}
    >
      {hasTodos && (
        <ContainerWrapper className="flex flex-wrap items-center gap-2 py-4">
          <div className="flex max-w-sm items-center justify-center gap-2">
            <div className="relative flex items-center justify-center">
              <Input
                className="w-full pr-8"
                placeholder="Filtrar Todos..."
                value={filterValue ?? ''}
                onChange={(ev) =>
                  table.getColumn('title')?.setFilterValue(ev.target.value)
                }
              />
              {filterValue && filterValue.length > 0 && (
                <button
                  onClick={() => table.getColumn('title')?.setFilterValue('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar filtro"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              onClick={handleRefreshTodos}
              disabled={isFetching}
              variant="outline"
              className={cn('w-[8rem] gap-2', isFetching && 'animate-pulse')}
            >
              <RefreshCcw
                size={16}
                className={cn(isFetching && 'animate-spin')}
              />
              {isFetching ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto"
                disabled={isFetching}
              >
                Colunas <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </ContainerWrapper>
      )}

      <Table className="min-w-[75rem]">
        <TableHeader>
          {isFetching ? (
            <TableRow>
              {TableHeaderFallback().map((fallback, index) => (
                <TableHead key={index} className="text-center">
                  {fallback.component}
                </TableHead>
              ))}
            </TableRow>
          ) : (
            table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn('text-center')}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))
          )}
        </TableHeader>
        <TableBody>
          {isFetching ? (
            <SkeletonTableBodyFallback />
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={'text-center'}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="overflow-x-auto">
        <ContainerWrapper className="flex flex-wrap items-center justify-between gap-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {isFetching ? (
              <Skeleton className="h-5 w-40" />
            ) : hasTodos ? (
              <SelectionText table={table} />
            ) : (
              <p className="text-center text-muted-foreground">
                Você ainda não possui nenhum todo. Crie um para que seja exibido
                aqui.
              </p>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isFetching}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isFetching}
            >
              Próximo
            </Button>
          </div>
        </ContainerWrapper>
      </div>
    </div>
  )
}
