'use client'

import { useSessionUser } from "@/context/user"
import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UnreadNotification } from "./unread"
import { ReadNotification } from "./read"
import { CountNotifications } from "./count"
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from "../ui/input"

export function Notifications() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

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

  const filteredNotifications = table.getFilteredRowModel().rows.map(row => row.original)

  const unreadNotifications = filteredNotifications.filter((notification) => !notification.readAt)
  const readNotifications = filteredNotifications.filter((notification) => notification.readAt)

  const [unreadCount, readCount] = [
    unreadNotifications.length > 0 && `(${unreadNotifications.length})`,
    readNotifications.length > 0 && `(${readNotifications.length})`
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" className="relative border border-input" variant="ghost">
          <Bell size={16} />
          <CountNotifications total={unreadNotifications.length} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        className="max-h-[70vh] md:max-h-[60rem] space-y-1.5 w-full sm:w-96 mt-3 rounded-xl p-0.5 border border-input shadow-lg transition-all duration-200 animate-in fade-in-80"
      >
        <header className="flex flex-col items-center justify-center w-full p-2 border-b border-input">
          <h1 className="text-lg font-semibold">Notificações</h1>
          <div className="p-2 w-full">
            <div className="relative flex items-center justify-center">
              <Input
                type="text"
                placeholder="Pesquisar notificações..."
                className="w-full bg-transparent p-2 text-sm rounded-md border border-input placeholder:text-muted-foreground pr-8"
                value={globalFilter ?? ""}
                onChange={(ev) => setGlobalFilter(ev.target.value)}
              />
              {globalFilter && globalFilter.length > 0 && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar filtro"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </header>
        <Tabs defaultValue="unread">
          <TabsList className="grid w-full grid-cols-2 bg-card [&>button[data-state=active]]:bg-primary [&>button[data-state=active]]:text-primary-foreground">
            <TabsTrigger value="unread">
              Novas {unreadCount}
            </TabsTrigger>
            <TabsTrigger value="read">Lidas {readCount}</TabsTrigger>
          </TabsList>
          <TabsContent value="unread">
            <UnreadNotification unreadNotifications={unreadNotifications} setIsOpen={setIsOpen} />
          </TabsContent>
          <TabsContent value="read">
            <ReadNotification readNotifications={readNotifications} setIsOpen={setIsOpen} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}