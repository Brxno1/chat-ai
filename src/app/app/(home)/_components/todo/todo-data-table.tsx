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
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import * as React from 'react'

import { getTodos } from '@/app/http/get-todos'
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
import { formatDistanceToNow } from '@/lib/format'

import { BadgeStatus } from '../badge-status'
import { ActionsForTodo } from './actions-for-todo'

export const columns: ColumnDef<Todo>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="flex items-center justify-center text-right"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="flex items-center justify-center text-right"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'doneAt',
    accessorKey: 'doneAt',
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const { doneAt } = row.original

      return (
        <div className="flex items-center justify-center">
          <BadgeStatus status={doneAt ? 'finished' : 'pending'} />
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const statusOrder: Record<'finished' | 'pending' | 'cancelled', number> =
      {
        finished: 1,
        pending: 2,
        cancelled: 3,
      }

      const statusA = rowA.original.doneAt ? 'finished' : 'pending'
      const statusB = rowB.original.doneAt ? 'finished' : 'pending'

      return statusOrder[statusA] - statusOrder[statusB]
    },
    enableSorting: true,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Título
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="ml-4 capitalize">{row.getValue('title')}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Criado em
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as Date
      return (
        <div className="ml-4 text-left font-medium">
          {formatDistanceToNow(createdAt)}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'updatedAt',
    header: () => <div className="mr-5 text-right">Atualizado em</div>,
    cell: ({ row }) => {
      const updatedAt = row.getValue('updatedAt') as Date

      return (
        <div className="text-right font-medium">
          {formatDistanceToNow(updatedAt)}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const todo = row.original

      return <ActionsForTodo todo={todo} />
    },
  },
]

export function TodoDataTable() {
  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
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
    'h-5 w-6',
    'h-5 w-24',
    'h-5 w-24',
    'h-5 w-40',
    'h-5 w-40 ml-auto',
    'h-5 w-6',
  ];

  return (
    <div className="mt-4 rounded-lg border border-border px-3 py-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar Todos..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
      </div>
      <div>
        <Table className="rounded-lg">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => (
                  <TableHead key={header.id}>
                    {!todos ? (
                      <Skeleton className={skeletonSizes[headerIndex % skeletonSizes.length]} />
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!todos &&
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className='h-12'>
                  {table.getHeaderGroups()[0].headers.map((_, cellIndex) => (
                    <TableCell key={`skeleton-cell-${cellIndex}`}>
                      <Skeleton className={skeletonSizes[cellIndex % skeletonSizes.length]} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {todos && (
              table
                .getRowModel()
                .rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
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
    </div>
  )
}
