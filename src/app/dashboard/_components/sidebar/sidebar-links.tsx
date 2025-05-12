'use client'

import { LucideIcon } from 'lucide-react'

import { SidebarNavLink } from '@/components/dashboard/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/utils/utils'

interface LinkItem {
  href: string
  icon: LucideIcon
  label: string
  onClick?: () => void
}

interface SidebarLinksProps {
  linksOptions: LinkItem[]
  isActiveLink: (path: string) => boolean
  className?: string
  side?: 'left' | 'right'
  sideOffset?: number
}

export function SidebarLinks({
  linksOptions,
  isActiveLink,
  className,
  side = 'right',
  sideOffset = 5,
}: SidebarLinksProps) {
  return (
    <>
      {linksOptions.map((option) => (
        <Tooltip key={option.href} disableHoverableContent>
          <TooltipTrigger asChild>
            <div className="w-full">
              <SidebarNavLink
                href={option.href}
                active={isActiveLink(option.href)}
                className="justify-center"
                onClick={option.onClick}
              >
                <option.icon className="size-5" />
                <span className="sr-only">{option.label}</span>
              </SidebarNavLink>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side={side}
            sideOffset={sideOffset}
            className={cn('text-sm font-bold', className)}
          >
            <p>{option.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </>
  )
}
