/* eslint-disable prettier/prettier */
'use client'

import { Todo } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import {
  ColumnDef,
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
import { ArrowUpDown, ChevronDown, RefreshCcw, X } from 'lucide-react'
import React from 'react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent, DropdownMenuTrigger
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDistanceToNow } from '@/utils/format'
import { cn } from '@/utils/utils'

import { ActionsForTodo } from './actions-for-todo'
import { BadgeStatus } from './badge-status'

export const columns: ColumnDef<Todo>[] = [
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <div className="">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: () => (
      <div className="text-center">
        <Button variant="ghost" className="hover:bg-transparent cursor-default">
          Status
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const { status } = row.original

      return (
        <ContainerWrapper className="flex items-center justify-center">
          <BadgeStatus status={status} />
        </ContainerWrapper>
      )
    },

    sortingFn: (rowA, rowB) => {
      const statusOrder: Record<'finished' | 'pending' | 'cancelled', number> = {
        finished: 1,
        pending: 2,
        cancelled: 3,
      }

      const statusA = rowA.original.status.toLowerCase() as 'finished' | 'pending' | 'cancelled'
      const statusB = rowB.original.status.toLowerCase() as 'finished' | 'pending' | 'cancelled'

      return statusOrder[statusA] - statusOrder[statusB]
    },
  },
  {
    id: 'title',
    accessorKey: 'title',
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="hover:bg-transparent text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Título
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('title')}</div>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="hover:bg-transparent text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Criado em
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.original.createdAt

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-center font-medium">
              {formatDistanceToNow(createdAt)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {new Date(createdAt).toLocaleString()}
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Atualizado em
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const { updatedAt } = row.original

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="ml-auto text-center font-medium">
              {formatDistanceToNow(updatedAt)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {new Date(updatedAt).toLocaleString()}
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => <Button variant="ghost" className="hover:bg-transparent cursor-default">Ações</Button>,
    cell: ({ row }) => {
      const todo = row.original

      return (
        <div className="text-center font-medium">
          <ActionsForTodo todo={todo} />
        </div>
      )
    },
  },
]

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
      <strong className="text-foreground">{totalCount}</strong>
      {isSingular ? 'Todo selecionado.' : 'Todos selecionados.'}
    </p>
  )
}

interface TodoDataTableProps {
  initialData: Todo[]
  refreshTodos: () => Promise<Todo[]>
}

export function TodoDataTable({ initialData, refreshTodos }: TodoDataTableProps) {
  const containerRef = React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>

  const { data: todos, isFetching, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: refreshTodos,
    staleTime: Infinity,
    initialData,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  })

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
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

  const skeletonSizes = [
    'h-5 w-5 mx-auto',
    'h-5 w-24 mx-auto',
    'h-5 w-24 mx-auto',
    'h-5 w-28 mx-auto',
    'h-5 w-28 mx-auto',
    'h-5 w-5 mx-auto',
  ];

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    <ContainerWrapper className="rounded-lg border border-border px-3 py-4" ref={containerRef}>
      {todos.length > 0 && (
        <ContainerWrapper className="flex items-center py-4">
          <div className="relative flex items-center justify-center max-w-sm gap-2">
            <Input
              placeholder="Filtrar Todos..."
              value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('title')?.setFilterValue(event.target.value)
              }
              className="w-full pr-8"
            />
            {((table.getColumn('title')?.getFilterValue() as string) ?? '') !== '' && (
              <button
                onClick={() => table.getColumn('title')?.setFilterValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar filtro"
              >
                <X size={16} />
              </button>
            )}
            <Button onClick={() => refetch()} disabled={isFetching} variant="outline" className={cn(isFetching && 'animate-pulse')}>
              <RefreshCcw size={16} className={cn(isFetching && 'animate-spin')} />
              {isFetching ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
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
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn('text-center')}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching ? (              
              Array.from({ length: todos.length > 10 ? 10 : todos.length }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className='h-12'>
                {table.getHeaderGroups()[0].headers.map((_, cellIndex) => (
                  <TableCell key={`skeleton-cell-${cellIndex}`} className={"text-center"}>
                      <Skeleton className={cn(skeletonSizes[cellIndex % skeletonSizes.length])} />
                    </TableCell>
                  ))}
                  </TableRow>
                ))
              ) : (
              table
                .getRowModel()
                .rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={"text-center"}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            )}

          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <ContainerWrapper className="flex-1 text-sm text-muted-foreground">
          {!isFetching && todos.length > 0 && (
            <SelectionText table={table} />
          )}
          {isFetching && (
            <Skeleton className="h-5 w-40" />
          )}
          {todos.length === 0 && (
            <p className="text-muted-foreground text-center">
              Você ainda não possui nenhum todo. Crie um para que seja exibido aqui.
            </p>
          )}
        </ContainerWrapper>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </ContainerWrapper>
  )
}
