'use client'

import { useSessionUser } from '@/context/user'
import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet'
import { UnreadNotification } from './unread'
import { ReadNotification } from './read'
import { CountNotifications } from './count'
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from '../ui/input'

export function NotificationsMobile() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [globalFilter, setGlobalFilter] = React.useState('')

  const { notifications, user } = useSessionUser()

  if (!notifications || !user) return null

  const table = useReactTable({
    data: notifications,
    columns: [
      {
        id: 'content',
        accessorKey: 'content',
      },
      {
        id: 'category',
        accessorKey: 'category',
      },
    ],
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const filteredNotifications = table
    .getFilteredRowModel()
    .rows.map((row) => row.original)

  const unreadNotifications = filteredNotifications.filter(
    (notification) => !notification.readAt,
  )
  const readNotifications = filteredNotifications.filter(
    (notification) => notification.readAt,
  )

  const [unreadCount, readCount] = [
    unreadNotifications.length > 0 && `(${unreadNotifications.length})`,
    readNotifications.length > 0 && `(${readNotifications.length})`,
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div
        data-open={isOpen}
        className="fixed inset-0 z-50 backdrop-blur-sm data-[open=false]:hidden"
        aria-hidden="true"
      />
      <SheetTrigger asChild>
        <Button
          size="icon"
          disabled
          className="relative border border-input"
          variant="ghost"
        >
          <Bell size={16} />
          <CountNotifications total={unreadNotifications.length} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="max-h-[100svh] rounded-2xl border border-input p-1"
      >
        <SheetHeader className="mt-1.5 flex flex-col items-center justify-center pb-2">
          <SheetTitle className="text-base sm:text-lg">Notificações</SheetTitle>
          <div className="w-full px-2 py-1">
            <div className="relative flex items-center justify-center">
              <Input
                type="text"
                placeholder="Pesquisar..."
                className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 pr-8 text-sm placeholder:text-muted-foreground"
                value={globalFilter ?? ''}
                onChange={(ev) => setGlobalFilter(ev.target.value)}
              />
              {globalFilter && globalFilter.length > 0 && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar filtro"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </SheetHeader>
        <Tabs defaultValue="unread">
          <TabsList className="mt-1 grid w-full grid-cols-2 bg-card [&>button[data-state=active]]:bg-primary [&>button[data-state=active]]:text-primary-foreground">
            <TabsTrigger value="unread" className="text-sm">
              Novas {unreadCount}
            </TabsTrigger>
            <TabsTrigger value="read" className="text-sm">
              Lidas {readCount}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="unread">
            <UnreadNotification
              unreadNotifications={unreadNotifications}
              setIsOpen={setIsOpen}
            />
          </TabsContent>
          <TabsContent value="read">
            <ReadNotification
              readNotifications={readNotifications}
              setIsOpen={setIsOpen}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
