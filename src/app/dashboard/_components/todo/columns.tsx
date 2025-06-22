import { Todo } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { ContainerWrapper } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDistanceToNow } from '@/utils/format'

import { ActionsForTodo } from './actions-components/actions'
import { BadgeStatus } from './badge-status'

export const columns: ColumnDef<Todo>[] = [
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    size: 50,
    header: ({ table }) => (
      <div>
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
    size: 100,
    header: () => (
      <Button
        variant="ghost"
        className="cursor-default hover:bg-transparent"
        aria-label="Status"
      >
        Status
      </Button>
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
      type TodoStatus = 'finished' | 'pending' | 'cancelled'

      const statusOrder = new Map<TodoStatus, number>([
        ['finished', 1],
        ['pending', 2],
        ['cancelled', 3],
      ])

      const getStatus = (status: string): TodoStatus => {
        const normalized = status.toLowerCase() as TodoStatus
        if (!statusOrder.has(normalized)) {
          console.log(`Invalid status: ${status}`)
          return 'pending'
        }
        return normalized
      }

      return (
        (statusOrder.get(getStatus(rowA.original.status)) ?? 0) -
        (statusOrder.get(getStatus(rowB.original.status)) ?? 0)
      )
    },
  },
  {
    id: 'title',
    accessorKey: 'title',
    enableSorting: true,
    size: 200,
    maxSize: 200,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="w-full text-center hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label="Título"
        >
          Título
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => {
      const { title } = row.original

      return (
        <ContainerWrapper className="flex items-center justify-center">
          <span className="truncate capitalize">{title}</span>
        </ContainerWrapper>
      )
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    enableSorting: true,
    size: 200,
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        aria-label="Criado em"
      >
        Criado em
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const { createdAt } = row.original

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-medium">
              {formatDistanceToNow(createdAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent aria-label="Data de criação" className="font-bold">
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
    size: 200,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          aria-label="Atualizado em"
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
            <span className="font-medium">
              {formatDistanceToNow(updatedAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent
            aria-label="Data de atualização"
            className="font-bold"
          >
            {new Date(updatedAt).toLocaleString()}
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    size: 100,
    header: () => (
      <Button
        variant="ghost"
        className="cursor-default hover:bg-transparent"
        aria-label="Ações"
      >
        Ações
      </Button>
    ),
    cell: ({ row }) => {
      const todo = row.original

      return <ActionsForTodo todo={todo} />
    },
  },
]
