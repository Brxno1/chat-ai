'use client'

import { MoreHorizontal } from 'lucide-react'
import React from 'react'

import { CopyTextComponent } from '@/components/copy-text-component'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { UpdateTodo } from '../update-form'
import { CancelTodo } from './cancel-todo'
import { DeleteTodo } from './delete-todo'
import { MarkTodoAsDone } from './todo-as-done'
import { ActionsForTodoProps } from './types'

export function ActionsForTodo({ todo }: ActionsForTodoProps) {
  const [open, setOpen] = React.useState(false)

  const handleCloseDropdownByActions = () => {
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <CopyTextComponent
              textForCopy={todo.title}
              onCloseComponent={handleCloseDropdownByActions}
              className="cursor-pointer justify-between hover:bg-muted"
              iconPosition="right"
            >
              <span>Copiar todo</span>
            </CopyTextComponent>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <MarkTodoAsDone
            todo={todo}
            onCloseDropdown={handleCloseDropdownByActions}
          />
          <UpdateTodo
            todo={todo}
            onCloseDropdown={handleCloseDropdownByActions}
          />
          <CancelTodo
            todo={todo}
            onCloseDropdown={handleCloseDropdownByActions}
          />
          <DeleteTodo
            todo={todo}
            onCloseDropdown={handleCloseDropdownByActions}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
