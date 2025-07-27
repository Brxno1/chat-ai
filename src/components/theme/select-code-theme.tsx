'use client'

import { codeThemes } from '@/components/theme/code-theme'
import { useThemeStore } from '@/store/theme'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/utils'

export function SelectCodeTheme() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useThemeStore()

  return (
    <Select
      value={theme}
      onValueChange={setTheme}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className="w-fit border-none shadow-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground">
        <SelectValue />
        <ChevronDown
          size={16}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </SelectTrigger>
      <SelectContent align="end" className="bg-card">
        {codeThemes.map((themeOption) => (
          <SelectItem key={themeOption.label} value={themeOption.label}>
            {themeOption.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}