import { Todo } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { ContainerWrapper } from '@/components/container'
import { TooltipWrapper } from '@/components/tooltip-wrapper'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDateToLocale, formatDistanceToNow } from '@/utils/format'

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
    header: ({ column }) => {
      return (
        <ContainerWrapper
          type="button"
          className="flex cursor-pointer items-center justify-center gap-2 hover:text-accent-foreground max-md:justify-start"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Título</span>
          <ArrowUpDown size={16} className="size-4" />
        </ContainerWrapper>
      )
    },
    cell: ({ row }) => {
      const { title } = row.original

      return (
        <ContainerWrapper className="flex justify-center max-md:justify-start">
          <span className="max-w-[10rem] truncate capitalize">{title}</span>
        </ContainerWrapper>
      )
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    enableSorting: true,
    header: ({ column }) => (
      <ContainerWrapper
        type="button"
        className="flex cursor-pointer items-center justify-center gap-0 hover:text-accent-foreground md:gap-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span className="truncate text-nowrap max-md:max-w-[3rem]">
          Criado em
        </span>
        <ArrowUpDown size={16} className="size-4" />
      </ContainerWrapper>
    ),
    cell: ({ row }) => {
      const { createdAt } = row.original

      return (
        <TooltipWrapper
          content={formatDateToLocale(createdAt)}
          side="top"
          disableHoverableContent={false}
          asChild
        >
          <ContainerWrapper className="flex justify-center">
            <span className="font-medium">
              {formatDistanceToNow(createdAt)}
            </span>
          </ContainerWrapper>
        </TooltipWrapper>
      )
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    enableSorting: true,
    header: ({ column }) => {
      return (
        <ContainerWrapper
          type="button"
          className="flex cursor-pointer items-center justify-center gap-2 text-nowrap hover:text-accent-foreground max-md:hidden"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Atualizado em
          <ArrowUpDown size={16} className="size-4" />
        </ContainerWrapper>
      )
    },
    cell: ({ row }) => {
      const { updatedAt } = row.original

      return (
        <TooltipWrapper
          content={formatDateToLocale(updatedAt)}
          side="top"
          disableHoverableContent={false}
        >
          <span className="font-medium max-md:hidden">
            {formatDistanceToNow(updatedAt)}
          </span>
        </TooltipWrapper>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    size: 50,
    header: () => (
      <ContainerWrapper className="flex justify-center max-md:justify-start">
        Ações
      </ContainerWrapper>
    ),
    cell: ({ row }) => {
      const todo = row.original

      return (
        <ContainerWrapper className="flex justify-center max-md:justify-start">
          <ActionsForTodo todo={todo} />
        </ContainerWrapper>
      )
    },
  },
]
