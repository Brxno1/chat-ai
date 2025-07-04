'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
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

import { getTodosAction } from '@/app/api/todo/actions/get-todos'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { queryKeys } from '@/lib/query-client'
import { Todo } from '@/services/database/generated'
import { cn } from '@/utils/utils'

import { columns } from './columns'

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
}

export function TodoDataTable({ initialData }: TodoDataTableProps) {
  const {
    data: todos,
    isFetching,
    isLoading,
    refetch,
  } = useSuspenseQuery({
    queryKey: queryKeys.todos.all,
    queryFn: getTodosAction,
    initialData,
  })

  const hasTodos = todos.length > 0

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

  const handleRefreshTodos = async () => await refetch()

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card p-3">
      {hasTodos && (
        <ContainerWrapper className="flex items-center gap-2 py-4">
          <div className="flex max-w-sm items-center justify-center gap-2">
            <div className="relative flex items-center justify-center">
              <Input
                className="bg-background pr-8 placeholder:text-sm max-sm:max-w-[8.5rem]"
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
              disabled={isFetching || isLoading}
              variant="outline"
              className={cn(
                'max-w-[8rem] gap-2',
                isFetching && 'animate-pulse',
              )}
            >
              <RefreshCcw
                size={16}
                className={cn(isFetching && 'animate-spin')}
              />
              <span className="text-sm max-sm:hidden">
                {isLoading
                  ? 'Atualizar'
                  : isFetching
                    ? 'Atualizando...'
                    : 'Atualizar'}
              </span>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto"
                disabled={isFetching || isLoading}
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

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="max-w-[3.5rem] text-center md:max-w-[10rem]"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'max-md:max-p-0 text-center max-md:max-w-[4rem]',
                    {
                      'animate-pulse': cell.id === 'temp-id',
                    },
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="overflow-x-auto">
        <ContainerWrapper className="flex flex-wrap items-center justify-between gap-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {hasTodos ? (
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
