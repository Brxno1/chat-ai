'use client'

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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { formatDistanceToNow } from '@/lib/format-distance-to-now'

import { Todo } from '../types-todo'
import { BadgeStatus } from './badge-status'

const data: Todo[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    status: 'finished',
    title: 'Aprender React',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    status: 'pending',
    title: 'Estudar Next.js',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-02'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    status: 'cancelled',
    title: 'Estudar Tailwind CSS',
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    status: 'pending',
    title: 'Estudar TypeScript',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-02'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    status: 'cancelled',
    title: 'Estudar Node.js',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-02'),
  },
]

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
    id: 'status',
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const { status } = row.original

      return (
        <div className="flex items-center justify-center">
          <BadgeStatus status={status} />
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const statusOrder = { finished: 1, pending: 2, cancelled: 3 }
      return (
        statusOrder[rowA.original.status] - statusOrder[rowB.original.status]
      )
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
          {new Intl.DateTimeFormat('pt-BR').format(createdAt)}
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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações para o Todo</DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(todo.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Marcar como finalizado
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:dark:bg-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function TodoDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
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
              .map((column) => {
                return (
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
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <Table>
          <TableHeader className="">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
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
